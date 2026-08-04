import { Suspense } from "react";
import Link from "next/link";
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
import type { Category, FeedPost, FeedReply, Post, Reply } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "The community",
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const activeCategory = params.category ?? null;

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
     round trip to a database in another country, and they were queueing. */
  const [{ data: categoryRows }, { data: postRows }] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    postQuery,
  ]);

  const categories = (categoryRows ?? []) as Category[];
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
          Anonymous by default. Moderated with love. You are posting as{" "}
          <Link href="/account" className="font-medium text-ink underline">
            {viewer.display_name}
          </Link>
          .
        </p>
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
            signedIn
            categories={categories}
            filtered={!!activeCategory}
          />
        ) : null}
      </div>

      <ShareSomething categories={categories} viewer={viewer} />
    </main>
  );
}
