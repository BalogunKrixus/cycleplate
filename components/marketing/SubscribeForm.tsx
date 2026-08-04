"use client";

import { useState, type FormEvent, type ReactNode } from "react";

/* The marketing forms: newsletter and partner enquiry.
 *
 * Both post to /api/subscribe, which writes to the Google Sheet and, for the
 * newsletter, the mailing list. The failure wording is deliberate: reporting a
 * success that was not delivered is how signups got silently dropped before
 * this endpoint existed, so anything short of a 2xx says so and offers an email
 * address instead.
 *
 * The honeypot is not named after anything autofill recognises. An earlier
 * version called it "company", browsers filled it in for real people, and every
 * one of those submissions was discarded as a bot.
 */

type FormKind = "newsletter" | "partner";

const CONTACT = "hellocycleplate@gmail.com";

const DONE: Record<FormKind, string> = {
  newsletter:
    "Thank you. You are on the list. Science backed cycle nutrition, straight to your inbox.",
  partner: "Thank you. We will respond within two business days.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function messageFor(reason: string, kind: FormKind) {
  if (reason === "already") return "You are already on the list.";
  if (reason === "invalid email") return "Please enter a valid email address.";
  if (reason === "unconfigured")
    return `Sign ups are not connected yet. Please email ${CONTACT} and we will add you by hand.`;
  return `That did not go through. Please try again, or email ${CONTACT}.`;
}

export function SubscribeForm({
  kind,
  submitLabel,
  children,
  validate,
}: {
  kind: FormKind;
  submitLabel: string;
  children: ReactNode;
  validate?: (data: Record<string, string>) => string;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const raw = new FormData(form);

    /* FormData keeps only the last value for a repeated name, so checkbox
       groups are folded by hand. */
    const data: Record<string, string> = {};
    raw.forEach((value, key) => {
      if (typeof value !== "string") return;
      data[key] = key in data ? `${data[key]}, ${value}` : value;
    });

    if (data.cp_hp) return;

    const problem =
      !data.email || !EMAIL_RE.test(data.email)
        ? "Please enter a valid email address."
        : validate?.(data) ?? "";

    if (problem) {
      setResult({ ok: false, text: problem });
      return;
    }

    setBusy(true);
    setResult(null);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ form: kind, ...data }),
      });

      if (!res.ok) {
        let reason = "";
        try {
          reason = (await res.json()).error ?? "";
        } catch {
          /* A non JSON error body is still an error; fall through to the
             generic wording rather than crashing on the parse. */
        }
        setResult({ ok: false, text: messageFor(reason, kind) });
        return;
      }

      setResult({ ok: true, text: DONE[kind] });
      form.reset();
    } catch {
      setResult({ ok: false, text: messageFor("", kind) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={submit} noValidate>
        {children}
        <input
          className="hp"
          type="text"
          name="cp_hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={busy}
        >
          {busy ? "Sending…" : submitLabel}
        </button>
      </form>

      {result ? (
        <div className={`form-msg ${result.ok ? "ok" : "err"}`} role="status">
          {result.text}
        </div>
      ) : null}
    </>
  );
}
