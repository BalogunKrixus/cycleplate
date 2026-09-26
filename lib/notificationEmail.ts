/* The notification email itself.
 *
 * Built here rather than in Supabase's template editor, because these are not
 * auth emails: Supabase only templates its own. It follows the reset email --
 * same lockup, same cream, same one clear button -- so a member who has had a
 * password reset from CyclePlate recognises this as the same sender.
 *
 * The unsubscribe line is not decoration and is not optional. It is the reason
 * the token exists, and it goes out with every single message.
 */

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Written text becomes paragraphs. Nobody composing a note to members should
   have to think about markup, and anything they type is escaped first, so a
   stray angle bracket cannot become an element. */
function paragraphs(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#2A1F17;">${escape(
          p,
        ).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

export function notificationHtml({
  body,
  link,
  linkLabel,
  unsubscribeUrl,
}: {
  body: string;
  link?: string;
  linkLabel: string;
  unsubscribeUrl: string;
}): string {
  const button = link
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
         <tr><td style="border-radius:999px;background:#A64A2F;">
           <a href="${escape(link)}"
              style="display:inline-block;padding:14px 30px;font-family:Inter,Helvetica,Arial,sans-serif;
                     font-size:16px;font-weight:600;color:#FFF8F0;text-decoration:none;">
             ${escape(linkLabel)}
           </a>
         </td></tr>
       </table>
       <p style="margin:0 0 8px;font-size:13px;color:#6B5D4F;">
         If the button does not work, paste this into your browser:
       </p>
       <p style="margin:0 0 24px;font-size:13px;word-break:break-all;">
         <a href="${escape(link)}" style="color:#A64A2F;">${escape(link)}</a>
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>CyclePlate</title></head>
<body style="margin:0;padding:0;background:#FAF6EF;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6EF;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#FFFCF5;border-radius:22px;padding:36px 32px;
                    font-family:Inter,Helvetica,Arial,sans-serif;">
        <tr><td>
          <p style="margin:0 0 26px;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#2A1F17;">
            Cycle<span style="color:#A64A2F;">Plate</span>
          </p>

          ${paragraphs(body)}
          ${button}

          <hr style="border:none;border-top:1px solid rgba(42,31,23,.12);margin:28px 0 18px;" />

          <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#6B5D4F;">
            You are getting this because you are a member of the CyclePlate
            community. Questions? Write to
            <a href="mailto:contact@hellocycleplate.com" style="color:#A64A2F;">contact@hellocycleplate.com</a>
            and a person will answer.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6B5D4F;">
            <a href="${escape(unsubscribeUrl)}" style="color:#6B5D4F;text-decoration:underline;">
              Stop getting these emails
            </a>
            — one click, no sign in, and it does not affect your account.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* A plain text copy, because a mail client that will not render HTML should
   still get the message and, more importantly, the unsubscribe link. */
export function notificationText({
  body,
  link,
  unsubscribeUrl,
}: {
  body: string;
  link?: string;
  unsubscribeUrl: string;
}): string {
  return [
    "CyclePlate",
    "",
    body.trim(),
    link ? `\nRead it here: ${link}` : "",
    "",
    "---",
    "You are getting this because you are a member of the CyclePlate community.",
    "Questions? Write to contact@hellocycleplate.com",
    `Stop getting these emails: ${unsubscribeUrl}`,
  ]
    .filter((l) => l !== "")
    .join("\n");
}
