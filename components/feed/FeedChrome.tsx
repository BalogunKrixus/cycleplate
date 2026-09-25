"use client";

import { useEffect, useState, useTransition } from "react";
import Link, { useLinkStatus } from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GUIDELINES_DISMISS_KEY, GUIDELINES_TEXT } from "@/lib/config";
import type { Category } from "@/lib/types";

/* The feed lives at /app. That matters more than it sounds: /community is the
 * marketing page that explains what the community is, and for a while both the
 * search box and the category chips here pushed to /community. Filtering the
 * feed therefore threw you out of the feed and onto the landing page, which is
 * why the tabs read as navigation rather than as filters. The page they land on
 * has always known how to filter — app/app/page.tsx reads q and category and
 * narrows the query with them — so this is one address, not a feature. */
const FEED = "/app";

/* Dismissed per browser session rather than for good. The rules matter most to
   someone arriving fresh, and sessionStorage clears itself. */
export function GuidelinesBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(sessionStorage.getItem(GUIDELINES_DISMISS_KEY) === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="flex items-start gap-3 rounded-card bg-follicular/12 p-4 shadow-chip">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7C9A65"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="mt-0.5 shrink-0"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v.1M12 11.5v5" />
      </svg>
      <p className="flex-1 text-[14px] leading-relaxed text-ink">
        {GUIDELINES_TEXT}
      </p>
      <button
        type="button"
        aria-label="Dismiss this notice"
        onClick={() => {
          sessionStorage.setItem(GUIDELINES_DISMISS_KEY, "1");
          setHidden(true);
        }}
        className="shrink-0 text-muted transition hover:text-ink"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}

export function SearchBar({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();

  /* The field is controlled, so it has to follow the URL as well as the typing.
     Without this, clearing a search with the browser back button leaves the old
     term sitting in a box that no longer describes what is on screen. */
  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${FEED}?${qs}` : FEED));
  }

  return (
    <form onSubmit={submit} role="search" className="relative">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search posts and replies"
        aria-label="Search posts and replies"
        className="input input-search pl-11 pr-11"
      />

      {/* A search that takes a moment should say so, rather than leaving the
          feed looking like it simply ignored the return key. */}
      {pending ? (
        <span
          role="status"
          aria-label="Searching"
          className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin
                     rounded-full border-2 border-faint/30 border-t-accent"
        />
      ) : null}
    </form>
  );
}

export function CategoryChips({
  categories,
  active,
}: {
  categories: Category[];
  active: string | null;
}) {
  const params = useSearchParams();

  function href(slug: string | null) {
    const next = new URLSearchParams(params.toString());
    if (slug) next.set("category", slug);
    else next.delete("category");
    const qs = next.toString();
    return `${FEED}${qs ? `?${qs}` : ""}`;
  }

  const chips = [
    { slug: null, label: "All" },
    ...categories.map((c) => ({ slug: c.slug as string | null, label: c.label })),
  ];

  return (
    /* A tablist would be the tempting role here, but these are links that change
       the address and reload the list underneath, not panels being swapped in a
       page. Naming them a tablist would promise keyboard behaviour they do not
       have, and it would cost the things a link gives for free: open in a new
       tab, copy the address, and a filtered feed that survives being shared. */
    <nav
      aria-label="Filter by category"
      className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
    >
      {chips.map((chip) => {
        const isActive = chip.slug === active;
        return (
          <Link
            key={chip.slug ?? "all"}
            href={href(chip.slug)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`relative shrink-0 rounded-chip px-4 py-2 text-[14px] font-medium transition ${
              isActive
                ? "bg-ink text-cream shadow-chip"
                : "chip-idle text-muted hover:text-ink"
            }`}
          >
            {chip.label}
            <ChipSpinner />
          </Link>
        );
      })}
    </nav>
  );
}

/* Has to be its own component: useLinkStatus reports on the Link above it, so
   asking the question from inside the chip is the only place it can be asked.
   Without it a filter on a slow connection looks like a chip that was clicked
   and ignored. */
function ChipSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <span
      aria-hidden="true"
      className="absolute inset-0 grid place-items-center rounded-chip bg-inherit"
    >
      <span
        className="h-3.5 w-3.5 animate-spin rounded-full border-2
                   border-current/25 border-t-current opacity-70"
      />
    </span>
  );
}
