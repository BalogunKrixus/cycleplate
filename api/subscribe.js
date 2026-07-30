/* Newsletter and community sign ups.

   The browser posts here rather than straight to Buttondown: the embed
   endpoint is built for form navigation and does not answer cross-origin
   fetches, so calling it from JavaScript would report a failure for a
   subscription that actually succeeded. Proxying also keeps the API key on
   the server, where it belongs.

   Set BUTTONDOWN_API_KEY in the Vercel project's environment variables. */

const SUBSCRIBERS = "https://api.buttondown.com/v1/subscribers";
const TAGS = { newsletter: "newsletter", community: "community" };
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

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method not allowed" });
  }

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return res.status(503).json({ error: "unconfigured" });

  const body = readBody(req);
  const tag = TAGS[body.form];
  if (!tag) return res.status(400).json({ error: "unknown form" });
  if (body.company) return res.status(200).json({ ok: true }); // honeypot: accept, then drop

  const email = String(body.email || "").trim();
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "invalid email" });

  const tags = [tag];
  if (body.circle) tags.push(...body.circle.split(",").map(s => s.trim()).filter(Boolean));

  const metadata = { source: tag };
  if (body.first_name) metadata.first_name = body.first_name;
  if (body.display_name) metadata.display_name = body.display_name;
  // also carried as metadata so the circles survive on plans without tags
  if (body.circle) metadata.circles = body.circle;

  const result = await subscribe(key, email, tags, metadata);

  if (result.ok) return res.status(200).json({ ok: true });
  if (result.already) return res.status(409).json({ error: "already" });

  console.error("buttondown %d: %s", result.status, String(result.detail).slice(0, 300));
  return res.status(502).json({ error: "upstream" });
};
