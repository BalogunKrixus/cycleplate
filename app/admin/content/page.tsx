import { Suspense } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ContentControls, ContentTable } from "@/components/admin/ContentTable";
import { ModerationQueue } from "@/components/admin/ModerationQueue";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import type { QueueItem } from "@/lib/adminTypes";
import type { Flag, Post, Reply } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Content" };

const PAGE = 50;

/* Posts, comments and reports in one screen.
 *
 * They were three different situations before: reports had a queue, posts could
 * only be moderated by finding them in the feed, and comments could not be
 * found at all. They are the same job -- read something a member wrote, decide
 * whether it stays -- so they are one screen with three tabs rather than three
 * places to remember.
 *
 * Removed content is visible here and nowhere else. Row level security lets an
 * admin read soft deleted rows and hides them from everybody else, so this is
 * the only view where a removal can be looked at again and undone.
 */
export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; filter?: string; q?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const tab = params.tab === "comments" || params.tab === "reported" ? params.tab : "posts";
  const filter = params.filter ?? "";
  const query = params.q?.trim() ?? "";

  const supabase = await createClient();

  /* The reported count rides along on every tab, because a number on the tab is
     what makes somebody open it. */
  const flagCountPromise = supabase
    .from("flags")
    .select("id", { count: "exact", head: true })
    .eq("resolved", false);

  if (tab === "reported") {
    const [{ count: reported }, { data: flagRows }] = await Promise.all([
      flagCountPromise,
      supabase
        .from("flags")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const flags = (flagRows ?? []) as Flag[];
    const postIds = flags.filter((f) => f.target_type === "post").map((f) => f.target_id);
    const replyIds = flags.filter((f) => f.target_type === "reply").map((f) => f.target_id);

    const [{ data: posts }, { data: replies }] = await Promise.all([
      postIds.length
        ? supabase.from("posts").select("*").in("id", postIds)
        : Promise.resolve({ data: [] as Post[] }),
      replyIds.length
        ? supabase.from("replies").select("*").in("id", replyIds)
        : Promise.resolve({ data: [] as Reply[] }),
    ]);

    const postById = new Map((posts ?? []).map((p) => [p.id, p as Post]));
    const replyById = new Map((replies ?? []).map((r) => [r.id, r as Reply]));

    const items: QueueItem[] = flags.map((flag) => {
      const target =
        flag.target_type === "post"
          ? postById.get(flag.target_id)
          : replyById.get(flag.target_id);
      return {
        flag,
        body: target?.body ?? null,
        displayName: target?.display_name ?? null,
        isDeleted: target?.is_deleted ?? false,
        createdAt: target?.created_at ?? null,
      };
    });

    return (
      <AdminShell
        viewer={admin}
        current="/admin/content"
        title="Content"
        intro="Everything members have written, and anything they have reported."
      >
        <Suspense fallback={<div className="h-32" />}>
          <ContentControls
            tab="reported"
            filter=""
            query=""
            counts={{ reported: reported ?? 0 }}
          />
        </Suspense>
        <ModerationQueue items={items} />
      </AdminShell>
    );
  }

  const table = tab === "comments" ? "replies" : "posts";

  let rowQuery = supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE);

  /* "Removed" is the only filter that wants deleted rows; every other view is
     about live content, so they exclude them rather than mixing the two. */
  if (filter === "removed") rowQuery = rowQuery.eq("is_deleted", true);
  else rowQuery = rowQuery.eq("is_deleted", false);

  if (tab === "posts") {
    if (filter === "unanswered") rowQuery = rowQuery.eq("reply_count", 0);
    if (filter === "pinned") rowQuery = rowQuery.eq("is_pinned", true);
  }

  if (query) {
    rowQuery = rowQuery.or(
      `body.ilike.%${query}%,display_name.ilike.%${query}%`,
    );
  }

  const [{ count: reported }, { data: rows }] = await Promise.all([
    flagCountPromise,
    rowQuery,
  ]);

  return (
    <AdminShell
      viewer={admin}
      current="/admin/content"
      title="Content"
      intro="Everything members have written, and anything they have reported."
    >
      <Suspense fallback={<div className="h-32" />}>
        <ContentControls
          tab={tab}
          filter={filter}
          query={query}
          counts={{ reported: reported ?? 0 }}
        />
      </Suspense>

      <ContentTable
        kind={tab === "comments" ? "reply" : "post"}
        rows={(rows ?? []) as (Post | Reply)[]}
      />

      {(rows?.length ?? 0) === PAGE ? (
        <p className="mt-4 text-[13px] text-faint">
          Showing the {PAGE} most recent. Narrow it with the search box above.
        </p>
      ) : null}
    </AdminShell>
  );
}
