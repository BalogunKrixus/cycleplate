/* Sending mail that is not an auth email.
 *
 * Server only. There is no `import "server-only"` guard because that is a
 * dependency this project does not have and one import is not worth adding
 * one; nothing here is imported from a client component, and the API key it
 * reads would be undefined in a browser regardless.
 *
 * Supabase's SMTP settings send Supabase's own mail -- confirmations, password
 * resets -- and expose no way to send anything else through them, so this
 * cannot be an extension of that. It posts to Resend's API using the domain
 * already verified for the auth mail, which means no new provider, no new DNS
 * and the same From address members already see.
 *
 * RESEND_API_URL exists so the send path can be pointed at a stub and actually
 * exercised in a test, rather than being the one piece nobody ever runs until
 * it runs against three hundred real inboxes.
 */

const API = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

/* Matches the Supabase SMTP sender, which has to be on the verified Resend
   domain. Replies go nowhere, so the footer points at a real address. */
const FROM = process.env.NOTIFICATION_FROM ?? "CyclePlate <hello@contact.hellocycleplate.com>";
const REPLY_TO = process.env.NOTIFICATION_REPLY_TO ?? "contact@hellocycleplate.com";

export interface Envelope {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface SendReport {
  sent: number;
  failed: number;
  firstError?: string;
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/* Sent in small batches with a pause between them.
 *
 * Resend rate limits, and more to the point a loop that fires three hundred
 * requests at once will have most of them rejected and report a disaster that
 * did not happen. Failures are counted rather than thrown: one bad address
 * should not stop the other two hundred and ninety nine.
 */
export async function sendBatch(
  envelopes: Envelope[],
  { batchSize = 8, pauseMs = 550 }: { batchSize?: number; pauseMs?: number } = {},
): Promise<SendReport> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: 0, failed: envelopes.length, firstError: "No RESEND_API_KEY is set." };

  let sent = 0;
  let failed = 0;
  let firstError: string | undefined;

  for (let i = 0; i < envelopes.length; i += batchSize) {
    const slice = envelopes.slice(i, i + batchSize);

    const results = await Promise.all(
      slice.map(async (envelope) => {
        try {
          const res = await fetch(API, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: FROM,
              reply_to: REPLY_TO,
              to: [envelope.to],
              subject: envelope.subject,
              html: envelope.html,
              text: envelope.text,
            }),
            signal: AbortSignal.timeout(10_000),
          });

          if (res.ok) return null;
          const detail = await res.text().catch(() => "");
          return `${res.status} ${detail.slice(0, 160)}`;
        } catch (error) {
          return error instanceof Error ? error.message : "send failed";
        }
      }),
    );

    for (const error of results) {
      if (error === null) sent += 1;
      else {
        failed += 1;
        firstError ??= error;
      }
    }

    if (i + batchSize < envelopes.length) {
      await new Promise((r) => setTimeout(r, pauseMs));
    }
  }

  return { sent, failed, firstError };
}
