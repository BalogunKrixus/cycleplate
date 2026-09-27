import { redirect } from "next/navigation";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/roles";
import { isMissingFunction } from "@/lib/pgErrors";
import { AdminShell } from "@/components/admin/AdminShell";
import { MemberManager } from "@/components/admin/MemberManager";
import type { Profile, UserRole } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Members" };

export interface MemberRow {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  professional_category: Profile["professional_category"];
  professional_category_other: string | null;
  created_at: string;
  /* Added by migration 003. Older databases return undefined for these rather
     than failing, so every use guards for it and the screen still works before
     the migration is run. */
  last_seen_at?: string | null;
  post_count?: number;
  reply_count?: number;
  flag_count?: number;
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const canGrantRoles = isSuperAdmin(admin);

  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const supabase = await createClient();

  /* Email comes from a security definer function rather than a table, so it is
     never readable by the feed. */
  const { data: results } = await supabase.rpc("search_members", { q: query });

  /* Professionals get their own tab with the same detail as everyone else,
     addresses included, so this goes through a security definer function too
     rather than reading profiles directly. */
  const { data: pros, error: prosError } = await supabase.rpc("list_professionals");

  /* Before migration 007 that function does not exist. Falling back to the
     table keeps the tab working -- without addresses, which profiles does not
     hold -- rather than emptying it and implying there are no professionals. */
  let professionals = (pros ?? []) as MemberRow[];
  let needsMigration007 = false;
  if (isMissingFunction(prosError)) {
    needsMigration007 = true;
    const { data: fallback } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "professional")
      .order("display_name");
    professionals = ((fallback ?? []) as Profile[]).map((pro) => ({
      ...pro,
      email: "",
    })) as MemberRow[];
  }

  return (
    <AdminShell
      viewer={admin}
      current="/admin/members"
      title="Members"
      intro={
        canGrantRoles
          ? "Search by display name or email, then grant or revoke Professional status and moderator rights."
          : "Search by display name or email. Changing roles is a super admin's job, so this list is read only for you."
      }
    >
      <MemberManager
        query={query}
        results={(results ?? []) as MemberRow[]}
        professionals={professionals}
        needsMigration007={needsMigration007}
        currentAdminId={admin.id}
        canGrantRoles={canGrantRoles}
      />
    </AdminShell>
  );
}
