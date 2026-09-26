import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { NotificationComposer } from "@/components/admin/NotificationComposer";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = await createClient();

  /* Recent posts to choose from, and what has already gone out. Both are
     allowed to fail: before migration 006 the history table does not exist,
     and the page should still explain itself rather than 500. */
  const [{ data: postRows }, { data: sentRows }] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase
      .from("notifications_sent")
      .select("id, subject, recipients, failed, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <AdminShell
      viewer={admin}
      current="/admin/notifications"
      title="Notifications"
      intro="Email members about something worth reading. Sparingly: every one of these lands in a real inbox."
    >
      <NotificationComposer
        posts={(postRows ?? []) as Post[]}
        history={
          (sentRows ?? []) as {
            id: string;
            subject: string;
            recipients: number;
            failed: number;
            created_at: string;
          }[]
        }
      />
    </AdminShell>
  );
}
