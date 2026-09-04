"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Primitives";
import { requestPasswordReset } from "@/lib/actions";

/* Asking for a reset link.
 *
 * Whether the address has an account is not answered, on purpose. A form that
 * says "no account with that email" is a way to find out who is a member, and
 * in a community about PCOS and endometriosis, being able to confirm somebody
 * is a member is not a small thing to leak. So the same sentence comes back
 * either way and only the owner of the inbox learns the truth.
 *
 * Not answering that question is not the same as pretending everything worked.
 * Supabase refuses to send for reasons that have nothing to do with the
 * address: its built in mailer allows only a couple of messages an hour, and a
 * project without SMTP configured hits that immediately. Saying "check your
 * inbox" then sends somebody to wait for an email that was never sent, and they
 * blame themselves for mistyping their address. Those failures are reported.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  /* Set by the callback when a link did not work, which is the moment somebody
     most needs this page and the last moment to leave them guessing why. */
  const expired = useSearchParams().get("expired");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    setError(null);
    setBusy(true);

    /* Trimmed because a copied address arrives with a space more often than
       anyone expects, and lowercased because that is how Supabase stores it.
       The action does this too; doing it here as well is what lets the
       confirmation screen show the address the way it was actually sent. */
    const address = email.trim().toLowerCase();

    /* Sent from the server rather than from here. The comment on
       requestPasswordReset explains why that is not an arbitrary choice: asking
       from the browser produces a link that cannot be opened on another
       device. */
    const result = await requestPasswordReset(address);

    setBusy(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setEmail(address);
    setSent(true);
  }

  if (sent) {
    return (
      <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
        <div className="rounded-card bg-surface p-8 text-center shadow-card sm:p-10">
          <h1 className="text-[30px] leading-tight">Check your inbox</h1>
          <p className="mt-3 text-[16px] text-muted">
            If there is an account for{" "}
            <span className="font-medium text-ink">{email}</span>, a link to set
            a new password is on its way. It is good for one hour, and works
            once.
          </p>
          <p className="mt-5 text-[14px] text-muted">
            Nothing after a minute? Check your spam folder, and check the address
            above is the one you signed up with.
          </p>
          <Link href="/auth/sign-in" className="btn btn-quiet mt-7">
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
      <h1 className="text-[36px] leading-tight">Reset your password</h1>
      <p className="mt-2 text-[15px] text-muted">
        Tell us the address you signed up with and we will send a link to set a
        new one.
      </p>

      {expired ? (
        <p
          role="status"
          className="mt-6 rounded-card bg-bg2 p-4 text-[14px] text-muted"
        >
          That link has expired or had already been used. Reset links last an
          hour and work once. Ask for a fresh one below.
        </p>
      ) : null}

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <div>
          <label
            htmlFor="reset-email"
            className="mb-1.5 block text-[14px] font-medium"
          >
            Email address
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        {error ? (
          <p role="alert" className="text-[13px] text-menstrual">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="mt-2 w-full">
          {busy ? "Sending" : "Send the link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        Remembered it?{" "}
        <Link href="/auth/sign-in" className="text-menstrual underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
