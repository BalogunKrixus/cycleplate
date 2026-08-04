import type { ReactNode } from "react";
import Link from "next/link";

import { Photo } from "@/components/marketing/Photo";

/* The shell every journal article shares: the hero, the lead photo, the
 * references, and the invitation at the end.
 *
 * All four articles repeated this markup, so a change to the byline row or the
 * closing call to action meant four edits and three chances to miss one. The
 * articles now carry only their own words.
 */

export type Reference = {
  id: string;
  text: ReactNode;
  href: string;
  label: string;
};

export function Sup({ n }: { n: number }) {
  return (
    <a className="sup" href={`#ref${n}`}>
      {n}
    </a>
  );
}

export function ArticleLayout({
  eyebrow,
  title,
  readTime,
  photo,
  alt,
  children,
  references,
  closing,
}: {
  eyebrow: string;
  title: string;
  readTime: string;
  photo: string;
  alt: string;
  children: ReactNode;
  references: Reference[];
  closing: { title: string; body: string };
}) {
  return (
    <main>
      <article>
        <section className="band" style={{ paddingBottom: 32 }}>
          <div className="wrap">
            <div className="article-hero">
              <Link href="/journal" className="back-link">
                ← Back to the journal
              </Link>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <div className="article-meta">
                <span>CyclePlate team</span>
                <span className="dot-sep" />
                <span>{readTime}</span>
                <span className="dot-sep" />
                <span>Sourced &amp; reviewed</span>
              </div>
            </div>
          </div>
        </section>

        <section className="band" style={{ paddingTop: 0, paddingBottom: 40 }}>
          <div className="wrap">
            <div className="article-hero">
              <Photo
                src={photo}
                alt={alt}
                style={{ aspectRatio: "16/9" }}
                sizes="(max-width: 880px) 100vw, 820px"
                priority
              />
            </div>
          </div>
        </section>

        <section className="band" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="article">{children}</div>

            <div className="refs">
              <h3>References</h3>
              <ol>
                {references.map((ref) => (
                  <li id={ref.id} key={ref.id}>
                    {ref.text}{" "}
                    <a href={ref.href} target="_blank" rel="noopener">
                      {ref.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </article>

      <section className="band alt">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>{closing.title}</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            {closing.body}
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Link href="/join" className="btn btn-primary">
              Join the community
            </Link>
            <Link href="/journal" className="btn btn-quiet">
              More articles
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
