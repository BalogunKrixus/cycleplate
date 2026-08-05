"use client";

import { useState } from "react";

/* A password box you can look inside.
 *
 * Typing a password blind on a phone keyboard is how people end up locked out
 * of an account they just created, and the usual fix, asking them to type it
 * twice, only doubles the chance of a typo they cannot see.
 *
 * The button is a button, not a div with a click handler, so it can be reached
 * by keyboard. It is deliberately not in the tab order between the field and
 * the submit button though: somebody typing their way through a form wants the
 * next field, not the eye. It stays reachable, just not in the way.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  minLength,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  minLength?: number;
  hint?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={shown ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input pr-12"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center
                     rounded-full p-2 text-faint transition hover:text-ink"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
            {shown ? <path d="M4 20L20 4" /> : null}
          </svg>
        </button>
      </div>

      {hint ? <p className="mt-1.5 text-[13px] text-faint">{hint}</p> : null}
    </div>
  );
}
