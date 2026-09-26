"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { countRecipients, sendNotification } from "@/lib/actions";
import { Button, timeAgo } from "@/components/ui/Primitives";
import type { Post } from "@/lib/types";

/* Composing a message to every member.
 *
 * The thing that makes this different from every other form in the admin is
 * that it cannot be undone. There is no editing a sent email and no recalling
 * it, so the count of who will receive it is shown before the button, and the
 * button asks a second time. Neither is friction for its own sake: the failure
 * being designed against is a half-written note reaching three hundred women.
 */
export function NotificationComposer({
  posts,
  history,
}: {
  posts: Post[];
  history: {
    id: string;
    subject: string;
    recipients: number;
    failed: number;
    created_at: string;
  }[];
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [postId, setPostId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const [count, setCount] = useState<number | null>(null);
  const [configured, setConfigured] = useState(true);
  const [countError, setCountError] = useState<string | null>(null);

  const [busy, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    let live = true;
    countRecipients().then((r) => {
      if (!live) return;
      if (r.ok) {
        setCount(r.count ?? 0);
        setConfigured(r.configured ?? false);
      } else setCountError(r.error);
    });
    return () => {
      live = false;
    };
  }, []);

  /* Any edit cancels a pending confirmation. Otherwise you could press Send,
     change your mind about a sentence, and have the second press fire the
     version you were looking at rather than the one you just typed. */
  function edited<T>(setter: (v: T) => void) {
    return (v: T) => {
      setConfirming(false);
      setDone(null);
      setter(v);
    };
  }

  function send() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await sendNotification({ subject, body, postId: postId || null });
      setConfirming(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(
        `Sent to ${result.sent} member${result.sent === 1 ? "" : "s"}` +
          (result.failed ? `, ${result.failed} failed.` : "."),
      );
      setSubject("");
      setBody("");
      setPostId("");
      router.refresh();
    });
  }

  const blocked = !configured || count === 0 || countError !== null;

  return (
    <div className="flex flex-col gap-6">
      {countError ? (
        <Notice tone="warn">{countError}</Notice>
      ) : !configured ? (
        <Notice tone="warn">
          No <code>RESEND_API_KEY</code> is set on the deployment, so nothing can
          be sent yet. Add it in Vercel under Settings, Environment Variables,
          then redeploy. Everything else on this page works without it.
        </Notice>
      ) : count === 0 ? (
        <Notice tone="warn">
          Nobody is opted in to receive these yet, so there is no one to send to.
        </Notice>
      ) : (
        <Notice tone="plain">
          This goes to{" "}
          <strong className="text-ink">
            {count} member{count === 1 ? "" : "s"}
          </strong>{" "}
          who have confirmed their address and not opted out. Every message
          carries a one-click unsubscribe link.
        </Notice>
      )}

      <label className="block">
        <span className="mb-1.5 block text-[14px] font-medium">Subject</span>
        <input
          value={subject}
          onChange={(e) => edited(setSubject)(e.target.value)}
          className="input"
          placeholder="A dietitian answered the magnesium question"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[14px] font-medium">Message</span>
        <span className="mb-2 block text-[13px] leading-relaxed text-muted">
          Plain writing. A blank line starts a new paragraph. Your name is not
          shown; it comes from CyclePlate.
        </span>
        <textarea
          value={body}
          onChange={(e) => edited(setBody)(e.target.value)}
          rows={8}
          className="input resize-y"
          placeholder={"Somebody asked whether magnesium actually helps with cramps.\n\nA dietitian answered properly, with the dose and the timing."}
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[14px] font-medium">
          Link to a post
        </span>
        <span className="mb-2 block text-[13px] leading-relaxed text-muted">
          Optional. Adds a button that opens this post in the community.
        </span>
        <select
          value={postId}
          onChange={(e) => edited(setPostId)(e.target.value)}
          className="input"
          aria-label="Post to link to"
        >
          <option value="">No link</option>
          {posts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.display_name}: {p.body.slice(0, 70)}
              {p.body.length > 70 ? "…" : ""}
            </option>
          ))}
        </select>
      </label>

      {error ? (
        <p role="alert" className="text-[14px] text-menstrual-ink">
          {error}
        </p>
      ) : null}
      {done ? (
        <p role="status" className="text-[14px] text-follicular-ink">
          {done}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={send}
          disabled={busy || blocked || !subject.trim() || !body.trim()}
        >
          {busy
            ? "Sending…"
            : confirming
              ? `Yes, send to ${count} member${count === 1 ? "" : "s"}`
              : "Send"}
        </Button>

        {confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-[13px] text-muted transition hover:text-ink"
          >
            Cancel
          </button>
        ) : null}

        {confirming ? (
          <span className="text-[13px] text-muted">
            This cannot be undone.
          </span>
        ) : null}
      </div>

      {history.length ? (
        <section className="mt-4">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Already sent
          </h2>
          <div className="flex flex-col gap-2">
            {history.map((h) => (
              <div key={h.id} className="rounded-[14px] bg-surface p-4 shadow-card">
                <p className="text-[14px] font-medium">{h.subject}</p>
                <p className="mt-0.5 text-[13px] text-faint">
                  {h.recipients} delivered
                  {h.failed ? `, ${h.failed} failed` : ""} · {timeAgo(h.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "plain" | "warn";
  children: React.ReactNode;
}) {
  return (
    <p
      className={`rounded-card px-5 py-4 text-[14px] leading-relaxed ${
        tone === "warn" ? "bg-ovulatory/12 text-ink" : "bg-surface text-muted shadow-card"
      }`}
    >
      {children}
    </p>
  );
}
