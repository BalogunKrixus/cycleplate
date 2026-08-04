import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getViewer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Team sign in" };

/* The moderators' door.
 *
 * It is the same accounts table and the same password check as everybody else,
 * because a second authentication system is a second thing to get wrong. What
 * this page adds is a way in that does not route through the member sign in and
 * then bounce, and an honest answer when the account is real but not an admin.
 * The previous behaviour, redirecting a non admin to the feed without a word,
 * is indistinguishable from the site being broken.
 *
 * It is not a security boundary and does not pretend to be. Every admin action
 * is checked again by row level security in Postgres, which is what actually
 * stops a member moderating.
 */
export default async function AdminLoginPage() {
  const viewer = await getViewer();

  if (viewer?.role === "admin") redirect("/admin");

  return (
    <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
        CyclePlate Team
      </p>
      <h1 className="mt-3 text-[36px] leading-tight">Moderator sign in</h1>

      {viewer ? (
        <>
          <p className="mt-3 text-[15px] text-muted">
            You are signed in as {viewer.display_name}, which is a member
            account. Moderation is limited to team accounts.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/app" className="btn btn-primary">
              Go to the community
            </Link>
            <p className="text-center text-[13px] text-muted">
              If this should be a team account, ask an existing admin to grant
              it.
            </p>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-[15px] text-muted">
            For the people who keep this community kind. Members sign in{" "}
            <Link href="/auth/sign-in" className="underline">
              here
            </Link>
            .
          </p>
          <AdminLoginForm />
        </>
      )}
    </main>
  );
}
