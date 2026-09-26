import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";

/* One route for writing and editing. "new" is a reserved id rather than a
   second page, because the form is the same form and two of them would drift. */
export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  let article: Article | null = null;

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!data) notFound();
    article = data as Article;
  }

  return (
    <AdminShell
      viewer={admin}
      current="/admin/insights"
      title={article ? "Edit article" : "Write an article"}
      intro={
        article?.status === "published"
          ? "This one is live. Changes go out as soon as you press Update."
          : "Save a draft as often as you like. Nothing is public until you publish."
      }
    >
      <Link
        href="/admin/insights"
        className="mb-5 inline-flex text-[13px] text-muted transition hover:text-ink"
      >
        ← All articles
      </Link>
      <ArticleEditor article={article} />
    </AdminShell>
  );
}
