import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { createClient, requireAdmin } from "@/lib/supabase/server";
import { timeAgo } from "@/components/ui/Primitives";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Insights" };

export default async function AdminInsightsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  const articles = (data ?? []) as Article[];
  /* 42P01 is "relation does not exist": migration 005 has not been run. Saying
     so beats an empty list that reads as "you have written nothing". */
  const missingTable = error?.code === "42P01";

  return (
    <AdminShell
      viewer={admin}
      current="/admin/insights"
      title="Insights"
      intro="Articles on the public site. Publishing one puts it live immediately, with its own address."
    >
      {missingTable ? (
        <div className="rounded-card bg-surface p-8 shadow-card">
          <p className="text-[15px]">Publishing is not set up yet.</p>
          <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-muted">
            Run{" "}
            <code className="text-ink">
              supabase/migrations/005-insights-articles.sql
            </code>{" "}
            in the Supabase SQL editor and reload.
          </p>
        </div>
      ) : (
        <>
          <Link href="/admin/insights/new" className="btn btn-primary mb-6 inline-flex">
            Write an article
          </Link>

          {articles.length === 0 ? (
            <div className="rounded-card bg-surface p-10 text-center shadow-card">
              <p className="text-[15px] text-muted">
                Nothing written yet. The four original articles live in the
                codebase and are not listed here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/insights/${a.id}`}
                  className="block rounded-[14px] bg-surface p-4 shadow-card transition hover:shadow-lift"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-medium">{a.title}</span>
                    {a.status === "published" ? (
                      <span className="rounded-chip bg-expert px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-expert-ink">
                        Live
                      </span>
                    ) : (
                      <span className="rounded-chip bg-bg2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
                        Draft
                      </span>
                    )}
                    {a.category ? (
                      <span className="text-[12px] text-faint">{a.category}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[13px] text-faint">
                    /insights/{a.slug} · edited {timeAgo(a.updated_at)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
