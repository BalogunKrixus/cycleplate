"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Primitives";
import { createClient } from "@/lib/supabase/client";

/* Sign in for the moderation side.
 *
 * The wording is the only thing that differs from member sign in, and one
 * behaviour: it does not say whether the address exists or whether it is an
 * admin. Confirming either would turn this form into a way to enumerate the
 * team, and knowing which addresses can moderate is the first thing anybody
 * planning to be a nuisance would want.
 *
 * Whether the account can actually moderate is settled on the next page, and
 * again by row level security on every write.
 */
export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setBusy(true);

    const supabase = createClient();
    const { error: failed } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (failed) {
      setError("That email and password did not match.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-[14px] font-medium">
          Email address
        </label>
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <PasswordField
        id="admin-password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
      />

      {error ? (
        <p role="alert" className="text-[13px] text-menstrual">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={busy} className="mt-2 w-full">
        {busy ? "One moment" : "Sign in"}
      </Button>
    </form>
  );
}
