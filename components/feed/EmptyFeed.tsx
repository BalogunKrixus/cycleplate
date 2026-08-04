"use client";

import Link from "next/link";

import type { Category } from "@/lib/types";

/* What the feed shows before anybody has posted.
 *
 * "Nothing here yet" is accurate and useless. An empty community is not a bug
 * to apologise for, it is the one moment where the invitation matters most, and
 * a blank box with a cursor is the hardest thing to answer. So the openings are
 * written out: pick one and the composer opens with the question already in it
 * and the right category chosen, which turns writing a post into editing one.
 *
 * The prompts are questions rather than topics on purpose. "Cravings" is a
 * filing cabinet; "does anyone else get this?" is somebody talking.
 */

const OPENERS = [
  {
    category: "period-pain",
    prompt: "What actually helps your cramps? I have tried",
    label: "What helps your cramps?",
  },
  {
    category: "cravings",
    prompt: "The week before my period I always crave",
    label: "What do you crave, and when?",
  },
  {
    category: "pcos-journey",
    prompt: "Something I wish I had known earlier about PCOS is",
    label: "What do you wish you had known?",
  },
  {
    category: "first-periods",
    prompt: "Nobody warned me that",
    label: "What did nobody warn you about?",
  },
];

function compose(prompt: string, category: string) {
  window.dispatchEvent(
    new CustomEvent("cp:compose", { detail: { prompt, category } }),
  );
}

export function EmptyFeed({
  signedIn,
  categories,
  filtered,
}: {
  signedIn: boolean;
  categories: Category[];
  filtered: boolean;
}) {
  /* A category with nothing in it is a different situation from a community
     with nothing in it, and pretending otherwise would invite somebody to start
     a conversation they may have just failed to find. */
  if (filtered) {
    return (
      <div className="rounded-card bg-surface p-10 text-center shadow-card">
        <p className="text-[17px]">No conversations here yet.</p>
        <p className="mx-auto mt-2 max-w-[36ch] text-[15px] text-muted">
          This one is quiet so far. Try another category, or start it off
          yourself.
        </p>
        <Link
          href="/community"
          className="mt-6 inline-flex text-[15px] font-medium text-accent"
        >
          See everything instead
        </Link>
      </div>
    );
  }

  const known = new Set(categories.map((c) => c.slug));
  const openers = OPENERS.filter((o) => known.has(o.category));

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card bg-surface p-8 text-center shadow-card sm:p-12">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">
          Nobody has spoken yet
        </p>
        <h2 className="mt-4 font-serif text-[28px] leading-tight sm:text-[34px]">
          Someone has to go first.
        </h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-[16px] text-muted">
          {signedIn
            ? "You post under a handle we made for you. Your name and email are never shown, and you can read for as long as you like before saying anything."
            : "Reading needs no account. Posting takes about a minute, and you get a handle so your name and email are never shown."}
        </p>

        {!signedIn ? (
          <Link href="/join" className="btn btn-primary mt-7">
            Join the community
          </Link>
        ) : null}
      </div>

      {openers.length ? (
        <div className="rounded-card bg-surface p-8 shadow-card">
          <p className="text-[15px] font-medium">Not sure where to start?</p>
          <p className="mt-1 text-[14px] text-muted">
            Pick one and we will open it for you. Change any of it before you
            post.
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {openers.map((opener) => (
              <button
                key={opener.category}
                type="button"
                onClick={() => compose(opener.prompt, opener.category)}
                className="group flex w-full items-center justify-between gap-4 rounded-card bg-bg2
                           px-5 py-4 text-left transition hover:shadow-card"
              >
                <span className="text-[15px]">{opener.label}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-[15px] text-faint transition group-hover:text-accent"
                >
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
