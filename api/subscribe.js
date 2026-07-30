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

  const metadata = {};
  if (body.first_name) metadata.first_name = body.first_name;
  if (body.display_name) metadata.display_name = body.display_name;

  let r = await createSubscriber(key, { email_address: email, tags, metadata });
  let detail = r.ok ? "" : await r.text().catch(() => "");

  // Buttondown renamed this field between API revisions; fall back so the
  // account works on either. An "already subscribed" 400 is not a rename.
  if (!r.ok && r.status === 400 && !/already/i.test(detail)) {
    r = await createSubscriber(key, { email, tags, metadata });
    detail = r.ok ? "" : await r.text().catch(() => "");
  }

  if (r.ok) return res.status(200).json({ ok: true });
  if (/already/i.test(detail)) return res.status(409).json({ error: "already" });

  console.error("buttondown %d: %s", r.status, detail.slice(0, 300));
  return res.status(502).json({ error: "upstream" });
};
