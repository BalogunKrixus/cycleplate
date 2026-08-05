import { cookies } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";
import type { Profile } from "@/lib/types";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/* Server side Supabase client. Reads the session from cookies so server
   components can render the feed already knowing who is looking at it. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(
    url,
    key,
    {
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
    const supabase = await createClient();

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
  return viewer?.role === "admin" || viewer?.role === "super_admin"
    ? viewer
    : null;
}

/* Granting somebody else a role is a different question from moderating, and
   only super admins get to answer it. Enforced again by row level security, so
   this decides what to render rather than what is allowed. */
export async function requireSuperAdmin(): Promise<Profile | null> {
  const viewer = await getViewer();
  return viewer?.role === "super_admin" ? viewer : null;
}
