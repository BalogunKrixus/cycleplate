/* What admin_overview() returns. Mirrors the json_build_object in
   supabase/migrations/003-admin-metrics-and-activity.sql; if you change one,
   change the other. */
export interface AdminOverview {
  members: number;
  members_week: number;
  members_month: number;
  active_week: number;
  professionals: number;

  posts: number;
  posts_week: number;
  posts_month: number;

  replies: number;
  replies_week: number;
  replies_month: number;

  unanswered: number;
  open_flags: number;
  resolved_flags_week: number;
  removed_week: number;

  top_categories: { slug: string; posts: number }[];
  top_members: { display_name: string; role: string; posts: number }[];
  top_posts: {
    id: string;
    display_name: string;
    body: string;
    like_count: number;
    reply_count: number;
    created_at: string;
  }[];
  recent: {
    kind: "post" | "reply";
    id: string;
    display_name: string;
    body: string;
    created_at: string;
  }[];
}

/* One row in the reported queue: the flag, plus enough of what it points at to
   judge it without opening anything. Lived in app/admin/page.tsx until the
   overview took that file; a type shared by a page and a component belongs in
   neither of them. */
export interface QueueItem {
  flag: import("@/lib/types").Flag;
  body: string | null;
  displayName: string | null;
  isDeleted: boolean;
  createdAt: string | null;
}
