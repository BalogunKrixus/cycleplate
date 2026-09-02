import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

/* Where every emailed link lands: confirming an address, and resetting a
 * password.
 *
 * Supabase does not send a session in the link. It sends something that has to
 * be traded for one, server side, before the person is signed in. There are two
 * shapes of that and this handles both, because which one arrives depends on
 * how the email template is written and old links stay in inboxes for hours.
 *
 *   token_hash + type  Traded with verifyOtp. This is the one to prefer, and
 *                      the templates in docs/email-templates now send it. It
 *                      carries everything the exchange needs, so the link works
 *                      in whatever browser the person opens their mail in.
 *
 *   code               Traded with exchangeCodeForSession. PKCE: the matching
 *                      verifier was stored in a cookie by the browser that
 *                      asked, so the link only works in that same browser. Ask
 *                      for a reset on a phone, open the mail on a laptop, and
 *                      it fails through no fault of the person following it.
 *                      Kept because links already sent use it.
 *
 * `next` says where to go once that is done. A password reset has to land on
 * the form that sets the new one, and it needs the session established first or
 * that form has nothing to update. Only relative paths are honoured: `next`
 * arrives from a URL, and forwarding somebody to whatever address a link
 * happens to carry is how an open redirect gets built by accident.
 *
 * A link that has expired or has already been used is the common failure, not
 * the exotic one, and it used to drop people on the sign in page with nothing
 * said. Now the failure is carried through so the next page can explain it and
 * offer a fresh link.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  /* Redirect against the host the visitor actually typed. Behind a proxy the
     request URL can carry the deployment's own hostname, which is how somebody
     following a link to hellocycleplate.com ends up looking at a vercel.app
     address in the bar. */
  const origin = requestOrigin(request);

  const requested = searchParams.get("next") ?? "/app";
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/app";

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  /* Supabase can also bounce back here having refused the link itself, with the
     reason in the query rather than an exception to catch. */
  const returnedError =
    searchParams.get("error_code") ?? searchParams.get("error");

  if (!returnedError) {
    try {
      const supabase = await createClient();

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type,
          token_hash: tokenHash,
        });
        if (!error) return NextResponse.redirect(`${origin}${next}`);
        console.error("auth callback: verifyOtp failed:", error.message);
      } else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(`${origin}${next}`);
        console.error(
          "auth callback: exchangeCodeForSession failed:",
          error.message,
        );
      }
    } catch (error) {
      /* A Supabase that is unreachable or misconfigured lands here. The person
         following the link cannot do anything about it, so they get the same
         "ask for another" wording; the reason goes to the logs. */
      console.error(
        "auth callback threw:",
        error instanceof Error ? error.message : error,
      );
    }
  } else {
    console.error("auth callback: Supabase refused the link:", returnedError);
  }

  /* Failed. Where that is said depends on what they were trying to do: someone
     resetting a password needs the page that can send them a new link, and
     someone confirming an address needs the sign in page to say why it did not
     take. */
  const recovering = type === "recovery" || next.startsWith("/auth/reset-password");
  return NextResponse.redirect(
    recovering
      ? `${origin}/auth/forgot-password?expired=1`
      : `${origin}/auth/sign-in?error=link`,
  );
}

/* The address the visitor is actually on, not the one the platform routed to
   internally. */
function requestOrigin(request: NextRequest): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
