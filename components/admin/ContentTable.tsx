"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { restoreContent, setPinned, softDelete } from "@/lib/actions";
import { timeAgo } from "@/components/ui/Primitives";
import type { Post, Reply } from "@/lib/types";

/* The posts and comments browser.
 *
 * Moderation used to mean the flagged queue and nothing else: an admin could
 * act on what somebody had reported, and had no way to find anything otherwise.
 * That is fine until you need the post a member emailed you about, or want to
 * see what a single account has been writing, and then there is no door at all.
 *
 * Rows rather than cards. This is a list to work through, not a feed to read,
 * and the body is clamped to two lines because the decision is nearly always
 * made on the first sentence.
 */
export function ContentTable({
  kind,
  rows,
}: {
  kind: "post" | "reply";
  rows: (Post | Reply)[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-card bg-surface p-10 text-center shadow-card">
        <p className="text-[15px] text-muted">Nothing matches that.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <ContentRow key={row.id} kind={kind} row={row} />
      ))}
    </div>
  );
}

function ContentRow({ kind, row }: { kind: "post" | "reply"; row: Post | Reply }) {
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const post = kind === "post" ? (row as Post) : null;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error ?? "That did not save.");
      else router.refresh();
    });
  }

  return (
    <div className="rounded-[14px] bg-surface p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-medium">{row.display_name}</span>

        {row.author_role === "professional" ? (
          <span className="rounded-chip bg-expert/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-expert">
            Professional
          </span>
        ) : null}
        {row.author_role === "admin" || row.author_role === "super_admin" ? (
          <span className="rounded-chip bg-ink px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cream">
            Team
          </span>
        ) : null}
        {post?.is_pinned ? (
          <span className="rounded-chip bg-ovulatory/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-ovulatory-ink">
            Pinned
          </span>
        ) : null}
        {row.is_deleted ? (
          <span className="rounded-chip bg-menstrual/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-menstrual-ink">
            Removed
          </span>
        ) : null}

        <span className="text-[12px] text-faint">{timeAgo(row.created_at)}</span>
        {post?.category_slug ? (
          <span className="text-[12px] capitalize text-faint">
            · {post.category_slug.replace(/-/g, " ")}
          </span>
        ) : null}
      </div>

      <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
        {row.body}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-[12px] tabular-nums text-faint">
          {row.like_count} {row.like_count === 1 ? "like" : "likes"}
          {post
            ? ` · ${post.reply_count} ${post.reply_count === 1 ? "reply" : "replies"}`
            : ""}
        </span>

        <div className="ml-auto flex items-center gap-3">
          {post && !row.is_deleted ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => setPinned(post.id, !post.is_pinned))}
              className="text-[13px] text-muted transition hover:text-ink disabled:opacity-50"
            >
              {post.is_pinned ? "Unpin" : "Pin"}
            </button>
          ) : null}

          {row.is_deleted ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => restoreContent(kind, row.id))}
              className="text-[13px] text-muted transition hover:text-ink disabled:opacity-50"
            >
              Restore
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => softDelete(kind, row.id))}
              className="text-[13px] text-muted transition hover:text-menstrual disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-menstrual">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* Tabs and filters for the content screen. They read and write the URL, so a
   filtered view is a link somebody can keep or send. */
export function ContentControls({
  tab,
  filter,
  query,
  counts,
}: {
  tab: string;
  filter: string;
  query: string;
  counts: { reported: number };
}) {
  const [term, setTerm] = useState(query);
  const router = useRouter();
  const params = useSearchParams();

  function go(next: URLSearchParams) {
    const qs = next.toString();
    router.push(`/admin/content${qs ? `?${qs}` : ""}`);
  }

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "tab") next.delete("filter");
    go(next);
  }

  const TABS = [
    { id: "posts", label: "Posts" },
    { id: "comments", label: "Comments" },
    {
      id: "reported",
      label: counts.reported ? `Reported (${counts.reported})` : "Reported",
    },
  ];

  const FILTERS =
    tab === "posts"
      ? [
          { id: "", label: "All" },
          { id: "unanswered", label: "No replies" },
          { id: "pinned", label: "Pinned" },
          { id: "removed", label: "Removed" },
        ]
      : tab === "comments"
        ? [
            { id: "", label: "All" },
            { id: "removed", label: "Removed" },
          ]
        : [];

  return (
    <div className="mb-5 flex flex-col gap-3">
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setParam("tab", t.id === "posts" ? null : t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`shrink-0 rounded-chip px-4 py-2 text-[14px] font-medium transition ${
              tab === t.id ? "bg-ink text-cream" : "chip-idle text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "reported" ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const next = new URLSearchParams(params.toString());
              if (term.trim()) next.set("q", term.trim());
              else next.delete("q");
              go(next);
            }}
            role="search"
          >
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={`Search ${tab === "comments" ? "comments" : "posts"} by text or author`}
              aria-label="Search content"
              className="input input-search"
            />
          </form>

          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {FILTERS.map((f) => (
              <button
                key={f.id || "all"}
                type="button"
                onClick={() => setParam("filter", f.id || null)}
                aria-current={filter === f.id ? "page" : undefined}
                className={`shrink-0 rounded-chip px-3.5 py-1.5 text-[13px] transition ${
                  filter === f.id
                    ? "bg-ink text-cream"
                    : "chip-idle text-muted hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
