import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/* Where every emailed link lands: confirming an address, and resetting a
 * password.
 *
 * Supabase sends people here with a one time code rather than a session, and
 * the code has to be exchanged server side for the cookies that keep somebody
 * signed in. Without this the link would deposit them on a page holding a code
 * nothing reads, and they would have to sign in again by hand wondering whether
 * confirming had worked at all.
 *
 * `next` says where to go once that is done. A password reset needs to land on
 * the form that sets the new one, and it needs the session established first or
 * that form has nothing to update. Only relative paths are honoured: `next`
 * arrives from a URL, and forwarding somebody to whatever address a link
 * happens to carry is how an open redirect gets built by accident.
 *
 * Anything unexpected sends them to sign in rather than showing an error page.
 * A link that has already been used, or has expired, is not a fault worth
 * explaining: signing in is what they wanted to do either way.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  const requested = searchParams.get("next") ?? "/app";
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "/app";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/sign-in`);
}
