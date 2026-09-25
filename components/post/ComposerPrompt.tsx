"use client";

import type { Profile } from "@/lib/types";

/* The box, at the top of the feed, where a post starts.
 *
 * Posting used to begin at a floating pill in the bottom right corner. It was
 * discoverable, and it was still the wrong shape: a button says "there is a
 * thing you could do", whereas a box with a cursor in it says "this is yours,
 * write". Every community worth copying on this point puts the field itself at
 * the top of the feed, and the reason is not fashion -- seeing the box is what
 * makes people type in it.
 *
 * It opens the existing composer rather than reimplementing one. There is one
 * posting flow in this product, with one set of rules about length, category
 * and who you are posting as, and a second one that looked similar would drift
 * from it within a month.
 */
export function ComposerPrompt({ viewer }: { viewer: Profile | null }) {
  function open() {
    window.dispatchEvent(new CustomEvent("cp:compose", { detail: {} }));
  }

  return (
    /* No card around it, and no avatar beside it.
     *
     * Both were there to say "this is you, writing", and both were paid for in
     * the wrong currency: the card put a second pale surface behind a field
     * that already has its own, so the field looked like it was floating in a
     * box of nothing, and the avatar spent the left edge of the row telling a
     * member the one thing she cannot possibly be unsure about. What is left is
     * the two things that do work: somewhere to write, and the button that says
     * what happens when you stop. */
    <div className="mb-4 flex items-center gap-2">
      {/* A button rather than a real input. It looks like a field because that
          is what invites writing, but the writing happens in the composer, and
          a text box that silently threw away what you typed when it opened
          something else would be a small betrayal. */}
      <button
        type="button"
        onClick={open}
        className="input input-search min-w-0 flex-1 cursor-text truncate px-4 py-3 text-left
                   text-[15px] text-muted transition hover:text-ink"
      >
        {viewer
          ? "Ask something, or share what worked for you"
          : "Join to ask your first question"}
      </button>

      {/* Visible at every width now. It used to be hidden below sm to make room
          for the avatar, which meant the one screen where the field is most
          ambiguous -- a phone, where it sits directly above a search box of the
          same shape -- was the screen with nothing to tell them apart. */}
      <button
        type="button"
        onClick={open}
        className="shrink-0 rounded-chip bg-ink px-4 py-3 text-[14px] font-medium
                   text-cream transition hover:shadow-lift sm:px-5"
      >
        {viewer ? "Post" : "Join"}
      </button>
    </div>
  );
}
