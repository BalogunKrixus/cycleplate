import type { Profile } from "@/lib/types";

/* Who counts as what.
 *
 * Splitting admin into admin and super_admin left four moderation actions and
 * three pieces of interface asking `role === "admin"`, which quietly stopped
 * being the question they meant. A super admin outranks a moderator and was
 * being refused by every one of them: no Admin link in the header, no remove or
 * pin control on a post, and "Not allowed." from the server if they reached one
 * anyway. The checks below are written once so the next role to be added is one
 * edit rather than a search.
 *
 * They are plain booleans, not type predicates. A predicate was the first
 * instinct, because the inline checks these replace narrowed `viewer` to
 * non-null as a side effect and the callers go on to read `viewer.id`. But
 * `viewer is Profile` would claim that failing the check means it is not a
 * profile, when a member is a profile and simply is not a moderator, and the
 * compiler duly narrowed a signed in member to `never`. Callers that need both
 * facts ask for both.
 *
 * None of this is access control. Row level security in Postgres decides what
 * is allowed; these decide what to draw and what sentence to show. */

/* Can remove posts, pin them and clear flags. */
export function isModerator(viewer: Profile | null | undefined): boolean {
  return viewer?.role === "admin" || viewer?.role === "super_admin";
}

/* Can hand somebody else a role. Deliberately narrower: moderating and granting
   privileges are different jobs, and every admin could do both until recently. */
export function isSuperAdmin(viewer: Profile | null | undefined): boolean {
  return viewer?.role === "super_admin";
}
