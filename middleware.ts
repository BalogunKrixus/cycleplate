import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/* Supabase stores the session in cookies named sb-<project ref>-auth-token,
   sometimes split across .0 and .1 when it outgrows one cookie. */
const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

/* How long the session refresh gets before it is abandoned. Generous for a call
   that normally takes tens of milliseconds, and far below the 25 seconds Vercel
   allows a middleware invocation before it kills it. */
const FETCH_TIMEOUT_MS = 2000;
const TOTAL_TIMEOUT_MS = 2500;

/* Set on the request when Supabase has just failed to answer, so the render
   behind this does not spend its own deadline rediscovering that. Read by
   getViewer. A header rather than anything shared, because the middleware and
   the render are separate invocations with nothing between them but the
   request. */
export const UNREACHABLE_HEADER = "x-cp-supabase-unreachable";

/* Refreshes the auth cookie on navigation. Without this a session quietly
 * expires mid visit and someone finds their reply rejected after writing it.
 *
 * Access is not decided here. /admin is guarded by the page, and the database
 * policies are what actually stop a non admin acting like one.
 *
 * Two rules keep a Supabase problem from becoming a site outage, which is what
 * happened on 2 September: Supabase stopped answering, supabase-js retried the
 * way it is meant to, and the retries ran past the 25 second ceiling on a
 * middleware invocation. Every request through this file then returned 504 —
 * including the home page and the journal, which have nothing to do with
 * accounts. getViewer already treats a Supabase failure as "nobody is signed
 * in" for exactly this reason; the middleware had never been given the same
 * treatment, and it sits in front of everything.
 *
 *   1. Nobody signed in, nothing to refresh. A visitor with no auth cookie has
 *      no session to keep alive, so there is no reason to ask Supabase about
 *      one. That is most of the traffic to a marketing site, and it now never
 *      touches the network at all — faster on a good day, and untouched on a
 *      bad one.
 *
 *   2. The refresh is on a clock. Each fetch is aborted after a few seconds and
 *      the whole attempt is capped, so a slow or missing Supabase costs a
 *      fraction of a second rather than the request. The cost of giving up is
 *      that a signed in member's cookie is not refreshed on that one request,
 *      and at worst they look signed out until Supabase answers again. A member
 *      briefly seeing a Join button is a far better failure than a site of 504s.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  const signedIn = request.cookies
    .getAll()
    .some((cookie) => AUTH_COOKIE.test(cookie.name));
  if (!signedIn) return NextResponse.next({ request });

  try {
    return await withTimeout(refresh(request, url, key), TOTAL_TIMEOUT_MS);
  } catch (error) {
    /* Logged rather than swallowed silently, because "members keep getting
       signed out" needs to be findable in the logs. */
    console.error(
      "middleware: session refresh gave up:",
      error instanceof Error ? error.message : error,
    );

    const headers = new Headers(request.headers);
    headers.set(UNREACHABLE_HEADER, "1");
    return NextResponse.next({ request: { headers } });
  }
}

async function refresh(request: NextRequest, url: string, key: string) {
  /* Rebuilt inside setAll rather than mutated, which is what carries a
     refreshed cookie through to the server components rendering this same
     request. */
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    /* Supabase's own fetch, with a deadline. Without this the abort has nothing
       to act on: supabase-js retries a failed network call, and it is the
       retries rather than any single attempt that ran out the clock. */
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }),
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }: CookieToSet) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms),
    ),
  ]);
}

export const config = {
  matcher: [
    /* Everything except static assets and image requests. */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
