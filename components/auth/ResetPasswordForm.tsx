"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Primitives";
import { createClient } from "@/lib/supabase/client";

const MIN_LENGTH = 8;

/* Setting the new password, after following the link from the email.
 *
 * The link puts a recovery session in place before this page runs, which is
 * what lets updateUser change the password without asking for the old one. If
 * that session is not there the link was already used or has expired, and
 * saying so plainly beats a form that accepts a new password and then fails.
 *
 * Deciding that takes more than one look. The session usually arrives in a
 * cookie set by the callback before the redirect, and is there on the first
 * read. But a link that carries its token in the fragment instead is handled by
 * the Supabase client after this component has already mounted, and asking once
 * on mount would call that expired a moment before it worked. So the first
 * answer is provisional and the auth listener is allowed to correct it.
 */
export function ResetPasswordForm() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    /* PASSWORD_RECOVERY is what the client emits once it has read a recovery
       token out of the URL. SIGNED_IN covers the ordinary path, where the
       callback established the session server side and this is just reading the
       cookie back. */
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          settled = true;
          setReady(true);
        }
      },
    );

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          settled = true;
          setReady(true);
        }
      })
      .catch(() => {
        /* Left to the timeout below, so a slow answer is not called expired. */
      });

    /* Nothing has produced a session after a moment: the link really is spent.
       A second is long enough for a fragment to be read and short enough that
       nobody is left looking at "one moment". */
    const giveUp = setTimeout(() => {
      if (!settled) setReady(false);
    }, 1000);

    return () => {
      clearTimeout(giveUp);
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const complaint = check(password);
    if (complaint) {
      setError(complaint);
      return;
    }

    setError(null);
    setBusy(true);

    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);

    if (error) {
      setError(describe(error));
      console.error("updateUser failed:", error.message);
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

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-3">
        <PasswordField
          id="new-password"
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={MIN_LENGTH}
          hint={`At least ${MIN_LENGTH} characters.`}
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

/* Checked here as well as by the browser and by Supabase, because the form is
   submitted with noValidate: the built in bubble cannot be styled and says
   nothing useful, and a rejection that arrives from the server after a round
   trip is a worse way to learn a password is four characters long. */
function check(password: string): string | null {
  if (password.length < MIN_LENGTH) {
    return `Passwords need at least ${MIN_LENGTH} characters.`;
  }
  if (!password.trim()) {
    return "That is only spaces. Pick something you can type again.";
  }
  return null;
}

function describe(error: { message: string }): string {
  const message = error.message.toLowerCase();

  if (message.includes("should be different")) {
    return "That is the password you already had. Pick a different one.";
  }
  if (message.includes("weak") || message.includes("pwned")) {
    return "That password is too easy to guess. Try a longer one.";
  }
  if (message.includes("at least") || message.includes("characters")) {
    return `Passwords need at least ${MIN_LENGTH} characters.`;
  }
  /* Expired between loading the page and submitting it, which happens if the
     form is left open. */
  if (
    message.includes("session") ||
    message.includes("jwt") ||
    message.includes("token")
  ) {
    return "This link has expired. Ask for a new one and try again.";
  }

  return "That did not save. Please try again.";
}
