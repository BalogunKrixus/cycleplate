"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LikeButton } from "@/components/interactions/LikeButton";
import { FlagButton } from "@/components/interactions/FlagButton";
import { ReplyComposer } from "@/components/feed/ReplyComposer";
import {
  Avatar,
  AuthorBadge,
  Card,
  CategoryChip,
  timeAgo,
} from "@/components/ui/Primitives";
import { setPinned, softDelete } from "@/lib/actions";
import { isModerator } from "@/lib/roles";
import type {
  Category,
  FeedPost,
  FeedReply,
  Profile,
  UserRole,
} from "@/lib/types";

export function PostCard({
  post,
  categories,
  viewer,
}: {
  post: FeedPost;
  categories: Category[];
  viewer: Profile | null;
}) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<FeedReply[] | null>(
    post.matching_replies ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  const category = categories.find((c) => c.slug === post.category_slug);
  const isAdmin = isModerator(viewer);

  /* Replies load on expand rather than with the feed. Most posts are never
     opened, and loading every thread up front would make the feed pay for it. */
  async function loadReplies() {
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("replies")
      .select("*")
      .eq("post_id", post.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    let liked = new Set<string>();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && data?.length) {
      const { data: likeRows } = await supabase
        .from("likes")
        .select("target_id")
        .eq("user_id", user.id)
        .eq("target_type", "reply")
        .in(
          "target_id",
          data.map((r) => r.id),
        );
      liked = new Set((likeRows ?? []).map((l) => l.target_id as string));
    }

    setReplies(
      (data ?? []).map((r) => ({
        ...(r as FeedReply),
        liked_by_viewer: liked.has(r.id as string),
      })),
    );
    setLoading(false);
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && replies === null) void loadReplies();
  }

  return (
    /* A pinned post is the one thing on this page somebody was meant to read
       first, and it used to say so with an eleven pixel chip among five other
       chips. The card itself carries it now: a warm wash and a labelled strip,
       so it reads as pinned before a single word is read. */
    <Card
      className={`animate-rise p-5 sm:p-6 ${
        post.is_pinned ? "bg-ovulatory/[0.07] shadow-lift" : ""
      }`}
    >
      {post.is_pinned ? (
        <p className="mb-3 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ovulatory">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3z" />
          </svg>
          Pinned by the team
        </p>
      ) : null}

      <div className="flex items-start gap-3">
        <Avatar displayName={post.display_name} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[15px] font-medium text-ink">
              {isTeam(post.author_role) ? "CyclePlate" : post.display_name}
            </span>
            <AuthorBadge
              role={post.author_role}
              category={post.professional_category}
              categoryOther={post.professional_category_other}
            />
            <span className="text-[13px] text-faint">
              {timeAgo(post.created_at)}
            </span>
            {category ? (
              <CategoryChip slug={category.slug} label={category.label} />
            ) : null}
          </div>

          <PostBody body={post.body} />

          {/* Reply is the action this whole page exists for, and it used to be
              thirteen pixels of grey beside two other things in the same
              thirteen pixels of grey. It is a filled control now; everything
              else recedes behind it. */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="inline-flex items-center gap-2 rounded-chip bg-bg2 px-3.5 py-2 text-[13px]
                         font-medium text-ink transition hover:shadow-chip"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z" />
              </svg>
              {post.reply_count === 0 ? (
                open ? "Close" : "Reply"
              ) : (
                <>
                  <span className="tabular-nums">{post.reply_count}</span>
                  {post.reply_count === 1 ? "reply" : "replies"}
                </>
              )}
            </button>

            <LikeButton
              targetType="post"
              targetId={post.id}
              initialCount={post.like_count}
              initiallyLiked={post.liked_by_viewer}
              signedIn={!!viewer}
            />

            <div className="ml-auto flex items-center gap-3">
              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await setPinned(post.id, !post.is_pinned);
                        router.refresh();
                      })
                    }
                    className="text-[13px] text-muted transition hover:text-ink"
                  >
                    {post.is_pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      startTransition(async () => {
                        await softDelete("post", post.id);
                        router.refresh();
                      })
                    }
                    className="text-[13px] text-muted transition hover:text-menstrual"
                  >
                    Remove
                  </button>
                </>
              ) : null}
              <FlagButton
                targetType="post"
                targetId={post.id}
                signedIn={!!viewer}
              />
            </div>
          </div>
        </div>
      </div>

      {open ? (
        <div className="mt-5 pl-0 sm:pl-[52px]">
          {loading ? (
            <p className="text-[14px] text-faint">Loading replies</p>
          ) : (
            <div className="flex flex-col gap-4">
              {(replies ?? []).map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  viewer={viewer}
                  isAdmin={isAdmin}
                />
              ))}
              {replies?.length === 0 ? (
                <p className="text-[14px] text-faint">
                  No replies yet. Be the first to say something kind.
                </p>
              ) : null}
            </div>
          )}

          <ReplyComposer
            postId={post.id}
            viewer={viewer}
            onDone={() => void loadReplies()}
          />
        </div>
      ) : null}
    </Card>
  );
}

function ReplyItem({
  reply,
  viewer,
  isAdmin,
}: {
  reply: FeedReply;
  viewer: Profile | null;
  isAdmin: boolean;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-cream p-4">
      <Avatar
        displayName={
          isTeam(reply.author_role) ? "CyclePlate" : reply.display_name
        }
        size={32}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-medium text-ink">
            {isTeam(reply.author_role) ? "CyclePlate" : reply.display_name}
          </span>
          <AuthorBadge
            role={reply.author_role}
            category={reply.professional_category}
            categoryOther={reply.professional_category_other}
          />
          <span className="text-[12px] text-faint">
            {timeAgo(reply.created_at)}
          </span>
        </div>

        <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
          {reply.body}
        </p>

        <div className="mt-2.5 flex items-center gap-4">
          <LikeButton
            targetType="reply"
            targetId={reply.id}
            initialCount={reply.like_count}
            initiallyLiked={reply.liked_by_viewer}
            signedIn={!!viewer}
          />
          <div className="ml-auto flex items-center gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await softDelete("reply", reply.id);
                    router.refresh();
                  })
                }
                className="text-[12px] text-muted transition hover:text-menstrual"
              >
                Remove
              </button>
            ) : null}
            <FlagButton
              targetType="reply"
              targetId={reply.id}
              signedIn={!!viewer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* A team post is signed CyclePlate rather than by a person. Written once: a
   reply from a super admin was being signed with its author's private handle
   while the same person's post was signed CyclePlate, because two of the three
   places that asked this question had not heard about the new role. */
function isTeam(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

/* Long posts are clamped until asked.
 *
 * A post may run to two thousand characters, and a feed where one of them is
 * open is a feed with one post in it. Clamping trades a click for the ability
 * to scan, which is the right trade on a page whose job is to help somebody
 * find the conversation she came for. Short posts -- almost all of them -- are
 * untouched, and the control only appears when there is genuinely more to read,
 * measured rather than guessed from a character count, because six lines of
 * one-word answers and six lines of prose are not the same length. */
function PostBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);
  const [clampable, setClampable] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setClampable(el.scrollHeight - el.clientHeight > 4);
  }, [body]);

  return (
    <div className="mt-2.5">
      <p
        ref={ref}
        className={`whitespace-pre-wrap text-[15px] leading-relaxed text-ink ${
          expanded ? "" : "line-clamp-[8]"
        }`}
      >
        {body}
      </p>

      {clampable && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 text-[13px] font-medium text-accent transition hover:text-ink"
        >
          Read more
        </button>
      ) : null}
    </div>
  );
}
