/* Form submissions: newsletter, community and partner.

   The browser posts here rather than straight to a provider: Buttondown's
   embed endpoint is built for form navigation and does not answer
   cross-origin fetches, and neither destination can be called with a
   credential from the browser without exposing it.

   Destinations, and which one a form cannot do without:

     newsletter  Buttondown (required), spreadsheet (best effort)
     community   spreadsheet (required), Buttondown (best effort)
     partner     spreadsheet (required) — the script also emails the enquiry

   Environment: BUTTONDOWN_API_KEY, SHEET_WEBHOOK_URL. */

const SUBSCRIBERS = "https://api.buttondown.com/v1/subscribers";
const FORMS = { newsletter: "newsletter", community: "community", partner: "partner" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

function createSubscriber(key, payload) {
  return fetch(SUBSCRIBERS, {
    method: "POST",
    headers: { Authorization: "Token " + key, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* Two things vary between accounts, and neither is worth failing a sign up over:
   Buttondown renamed the email field between API revisions, and tags (and
   possibly metadata) need a paid plan, which a free account rejects outright.
   Try the richest shape first and drop whatever the account cannot take, so a
   free plan still subscribes people and a paid one keeps the tags. */
async function subscribe(key, email, tags, metadata) {
  const shapes = [{ tags, metadata }, { metadata }, {}];
  let field = "email_address";

  for (const extra of shapes) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await createSubscriber(key, { [field]: email, ...extra });
      if (r.ok) return { ok: true };

      const detail = await r.text().catch(() => "");
      if (/already/i.test(detail)) return { ok: false, already: true };

      if (r.status === 400 && field === "email_address" && attempt === 0) {
        field = "email"; // older revisions of the API name it this way
        continue;
      }
      if (/feature_disabled/.test(detail)) break; // drop a feature, try again
      return { ok: false, status: r.status, detail };
    }
  }
  return { ok: false, status: 0, detail: "no accepted payload shape" };
}

/* Apps Script web app: appends a row and emails partner enquiries. It answers
   with a redirect to googleusercontent.com, which fetch follows for us. */
async function appendRow(url, row) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const detail = await r.text().catch(() => "");
    throw Object.assign(new Error("sheet"), { status: r.status, host: hostOf(r.url), detail });
  }
}

function hostOf(u) {
  try { return new URL(u).host; } catch { return null; }
}

/* GET /api/subscribe?check=1 — reports whether the spreadsheet webhook answers
   without a Google session, which is the part that tends to be misconfigured.
   Reports the host it ended up at and never the URL, which is a secret. */
async function checkSheet(sheetUrl) {
  if (!sheetUrl) return { configured: false, hint: "SHEET_WEBHOOK_URL is not set" };
  const out = { configured: true, endsWithExec: /\/exec$/.test(sheetUrl.trim()) };
  try {
    const r = await fetch(sheetUrl, { method: "GET" });
    const body = await r.text().catch(() => "");
    out.status = r.status;
    out.finalHost = hostOf(r.url);
    out.looksLikeSignIn = /accounts\.google\.com|ServiceLogin|Sign in to continue/i.test(body);

    let answer = null;
    try { answer = JSON.parse(body); } catch {}
    out.reachedScript = !!(answer && answer.ok === true);
    if (out.reachedScript) out.boundSheet = answer.sheet || null;

    out.hint = !out.reachedScript
      ? (out.looksLikeSignIn || out.status === 401
        ? 'deployment is not shared with "Anyone"'
        : "reached Google but not the script; check the deployment is current")
      : out.boundSheet
        ? "ready: reachable and bound to " + out.boundSheet
        : "reachable, but the script is standalone rather than bound to a spreadsheet, so no row can be written";
  } catch (err) {
    out.error = String(err.message).slice(0, 140);
  }
  return out;
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    if (String(req.url || "").includes("check=1")) {
      return res.status(200).json(await checkSheet(process.env.SHEET_WEBHOOK_URL));
    }
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const body = readBody(req);
  const form = FORMS[body.form];
  if (!form) return res.status(400).json({ error: "unknown form" });
  if (body.cp_hp) return res.status(200).json({ ok: true }); // honeypot: accept, then drop

  const email = String(body.email || "").trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "invalid email" });

  // the browser checks these too, but a POST does not have to come from the page
  if (form === "community" && !body.display_name) return res.status(400).json({ error: "missing display name" });
  if (form === "partner" && !body.org_name) return res.status(400).json({ error: "missing organisation" });

  const key = process.env.BUTTONDOWN_API_KEY;
  const sheetUrl = process.env.SHEET_WEBHOOK_URL;

  const tags = [form];
  if (body.circle) tags.push(...body.circle.split(",").map(s => s.trim()).filter(Boolean));

  const metadata = { source: form };
  if (body.first_name) metadata.first_name = body.first_name;
  if (body.display_name) metadata.display_name = body.display_name;
  // also carried as metadata so the circles survive on plans without tags
  if (body.circle) metadata.circles = body.circle;

  const { form: _f, cp_hp: _h, ...fields } = body;
  const row = { form, submitted_at: new Date().toISOString(), ...fields };

  /* Which destination has to succeed for the submission to count, and which is
     a bonus. Sign ups go to Buttondown first because that is the destination
     that reliably answers, and reach the spreadsheet as a bonus: a sign up
     should not fail because a spreadsheet is misconfigured. A partner enquiry
     is not a mailing list sign up and has nowhere else to go, so it needs the
     spreadsheet and says so plainly when that is unavailable. */
  const sheet = sheetUrl ? "sheet" : null;
  const buttondown = key ? "buttondown" : null;
  const [primary, secondary] =
    form === "partner" ? [sheet, null] :
    buttondown ? [buttondown, sheet] : [sheet, null];

  if (!primary) return res.status(503).json({ error: "unconfigured" });

  const send = async (dest) => {
    if (dest === "sheet") return appendRow(sheetUrl, row);
    const r = await subscribe(key, email, tags, metadata);
    if (!r.ok) throw Object.assign(new Error("buttondown"), r);
  };

  try {
    await send(primary);
  } catch (err) {
    if (err.already) return res.status(409).json({ error: "already" });
    console.error("%s %d (%s): %s", primary, err.status || 0, err.host || "-", String(err.detail || err.message).slice(0, 240));
    return res.status(502).json({ error: "upstream" });
  }

  /* A failure here is logged but not surfaced: the submission is already
     recorded, so telling the visitor it failed would be the same lie in
     reverse. Being already subscribed is not a failure worth logging. */
  if (secondary) {
    try {
      await send(secondary);
    } catch (err) {
      if (!err.already) console.error("%s (secondary) %d: %s", secondary, err.status || 0, String(err.detail || err.message).slice(0, 200));
    }
  }

  return res.status(200).json({ ok: true });
};
