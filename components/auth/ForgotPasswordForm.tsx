"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Primitives";
import { createClient } from "@/lib/supabase/client";

/* Asking for a reset link.
 *
 * The answer is the same whether or not the address has an account. That is
 * deliberate: a form that says "no account with that email" is a way to find
 * out who is a member, and in a community about PCOS and endometriosis, being
 * able to confirm somebody is a member is not a small thing to leak.
 *
 * So this says an email is on its way either way, and only somebody who owns
 * the inbox learns the truth.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    await createClient().auth.resetPasswordForEmail(email, {
      /* Through the callback, which exchanges the one time code for a
         session, then on to the form that needs that session in place. */
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    setBusy(false);
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
            a new password is on its way. It is good for one hour.
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
