import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient, getViewer } from "@/lib/supabase/server";
import { FEED_PAGE_SIZE } from "@/lib/config";
import { PostCard } from "@/components/feed/PostCard";
import { EmptyFeed } from "@/components/feed/EmptyFeed";
import {
  CategoryChips,
  GuidelinesBanner,
  SearchBar,
} from "@/components/feed/FeedChrome";
import { ShareSomething } from "@/components/post/ShareSomething";
import { ComposerPrompt } from "@/components/post/ComposerPrompt";
import { CommunityHeader } from "@/components/feed/CommunityHeader";
import { CommunityAside } from "@/components/feed/CommunityAside";
import type { Category, FeedPost, FeedReply, Post, Reply } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The community",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; post?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeCategory = params.category ?? null;
  /* Where an emailed notification lands. The post is pulled to the top and
     opened, rather than left somewhere down a feed that has moved on since
     the mail went out. */
  const focusPost = params.post ?? null;

  /* The community is the members' side of the product, so it asks who you are
     before anything else. The marketing page at /community is the public face
     and explains what is in here; this is the thing itself.

     The redirect goes to /join rather than sign in: somebody who followed a link
     this deep and has no account is far more likely to be arriving than to have
     forgotten they already signed up. */
  const viewer = await getViewer();
  if (!viewer) redirect("/join");

  const supabase = await createClient();

  /* Pinned first, then newest. Deleted rows are filtered by policy rather than
     here, so a soft deleted post cannot leak through a missed condition. */
  let postQuery = supabase
    .from("posts")
    .select("*")
    .eq("is_deleted", false)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(FEED_PAGE_SIZE);

  if (activeCategory) postQuery = postQuery.eq("category_slug", activeCategory);
  if (query) postQuery = postQuery.ilike("body", `%${query}%`);

  /* The chips and the posts have nothing to say to each other, so they are
     fetched together rather than one after the other. Every await here is a
     round trip, and they were queueing. */
  /* A week ago, for the activity count. */
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  /* The three counts are head requests: they ask Postgres for a number and
     carry no rows back. They are in this Promise.all rather than after it
     because none of them depends on the feed, so in wall clock time they cost
     nothing beyond the slowest query already being made.

     These trips are short now -- the functions run in Dublin beside the
     database, which they did not when this batching was written -- and that is
     a reason to keep it rather than to undo it. A round trip costing a
     millisecond instead of seventy-five is still a round trip, and six of them
     in a row is still six times the wait of six made at once. */
  const [
    { data: categoryRows },
    { data: postRows },
    { count: memberCount },
    { count: weekCount },
    { count: professionalCount },
    likeResult,
    searchReplyResult,
    focusResult,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    postQuery,
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("is_deleted", false)
      .gte("created_at", weekAgo),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "professional"),

    /* The viewer's likes. One query for the whole page rather than one per
       card, and it asks for every like this member has ever left, so it needs
       nothing from the feed and has no reason to wait for it. */
    viewer
      ? supabase
          .from("likes")
          .select("target_type, target_id")
          .eq("user_id", viewer.id)
      : null,

    /* A search has to look at replies too, otherwise a question whose answer
       mentions the term simply vanishes from the results. Independent of the
       posts query, so it goes alongside it. */
    query
      ? supabase
          .from("replies")
          .select("*")
          .eq("is_deleted", false)
          .ilike("body", `%${query}%`)
          .limit(FEED_PAGE_SIZE)
      : null,

    /* A post linked from a notification email may be older than the page of
       posts fetched above. Asked for up front rather than after discovering it
       is missing: usually it is already in hand and this answer is thrown away,
       which costs nothing, where a second sequential trip costs the wait. */
    focusPost
      ? supabase
          .from("posts")
          .select("*")
          .eq("id", focusPost)
          .eq("is_deleted", false)
          .maybeSingle()
      : null,

    /* Records that this member was here, which is the only way the admin can
       answer "how many women are actually using this". Last in the batch and
       deliberately never read: it adds no wall clock time, the function writes
       at most once an hour per person so the feed is not issuing a write on
       every reload, and failure is ignored on purpose, because a missing
       activity timestamp is not a reason to fail to render the community. On a
       database where migration 003 has not been run yet it does nothing. */
    supabase.rpc("touch_last_seen"),
  ]);

  const categories = (categoryRows ?? []) as Category[];
  let posts = (postRows ?? []) as Post[];

  /* A search has to look at replies too, otherwise a question whose answer
     mentions the term simply vanishes from the results. Posts found this way
     carry the matching reply so the reason they appear is visible. */
  let repliesByPost = new Map<string, Reply[]>();

  if (query) {
    const matchedReplies = (searchReplyResult?.data ?? []) as Reply[];
    const known = new Set(posts.map((p) => p.id));
    const missing = [
      ...new Set(matchedReplies.map((r) => r.post_id).filter((id) => !known.has(id))),
    ];

    /* This one has to wait, and only this one: which parents are missing is not
       a question that can be asked until the replies and the feed are both in
       hand. Searching is the one path that still costs a second round trip. */
    if (missing.length) {
      const { data: parents } = await supabase
        .from("posts")
        .select("*")
        .in("id", missing)
        .eq("is_deleted", false);
      posts = [...posts, ...((parents ?? []) as Post[])];
    }

    for (const reply of matchedReplies) {
      repliesByPost.set(reply.post_id, [
        ...(repliesByPost.get(reply.post_id) ?? []),
        reply,
      ]);
    }

    posts.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      return b.created_at.localeCompare(a.created_at);
    });
  }

  /* Which hearts are already filled in, from the batch above. */
  const likedPosts = new Set<string>();
  const likedReplies = new Set<string>();

  for (const like of likeResult?.data ?? []) {
    if (like.target_type === "post") likedPosts.add(like.target_id as string);
    else likedReplies.add(like.target_id as string);
  }

  /* The linked post, if it was not already on the page. Fetched in the batch
     above, so this is only the decision about whether it is needed. */
  if (focusPost && !posts.some((p) => p.id === focusPost)) {
    const one = focusResult?.data;
    if (one) posts = [one as Post, ...posts];
  }

  if (focusPost) {
    posts = [
      ...posts.filter((p) => p.id === focusPost),
      ...posts.filter((p) => p.id !== focusPost),
    ];
  }

  const feed: FeedPost[] = posts.map((post) => ({
    ...post,
    liked_by_viewer: likedPosts.has(post.id),
    matching_replies: repliesByPost.get(post.id)?.map((r) => ({
      ...(r as FeedReply),
      liked_by_viewer: likedReplies.has(r.id),
    })),
  }));

  return (
    /* Feed and context, side by side above lg.
     *
     * The feed column stays narrow. That was a deliberate decision before this
     * change and it survives it: a paragraph typed on a phone should not
     * stretch the width of a desktop monitor. What was wrong was not the
     * column, it was that everything either side of it was empty margin on a
     * wide screen, which is what made a room full of people feel like a
     * document. The aside fills one side with context and leaves the writing
     * the width it was set at. */
    <div className="mx-auto flex w-full max-w-5xl justify-center gap-8 px-5 pb-32 pt-8 sm:pt-12">
      <main className="w-full max-w-2xl">
        <CommunityHeader
          members={memberCount ?? 0}
          postsThisWeek={weekCount ?? 0}
          professionals={professionalCount ?? 0}
        />

        {/* Below lg the aside is gone, so the rules it carries would go with
            it. The banner stays for the narrow case and is still dismissible. */}
        <div className="mb-4 lg:hidden">
          <GuidelinesBanner />
        </div>

        <ComposerPrompt viewer={viewer} />

        <div className="mb-3">
          <Suspense fallback={<div className="h-12" />}>
            <SearchBar initial={query} />
          </Suspense>
        </div>

        <div className="mb-5">
          <Suspense fallback={<div className="h-10" />}>
            <CategoryChips categories={categories} active={activeCategory} />
          </Suspense>
        </div>

        {query ? (
          <p className="mb-4 text-[14px] text-muted">
            {feed.length === 0
              ? `Nothing found for "${query}"`
              : `${feed.length} result${feed.length === 1 ? "" : "s"} for "${query}"`}
          </p>
        ) : null}

        <div className="flex flex-col gap-4">
          {feed.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              categories={categories}
              viewer={viewer}
              highlight={post.id === focusPost}
            />
          ))}

          {feed.length === 0 && !query ? (
            <EmptyFeed
              signedIn
              categories={categories}
              filtered={!!activeCategory}
            />
          ) : null}
        </div>
      </main>

      <CommunityAside
        categories={categories}
        professionals={professionalCount ?? 0}
      />

      <ShareSomething categories={categories} viewer={viewer} />
    </div>
  );
}
