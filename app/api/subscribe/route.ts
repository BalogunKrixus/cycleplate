import { NextResponse, type NextRequest } from "next/server";

/* Form submissions: newsletter, community and partner.
 *
 * The browser posts here rather than straight to a provider: Buttondown's embed
 * endpoint is built for form navigation and does not answer cross-origin
 * fetches, and neither destination can be called with a credential from the
 * browser without exposing it.
 *
 * Destinations, and which one a form cannot do without:
 *
 *   newsletter  Buttondown (required), spreadsheet (best effort)
 *   community   spreadsheet (required), Buttondown (best effort)
 *   partner     spreadsheet (required) — the script also emails the enquiry
 *
 * Environment: BUTTONDOWN_API_KEY, SHEET_WEBHOOK_URL.
 *
 * This was a bare Vercel function at /api/subscribe.js. Next.js owns routing
 * now, so it lives here instead; the delivery logic is unchanged, because it
 * took several rounds against the real providers to get right.
 */

const SUBSCRIBERS = "https://api.buttondown.com/v1/subscribers";
const FORMS = ["newsletter", "community", "partner"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FormKind = (typeof FORMS)[number];

type Failure = Error & {
  already?: boolean;
  status?: number;
  host?: string | null;
  detail?: string;
};

function hostOf(u: string) {
  try {
    return new URL(u).host;
  } catch {
    return null;
  }
}

function createSubscriber(key: string, payload: Record<string, unknown>) {
  return fetch(SUBSCRIBERS, {
    method: "POST",
    headers: { Authorization: `Token ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* Two things vary between accounts, and neither is worth failing a sign up
   over: Buttondown renamed the email field between API revisions, and tags (and
   possibly metadata) need a paid plan, which a free account rejects outright.
   Try the richest shape first and drop whatever the account cannot take, so a
   free plan still subscribes people and a paid one keeps the tags. */
async function subscribe(
  key: string,
  email: string,
  tags: string[],
  metadata: Record<string, string>,
) {
  const shapes = [{ tags, metadata }, { metadata }, {}];
  let field = "email_address";

  for (const extra of shapes) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await createSubscriber(key, { [field]: email, ...extra });
      if (r.ok) return { ok: true as const };

      const detail = await r.text().catch(() => "");
      if (/already/i.test(detail)) return { ok: false as const, already: true };

      if (r.status === 400 && field === "email_address" && attempt === 0) {
        field = "email"; // older revisions of the API name it this way
        continue;
      }
      if (/feature_disabled/.test(detail)) break; // drop a feature, try again
      return { ok: false as const, status: r.status, detail };
    }
  }
  return { ok: false as const, status: 0, detail: "no accepted payload shape" };
}

/* Apps Script web app: appends a row and emails partner enquiries. It answers
   with a redirect to googleusercontent.com, which fetch follows for us. */
async function appendRow(url: string, row: Record<string, unknown>) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw Object.assign(new Error("sheet"), {
      status: r.status,
      host: hostOf(r.url),
      detail,
    }) as Failure;
  }
}

/* GET /api/subscribe?check=1 — reports whether the spreadsheet webhook answers
   without a Google session, which is the part that tends to be misconfigured.
   Reports the host it ended up at and never the URL, which is a secret. */
async function checkSheet(sheetUrl: string | undefined) {
  if (!sheetUrl) return { configured: false, hint: "SHEET_WEBHOOK_URL is not set" };

  const out: Record<string, unknown> = {
    configured: true,
    endsWithExec: /\/exec$/.test(sheetUrl.trim()),
  };

  try {
    const r = await fetch(sheetUrl, { method: "GET" });
    const body = await r.text().catch(() => "");
    out.status = r.status;
    out.finalHost = hostOf(r.url);
    out.looksLikeSignIn =
      /accounts\.google\.com|ServiceLogin|Sign in to continue/i.test(body);

    let answer: { ok?: boolean; sheet?: string } | null = null;
    try {
      answer = JSON.parse(body);
    } catch {
      /* An HTML sign in page is the common case here, and it is exactly what
         looksLikeSignIn above is for. */
    }

    out.reachedScript = !!answer?.ok;
    if (out.reachedScript) out.boundSheet = answer?.sheet ?? null;

    out.hint = !out.reachedScript
      ? out.looksLikeSignIn || out.status === 401
        ? 'deployment is not shared with "Anyone"'
        : "reached Google but not the script; check the deployment is current"
      : out.boundSheet
        ? `ready: reachable and bound to ${out.boundSheet}`
        : "reachable, but the script is standalone rather than bound to a spreadsheet, so no row can be written";
  } catch (err) {
    out.error = String((err as Error).message).slice(0, 140);
  }

  return out;
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("check")) {
    return NextResponse.json(await checkSheet(process.env.SHEET_WEBHOOK_URL));
  }
  return NextResponse.json(
    { error: "method not allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "unknown form" }, { status: 400 });
  }

  const form = FORMS.find((f) => f === body.form) as FormKind | undefined;
  if (!form) return NextResponse.json({ error: "unknown form" }, { status: 400 });

  // honeypot: accept, then drop
  if (body.cp_hp) return NextResponse.json({ ok: true });

  const email = String(body.email ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  // the browser checks these too, but a POST does not have to come from the page
  if (form === "community" && !body.display_name) {
    return NextResponse.json({ error: "missing display name" }, { status: 400 });
  }
  if (form === "partner" && !body.org_name) {
    return NextResponse.json({ error: "missing organisation" }, { status: 400 });
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  const sheetUrl = process.env.SHEET_WEBHOOK_URL;

  const tags = [form as string];
  if (body.circle) {
    tags.push(
      ...body.circle
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }

  const metadata: Record<string, string> = { source: form };
  if (body.first_name) metadata.first_name = body.first_name;
  if (body.display_name) metadata.display_name = body.display_name;
  // also carried as metadata so the circles survive on plans without tags
  if (body.circle) metadata.circles = body.circle;

  const { form: _f, cp_hp: _h, ...fields } = body;
  const row = { form, submitted_at: new Date().toISOString(), ...fields };

  /* Which destination has to succeed for the submission to count, and which is
     a bonus.

     The spreadsheet is the record for joining the community and for partner
     enquiries, so those need it. Buttondown comes second there and an address
     already on the list is not a failure: someone joining the community who
     already takes the newsletter is an ordinary case, and their circles still
     have to be written down.

     A newsletter sign up is the other way round. Buttondown is the point of it,
     and being on the list already is worth saying. */
  const sheet = sheetUrl ? "sheet" : null;
  const buttondown = key ? "buttondown" : null;
  const [primary, secondary] =
    // an enquiry is not consent to join a mailing list, so it never reaches one
    form === "partner"
      ? [sheet, null]
      : form === "newsletter"
        ? buttondown
          ? [buttondown, sheet]
          : [sheet, null]
        : sheet
          ? [sheet, buttondown]
          : [buttondown, null];

  if (!primary) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const send = async (dest: string) => {
    if (dest === "sheet") return appendRow(sheetUrl!, row);
    const r = await subscribe(key!, email, tags, metadata);
    if (!r.ok) throw Object.assign(new Error("buttondown"), r) as Failure;
  };

  try {
    await send(primary);
  } catch (err) {
    const failure = err as Failure;
    if (failure.already) {
      return NextResponse.json({ error: "already" }, { status: 409 });
    }
    console.error(
      "%s %d (%s): %s",
      primary,
      failure.status ?? 0,
      failure.host ?? "-",
      String(failure.detail ?? failure.message).slice(0, 240),
    );
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }

  /* A failure here is logged but not surfaced: the submission is already
     recorded, so telling the visitor it failed would be the same lie in
     reverse. Being already subscribed is not a failure worth logging. */
  if (secondary) {
    try {
      await send(secondary);
    } catch (err) {
      const failure = err as Failure;
      if (!failure.already) {
        console.error(
          "%s (secondary) %d: %s",
          secondary,
          failure.status ?? 0,
          String(failure.detail ?? failure.message).slice(0, 200),
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
