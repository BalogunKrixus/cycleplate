"use client";

import { Avatar } from "@/components/ui/Primitives";
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
    <div className="mb-4 flex items-center gap-3 rounded-card bg-surface p-3.5 shadow-card sm:p-4">
      {viewer ? <Avatar displayName={viewer.display_name} size={38} /> : null}

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

      {/* The field alone was not enough. Sitting directly above the search box,
          which is also a pale rounded field with grey placeholder text, it read
          as a second search rather than as somewhere to write. The button is
          what separates them: one of these two boxes has an obvious thing that
          happens when you finish, and it is this one. */}
      <button
        type="button"
        onClick={open}
        className="hidden shrink-0 rounded-chip bg-ink px-4 py-2.5 text-[14px] font-medium
                   text-cream transition hover:shadow-lift sm:inline-flex"
      >
        {viewer ? "Post" : "Join"}
      </button>
    </div>
  );
}
