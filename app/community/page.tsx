import { Suspense } from "react";
import Link from "next/link";
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
import type { Category, FeedPost, FeedReply, Post, Reply } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community",
  description:
    "A place to talk about your cycle, ask questions, and hear from women who have been through the same thing. Anonymous by default, moderated with love.",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeCategory = params.category ?? null;

  const supabase = await createClient();
  const viewer = await getViewer();

  const { data: categoryRows } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const categories = (categoryRows ?? []) as Category[];

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

  const { data: postRows } = await postQuery;
  let posts = (postRows ?? []) as Post[];

  /* A search has to look at replies too, otherwise a question whose answer
     mentions the term simply vanishes from the results. Posts found this way
     carry the matching reply so the reason they appear is visible. */
  let repliesByPost = new Map<string, Reply[]>();

  if (query) {
    const { data: replyRows } = await supabase
      .from("replies")
      .select("*")
      .eq("is_deleted", false)
      .ilike("body", `%${query}%`)
      .limit(FEED_PAGE_SIZE);

    const matchedReplies = (replyRows ?? []) as Reply[];
    const known = new Set(posts.map((p) => p.id));
    const missing = [
      ...new Set(matchedReplies.map((r) => r.post_id).filter((id) => !known.has(id))),
    ];

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

  /* One query for the viewer's likes rather than one per card. */
  let likedPosts = new Set<string>();
  let likedReplies = new Set<string>();

  if (viewer && posts.length) {
    const { data: likeRows } = await supabase
      .from("likes")
      .select("target_type, target_id")
      .eq("user_id", viewer.id);

    for (const like of likeRows ?? []) {
      if (like.target_type === "post") likedPosts.add(like.target_id as string);
      else likedReplies.add(like.target_id as string);
    }
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
    /* The feed is a narrow column on purpose: a paragraph somebody typed on a
       phone should not stretch the width of a desktop. Sign in, account and
       admin used to live in a second nav here, which is exactly the seam that
       made the community look like a separate site. The site header carries
       them now, on every page. */
    <main className="mx-auto w-full max-w-2xl px-5 pb-32 pt-10 sm:pt-14">
      <header className="mb-7">
        <h1 className="text-[40px] leading-none sm:text-[52px]">Community</h1>
        <p className="mt-3 max-w-[46ch] text-[16px] text-muted">
          {viewer
            ? "Anonymous by default. Moderated with love. You are posting as " +
              viewer.display_name +
              "."
            : "Ask the questions you were told not to, and hear from women whose cycles look like yours. Anonymous by default, moderated with love."}
        </p>

        {/* A visitor reading the feed has no idea an account is free, anonymous
            or even possible until something says so. The floating button asks
            them to write; this asks them to belong, which is the smaller step. */}
        {!viewer ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/join" className="btn btn-primary">
              Join the community
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-[15px] font-medium text-muted transition hover:text-ink"
            >
              Already a member? Sign in
            </Link>
          </div>
        ) : null}
      </header>

      <div className="mb-5">
        <GuidelinesBanner />
      </div>

      <div className="mb-4">
        <Suspense fallback={<div className="h-12" />}>
          <SearchBar initial={query} />
        </Suspense>
      </div>

      <div className="mb-6">
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
          />
        ))}

        {feed.length === 0 && !query ? (
          <EmptyFeed
            signedIn={!!viewer}
            categories={categories}
            filtered={!!activeCategory}
          />
        ) : null}
      </div>

      <ShareSomething categories={categories} viewer={viewer} />
    </main>
  );
}
