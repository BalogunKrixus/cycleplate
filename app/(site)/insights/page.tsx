import Image from "next/image";
import Link from "next/link";

import { InsightCard } from "@/components/marketing/InsightCard";
import { Reveal } from "@/components/marketing/Reveal";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

/* Published articles come from the database, so a piece written in the admin
   appears here without a deploy. That is the whole point of the table, and it
   is why this page cannot be static. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights",
  description:
    "Long-form, carefully sourced reads on the conditions and questions women live with, with every claim traced back to its source.",
};

const ARTICLES = [
  {
    href: "/insights/pcos",
    photo: "/photos/buddha-bowl.jpg",
    alt: "A colourful low-GI bowl of food",
    tag: "PCOS",
    title: "PCOS and the plate: what a low-GI diet really means",
    body: "It affects up to 13% of women, and most are never diagnosed. Here is why insulin sits at the centre of it, and what a 12-month trial found food could do.",
    read: "Read →",
  },
  {
    href: "/insights/endometriosis",
    photo: "/photos/seafood-pasta.jpg",
    alt: "An omega-3 rich seafood dish",
    tag: "Endometriosis",
    title: "Endometriosis: the long wait, and eating for inflammation",
    body: "190 million women live with it, and diagnosis takes seven to nine years. While the system catches up, what can an anti-inflammatory diet realistically offer?",
    read: "Read →",
  },
  {
    href: "/insights/pms",
    photo: "/photos/breakfast-smile.jpg",
    alt: "A woman enjoying a calm breakfast",
    tag: "PMS & mood",
    title: "The week before your period: understanding the luteal dip",
    body: "The cravings and low mood are real, and they have a name. What happens to your hormones, and how magnesium, B6 and steady blood sugar help.",
    read: "Read →",
  },
];

/* Never let the index fail because the database is unreachable or migration
   005 has not been run. The four original articles are files and should keep
   rendering either way. */
async function publishedArticles(): Promise<Article[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(24);
    return (data ?? []) as Article[];
  } catch {
    return [];
  }
}

export default async function InsightsPage() {
  const written = await publishedArticles();
  return (
    <main>
      <section className="band" style={{ paddingBottom: 40 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Insights</p>
          <h1>The science of your cycle, written for you.</h1>
          <p className="lede" style={{ maxWidth: "none" }}>
            Long-form, carefully sourced reads on the conditions and questions
            women live with. No hype, no miracle cures. Just what the research
            actually says, in plain language, with every claim traced back to its
            source.
          </p>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal>
            <Link
              className="jr-card jr-feature"
              href="/insights/period-pain"
            >
              <div className="jr-photo">
                <Image
                  src="/photos/cramps-sofa.jpg"
                  alt="A woman resting with period pain"
                  fill
                  sizes="(max-width: 760px) 100vw, 600px"
                  priority
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="jr-body">
                <span className="jr-tag">Period pain · Featured</span>
                <h3 style={{ fontSize: "clamp(24px,2.6vw,32px)" }}>
                  Why your period hurts, and what food can actually do about it
                </h3>
                <p style={{ fontSize: 16 }}>
                  Around 71% of women experience period pain, and for one in five
                  it means missing school or work. The research on omega-3,
                  magnesium and anti-inflammatory eating is more encouraging than
                  most of us were ever told.
                </p>
                <span className="jr-read">Read the article →</span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {written.length ? (
        <section className="band alt">
          <div className="wrap">
            <h2>Latest</h2>
            <div className="jr-grid">
              {written.map((a) => (
                <InsightCard
                  key={a.id}
                  href={`/insights/${a.slug}`}
                  photo={a.featured_image || "/photos/buddha-bowl.jpg"}
                  alt=""
                  tag={a.category || "Insights"}
                  title={a.title}
                  body={a.excerpt || ""}
                  read="Read →"
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={written.length ? "band" : "band alt"}>
        <div className="wrap">
          <h2>More from Insights</h2>
          <div className="jr-grid">
            {ARTICLES.map((article) => (
              <InsightCard key={article.href} {...article} />
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>New articles, as they land</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            Join the newsletter and get each new Insights piece in your inbox,
            sourced and plain-spoken.
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
            <Link href="/#waitlist" className="btn btn-primary">
              Subscribe
            </Link>
            <Link href="/join" className="btn btn-quiet">
              Join the community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
