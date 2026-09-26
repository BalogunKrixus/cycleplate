import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Markdown } from "@/components/marketing/Markdown";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

/* An article written in the admin.
 *
 * This route only ever sees slugs the four file-based articles do not own:
 * Next matches a static segment before a dynamic one, so /insights/pcos is
 * still its own file and everything else arrives here.
 *
 * Dynamic rather than statically generated. A piece published at nine should
 * be readable at nine, and generateStaticParams would mean it appeared at the
 * next deploy -- which is the thing a database was chosen to avoid.
 */
export const dynamic = "force-dynamic";

async function load(slug: string): Promise<Article | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    /* Drafts are readable by the team, by policy, so an admin can check a
       piece at its real address before anyone else can. */
    return (data as Article) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const article = await load((await params).slug);
  if (!article) return { title: "Not found" };

  /* The SEO fields fall back rather than being required, so an article always
     has a sensible title and description even when nobody filled them in. */
  const title = article.seo_title?.trim() || article.title;
  const description =
    article.seo_description?.trim() || article.excerpt?.trim() || undefined;

  return {
    title,
    description,
    alternates: { canonical: `/insights/${article.slug}` },
    /* A draft must never be indexed, even though its address works. */
    robots: article.status === "published" ? undefined : { index: false, follow: false },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/insights/${article.slug}`,
      publishedTime: article.published_at ?? undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
    },
    twitter: {
      card: article.featured_image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const article = await load((await params).slug);
  if (!article) notFound();

  return (
    <main>
      <section className="band" style={{ paddingBottom: 32 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <Link href="/insights" className="back-link">
            ← Back to Insights
          </Link>

          {article.status !== "published" ? (
            <p className="mt-4 rounded-card bg-ovulatory/12 px-4 py-3 text-[14px] text-ovulatory-ink">
              This is a draft. Only the team can see it, and search engines are
              told not to index it.
            </p>
          ) : null}

          {article.category ? <p className="eyebrow mt-4">{article.category}</p> : null}
          <h1>{article.title}</h1>
          {article.excerpt ? (
            <p className="lede" style={{ maxWidth: "none" }}>
              {article.excerpt}
            </p>
          ) : null}
        </div>
      </section>

      {article.featured_image ? (
        <section className="band" style={{ paddingTop: 0, paddingBottom: 32 }}>
          <div className="wrap" style={{ maxWidth: 760 }}>
            <div className="photo" style={{ aspectRatio: "16/9" }}>
              <Image
                src={article.featured_image}
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 760px"
                priority
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ maxWidth: 760 }}>
          <div className="article">
            <Markdown source={article.body} />
          </div>

          {article.tags.length ? (
            <p className="mt-10 text-[13px] text-faint">
              {article.tags.join(" · ")}
            </p>
          ) : null}
        </div>
      </section>

      <section className="band alt">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>Questions this raises?</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            Ask them where women who have lived it can answer.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 28 }}>
            <Link href="/join" className="btn btn-primary">
              Go to Community
            </Link>
            <Link href="/insights" className="btn btn-quiet">
              More from Insights
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
