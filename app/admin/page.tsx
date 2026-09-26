import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { Stat } from "@/components/admin/Stat";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { timeAgo } from "@/components/ui/Primitives";
import type { AdminOverview } from "@/lib/adminTypes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

/* The admin overview.
 *
 * Every number here is one somebody could act on, which is the filter that kept
 * it this short. Engagement rate, posts per member and the rest are arithmetic
 * on these same numbers and tell a team of two nothing they would do anything
 * about; a question nobody has answered tells them where to spend the evening.
 *
 * It is one round trip. admin_overview() computes the lot in Postgres, because
 * the database is in Ireland and a dozen separate counts would be a dozen
 * crossings of the Atlantic on a page somebody opens every morning.
 */
export default async function AdminOverviewPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_overview");
  const o = data as AdminOverview | null;

  if (!o) {
    /* Almost always one thing: migration 003 has not been run yet. Say that,
       rather than rendering fifteen zeroes that look like a dead community. */
    return (
      <AdminShell viewer={admin} current="/admin" title="Overview">
        <div className="rounded-card bg-surface p-8 shadow-card">
          <p className="text-[15px]">The overview cannot be loaded yet.</p>
          <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-muted">
            This screen needs{" "}
            <code className="text-ink">
              supabase/migrations/003-admin-metrics-and-activity.sql
            </code>
            . Run it in the Supabase SQL editor and reload. Everything else in
            the admin works without it.
          </p>
          {error ? (
            <p className="mt-3 text-[13px] text-faint">Postgres said: {error.message}</p>
          ) : null}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      viewer={admin}
      current="/admin"
      title="Overview"
      intro="How the community is doing, and anything waiting on you."
    >
      {/* Work first. These two are jobs, not statistics, so they lead. */}
      {o.open_flags > 0 || o.unanswered > 0 ? (
        <section className="mb-7">
          <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            Waiting on you
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/content?tab=reported" className="block">
              <Stat label="Reported, unresolved" value={o.open_flags} tone="attention" />
            </Link>
            <Link href="/admin/content?tab=posts&filter=unanswered" className="block">
              <Stat
                label="Questions with no reply"
                value={o.unanswered}
                tone="attention"
              />
            </Link>
          </div>
        </section>
      ) : null}

      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          Members
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Total members" value={o.members} sub={`${o.members_month} joined this month`} />
          <Stat label="New this week" value={o.members_week} />
          <Stat
            label="Active this week"
            value={o.active_week}
            sub={o.active_week === 0 ? "Recorded from today onward" : "Opened the community"}
          />
          <Stat label="Professionals" value={o.professionals} />
        </div>
      </section>

      <section className="mb-7">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
          Conversation
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Posts" value={o.posts} sub={`${o.posts_month} this month`} />
          <Stat label="Posts this week" value={o.posts_week} />
          <Stat label="Comments" value={o.replies} sub={`${o.replies_month} this month`} />
          <Stat label="Comments this week" value={o.replies_week} />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Most active members" empty="Nobody has posted in the last month.">
          {o.top_members.map((m) => (
            <Row
              key={m.display_name}
              left={m.display_name}
              badge={m.role === "professional" ? "Professional" : undefined}
              right={`${m.posts} post${m.posts === 1 ? "" : "s"}`}
            />
          ))}
        </Panel>

        <Panel title="Most discussed categories" empty="No posts in the last month.">
          {o.top_categories.map((c) => (
            <Row key={c.slug} left={c.slug.replace(/-/g, " ")} right={`${c.posts}`} />
          ))}
        </Panel>

        <Panel title="Most engaged posts" empty="No posts yet.">
          {o.top_posts.map((p) => (
            <Row
              key={p.id}
              left={p.body.length > 70 ? `${p.body.slice(0, 70)}…` : p.body}
              sub={p.display_name}
              right={`${p.like_count} ♥ · ${p.reply_count} ↩`}
            />
          ))}
        </Panel>

        <Panel title="Recent activity" empty="Nothing yet.">
          {o.recent.map((r) => (
            <Row
              key={`${r.kind}-${r.id}`}
              left={r.body.length > 70 ? `${r.body.slice(0, 70)}…` : r.body}
              sub={`${r.display_name} · ${r.kind === "post" ? "posted" : "replied"} ${timeAgo(r.created_at)}`}
            />
          ))}
        </Panel>
      </div>

      <p className="mt-7 text-[13px] leading-relaxed text-faint">
        Moderation this week: {o.resolved_flags_week} report
        {o.resolved_flags_week === 1 ? "" : "s"} resolved, {o.removed_week} post
        {o.removed_week === 1 ? "" : "s"} removed.
      </p>
    </AdminShell>
  );
}

function Panel({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const rows = Array.isArray(children) ? children.filter(Boolean) : children;
  const isEmpty = Array.isArray(rows) && rows.length === 0;

  return (
    <section className="rounded-card bg-surface p-5 shadow-card">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {isEmpty ? (
        <p className="mt-3 text-[14px] text-faint">{empty}</p>
      ) : (
        <div className="mt-3 flex flex-col">{rows}</div>
      )}
    </section>
  );
}

function Row({
  left,
  sub,
  badge,
  right,
}: {
  left: string;
  sub?: string;
  badge?: string;
  right?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <div className="min-w-0">
        <p className="truncate text-[14px] capitalize-first">
          {left}
          {badge ? (
            <span className="ml-2 rounded-chip bg-expert/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-expert">
              {badge}
            </span>
          ) : null}
        </p>
        {sub ? <p className="mt-0.5 truncate text-[12px] text-faint">{sub}</p> : null}
      </div>
      {right ? (
        <span className="shrink-0 text-[13px] tabular-nums text-muted">{right}</span>
      ) : null}
    </div>
  );
}
