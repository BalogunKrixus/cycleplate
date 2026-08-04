"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Primitives";
import { generateDisplayName } from "@/lib/displayName";

/* Sign up assigns a handle rather than asking for one, so nobody puts their
   real name on a post about endometriosis by accident. It can be changed once
   from account settings. */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const isSignUp = mode === "sign-up";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    const supabase = createClient();

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: generateDisplayName() },
          /* Sent from the browser rather than left to the project default,
             which is a single fixed Site URL. Every deployment has its own
             hostname, so a fixed value mails people a link back to a different
             build of the site, or to localhost. */
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setBusy(false);

      if (error) {
        setError(error.message);
        return;
      }
      /* With email confirmation switched on there is no session yet, so say so
         rather than dropping them on a feed they cannot post to. The link lands
         on /auth/callback, which signs them in on the way through, so telling
         them to come back and sign in afterwards would be describing a step
         that no longer exists. */
      if (!data.session) {
        setNotice(
          "Almost there. Check your inbox and open the link we sent, and it will bring you straight into the community.",
        );
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setBusy(false);

      if (error) {
        setError("That email and password did not match.");
        return;
      }
    }

    router.push("/community");
    router.refresh();
  }

  return (
    /* Not min-h-screen any more. Centring inside the viewport made sense when
       this page stood alone; with a header above it and a footer below, it just
       pushed the form off the bottom and left a stripe of empty cream. */
    <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
      <h1 className="text-[36px] leading-tight">
        {isSignUp ? "Join the community" : "Welcome back"}
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {isSignUp
          ? "You post under a handle we generate for you. Your name and email are never shown."
          : "Sign in to post, reply and take part."}
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[14px] font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[14px] font-medium"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
          {isSignUp ? (
            <p className="mt-1.5 text-[13px] text-faint">At least 8 characters.</p>
          ) : null}
        </div>

        {error ? (
          <p role="alert" className="text-[13px] text-menstrual">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p role="status" className="text-[13px] text-follicular">
            {notice}
          </p>
        ) : null}

        <Button type="submit" disabled={busy} className="mt-2 w-full">
          {busy ? "One moment" : isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[14px] text-muted">
        {isSignUp ? "Already a member? " : "New here? "}
        <Link
          href={isSignUp ? "/auth/sign-in" : "/join"}
          className="text-menstrual underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>

      <p className="mt-8 text-center text-[13px] text-faint">
        <Link href="/community" className="underline">
          Back to the community
        </Link>
      </p>
    </main>
  );
}
