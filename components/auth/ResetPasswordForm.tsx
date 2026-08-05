"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Primitives";
import { createClient } from "@/lib/supabase/client";

/* Setting the new password, after following the link from the email.
 *
 * The link puts a recovery session in place before this page runs, which is
 * what lets updateUser change the password without asking for the old one. If
 * that session is not there the link was already used or has expired, and
 * saying so plainly beats a form that accepts a new password and then fails.
 */
export function ResetPasswordForm() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setReady(!!data.session))
      .catch(() => setReady(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setError(error.message);
      return;
    }

    /* Already signed in as a side effect of the recovery session, so there is
       no reason to make them sign in again with the password they just set. */
    router.push("/app");
    router.refresh();
  }

  if (ready === null) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
        <p className="text-[15px] text-muted">One moment.</p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
        <div className="rounded-card bg-surface p-8 text-center shadow-card sm:p-10">
          <h1 className="text-[28px] leading-tight">This link has expired</h1>
          <p className="mt-3 text-[16px] text-muted">
            Reset links last an hour and can only be used once. Ask for a fresh
            one and it will work.
          </p>
          <Link href="/auth/forgot-password" className="btn btn-primary mt-7">
            Send a new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
      <h1 className="text-[36px] leading-tight">Choose a new password</h1>
      <p className="mt-2 text-[15px] text-muted">
        Pick something you have not used elsewhere. You will be signed in as soon
        as it is saved.
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
        />

        {error ? (
          <p role="alert" className="text-[13px] text-menstrual">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="mt-2 w-full">
          {busy ? "Saving" : "Save and sign in"}
        </Button>
      </form>
    </main>
  );
}
