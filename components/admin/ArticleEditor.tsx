"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteArticle, saveArticle } from "@/lib/actions";
import { ARTICLE_CATEGORIES, slugify } from "@/lib/config";
import { Button } from "@/components/ui/Primitives";
import { Markdown } from "@/components/marketing/Markdown";
import type { Article } from "@/lib/types";

/* Writing an article.
 *
 * One screen with two states rather than a wizard: the fields you have to
 * think about, and a preview of what they produce. Publishing is a button
 * rather than a step, because an article is either finished or it is not, and
 * "save draft" beside it means neither choice is the dangerous one.
 *
 * The SEO fields fall back rather than being required. Nobody should have to
 * type the same sentence three times, and an empty meta description is worse
 * than one borrowed from the excerpt.
 */
export function ArticleEditor({ article }: { article: Article | null }) {
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [image, setImage] = useState(article?.featured_image ?? "");
  const [category, setCategory] = useState(article?.category ?? "");
  const [tags, setTags] = useState((article?.tags ?? []).join(", "));
  const [seoTitle, setSeoTitle] = useState(article?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(article?.seo_description ?? "");

  const [tab, setTab] = useState<"write" | "preview">("write");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  /* The address follows the title until somebody edits it by hand, after which
     it stops moving: changing a published article's title should not silently
     break every link to it. */
  const effectiveSlug = useMemo(
    () => slugify(slug.trim() || title),
    [slug, title],
  );

  function submit(status: "draft" | "published") {
    setError(null);
    setSaved(null);
    startTransition(async () => {
      const result = await saveArticle({
        id: article?.id,
        slug: effectiveSlug,
        title,
        excerpt,
        body,
        featured_image: image,
        category,
        tags,
        seo_title: seoTitle,
        seo_description: seoDesc,
        status,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(status === "published" ? "Published." : "Draft saved.");
      if (!article?.id && result.id) router.replace(`/admin/insights/${result.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!article?.id) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteArticle(article.id);
      if (!result.ok) setError(result.error);
      else router.push("/admin/insights");
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-current={tab === t ? "page" : undefined}
            className={`rounded-chip px-4 py-2 text-[14px] font-medium capitalize transition ${
              tab === t ? "bg-ink text-cream" : "chip-idle text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}

        <span className="ml-auto text-[13px] text-faint">
          {article?.status === "published" ? "Live at " : "Will live at "}
          <span className="text-muted">/insights/{effectiveSlug || "…"}</span>
        </span>
      </div>

      {tab === "write" ? (
        <div className="flex flex-col gap-5">
          <Field label="Title" hint="The headline, and the default SEO title.">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Why your period hurts, and what food can do about it"
            />
          </Field>

          <Field
            label="Address"
            hint="Leave empty to follow the title. Once an article is live, changing this breaks existing links."
          >
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input"
              placeholder={slugify(title) || "period-pain-and-food"}
            />
          </Field>

          <Field
            label="Excerpt"
            hint="One or two sentences. Shown on the Insights index, and used as the meta description if you leave the SEO one empty."
          >
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="input resize-y"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
                aria-label="Category"
              >
                <option value="">None</option>
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tags" hint="Separated by commas.">
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input"
                placeholder="magnesium, cramps, omega-3"
              />
            </Field>
          </div>

          <Field
            label="Featured image"
            hint="A path in /public, like /photos/cramps-sofa.jpg, or a full https:// address."
          >
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="input"
              placeholder="/photos/cramps-sofa.jpg"
            />
          </Field>

          <Field
            label="Article"
            hint="Markdown: # heading, **bold**, *italic*, - bullets, > quote, [link](https://…)."
          >
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              className="input resize-y font-[15px] leading-relaxed"
              placeholder={"# What the research says\n\nAround 71% of women experience period pain…"}
            />
          </Field>

          <details className="rounded-card bg-surface p-5 shadow-card">
            <summary className="cursor-pointer text-[15px] font-semibold">
              Search engine listing
            </summary>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Both are optional. Left empty they fall back to the title and the
              excerpt, which is usually what you want.
            </p>
            <div className="mt-4 flex flex-col gap-4">
              <Field label="SEO title">
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="input"
                  placeholder={title || "Falls back to the title"}
                />
              </Field>
              <Field label="SEO description">
                <textarea
                  value={seoDesc}
                  onChange={(e) => setSeoDesc(e.target.value)}
                  rows={2}
                  className="input resize-y"
                  placeholder={excerpt || "Falls back to the excerpt"}
                />
              </Field>
            </div>
          </details>
        </div>
      ) : (
        <Preview
          title={title}
          excerpt={excerpt}
          image={image}
          category={category}
          body={body}
        />
      )}

      {error ? (
        <p role="alert" className="text-[14px] text-menstrual-ink">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="text-[14px] text-follicular-ink">
          {saved}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => submit("published")} disabled={busy || !title.trim()}>
          {article?.status === "published" ? "Update" : "Publish"}
        </Button>
        <Button
          variant="quiet"
          onClick={() => submit("draft")}
          disabled={busy || !title.trim()}
        >
          {article?.status === "published" ? "Unpublish to draft" : "Save draft"}
        </Button>

        {article ? (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="ml-auto text-[13px] text-muted transition hover:text-menstrual-ink disabled:opacity-50"
          >
            Delete
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-medium">{label}</span>
      {hint ? (
        <span className="mb-2 block text-[13px] leading-relaxed text-muted">
          {hint}
        </span>
      ) : null}
      {children}
    </label>
  );
}

/* The preview borrows the article classes from globals.css, so what is shown
   here is what the public page renders rather than an approximation of it. */
function Preview({
  title,
  excerpt,
  image,
  category,
  body,
}: {
  title: string;
  excerpt: string;
  image: string;
  category: string;
  body: string;
}) {
  return (
    <div className="rounded-card bg-surface p-6 shadow-card sm:p-8">
      {category ? <p className="eyebrow">{category}</p> : null}
      <h1 className="text-[32px] leading-tight sm:text-[40px]">
        {title || "Untitled"}
      </h1>
      {excerpt ? <p className="lede mt-3">{excerpt}</p> : null}

      {image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={image}
          alt=""
          className="mt-6 aspect-[16/9] w-full rounded-card object-cover"
        />
      ) : null}

      <div className="article mt-8">
        {body.trim() ? (
          <Markdown source={body} />
        ) : (
          <p className="text-muted">Nothing written yet.</p>
        )}
      </div>
    </div>
  );
}
