import { cookies, headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Profile } from "@/lib/types";
import { UNREACHABLE_HEADER } from "@/middleware";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/* How long any one call to Supabase gets before it is abandoned.
 *
 * Without a deadline there is none: fetch waits as long as the other end takes,
 * and a Supabase that accepts the connection and then says nothing hangs the
 * render behind it until the platform kills the whole request. That is how the
 * site went down on 2 September — pages that need no database at all returned
 * 504 because something upstream of them was waiting on one.
 *
 * Generous for a call that normally takes tens of milliseconds, and far short
 * of the ceiling any of these run under. */
const REQUEST_TIMEOUT_MS = 2500;

/* The ceiling on getViewer as a whole, retries included. */
const VIEWER_TIMEOUT_MS = 3000;

/* Server side Supabase client. Reads the session from cookies so server
   components can render the feed already knowing who is looking at it. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(
    url,
    key,
    {
      /* Supabase's own fetch, with the deadline above attached. It goes here
         rather than around each call so nothing new can be written without it. */
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
          }),
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Called from a server component, where cookies cannot be written.
               The middleware refreshes the session instead, so this is safe to
               swallow. */
          }
        },
      },
    },
  );
}

/* The signed in profile, or null. Every caller needs the profile rather than
 * just the auth user, because role and display name live on the profile.
 *
 * This runs on every page in the site, because the header reads it to decide
 * whether to say Join or to show your handle. That makes it the one place where
 * a Supabase problem could take down pages that have nothing to do with the
 * community: an article about period pain does not need a database, and it
 * should not go down because one is missing or unreachable.
 *
 * So a failure here means "nobody is signed in" rather than an exception. The
 * cost is that a signed in member briefly looks signed out on the marketing
 * pages during an outage, which is a far better failure than a site of 500s.
 * The community pages call the client directly and still fail loudly, because
 * there a database problem is the whole story rather than an aside.
 */
export async function getViewer(): Promise<Profile | null> {
  try {
    /* The middleware just tried and failed. Trying again here would spend
       another three seconds to reach the same answer, on a page that has
       already decided to render signed out. */
    if ((await headers()).get(UNREACHABLE_HEADER)) return null;

    const supabase = await createClient();

    /* Capped as a whole, not just per call. Supabase retries a failed network
       call, which is the right thing to do and also means several deadlines can
       run back to back and add up to a wait nobody asked for. This is the
       header on every page in the site; it does not get to be slow. */
    return await withDeadline(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return (data as Profile) ?? null;
    });
  } catch (error) {
    /* Next signals control flow with exceptions: redirect, notFound, and the
       dynamic server usage thrown when reading cookies during prerender are all
       errors it expects to receive back. Swallowing those would quietly break
       the framework's own routing, so they go straight back up and only a real
       Supabase failure is handled here. */
    unstable_rethrow(error);

    console.error(
      "getViewer failed, treating the visitor as signed out:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/* Roles are also enforced by row level security in Postgres. This is for
   deciding what to render, not for deciding what is allowed. */
export async function requireAdmin(): Promise<Profile | null> {
  const viewer = await getViewer();
  return viewer?.role === "admin" ? viewer : null;
}

/* Runs the work, or gives up. Whichever finishes first wins; the loser is left
   to finish on its own and be ignored, because there is nothing useful to do
   with a Supabase answer that arrives after the page has been rendered. */
function withDeadline<T>(work: () => Promise<T>): Promise<T> {
  return Promise.race([
    work(),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Supabase did not answer in ${VIEWER_TIMEOUT_MS}ms`)),
        VIEWER_TIMEOUT_MS,
      ),
    ),
  ]);
}
