import Link from "next/link";

import { JournalCard } from "@/components/marketing/JournalCard";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata = {
  title: "Journal",
  description:
    "Long-form, carefully sourced reads on the conditions and questions women live with, with every claim traced back to its source.",
};

const ARTICLES = [
  {
    href: "/journal/pcos",
    photo: "/photos/buddha-bowl.jpg",
    alt: "A colourful low-GI bowl of food",
    tag: "PCOS",
    title: "PCOS and the plate: what a low-GI diet really means",
    body: "It affects up to 13% of women, and most are never diagnosed. Here is why insulin sits at the centre of it, and what a 12-month trial found food could do.",
    read: "Read →",
  },
  {
    href: "/journal/endometriosis",
    photo: "/photos/seafood-pasta.jpg",
    alt: "An omega-3 rich seafood dish",
    tag: "Endometriosis",
    title: "Endometriosis: the long wait, and eating for inflammation",
    body: "190 million women live with it, and diagnosis takes seven to nine years. While the system catches up, what can an anti-inflammatory diet realistically offer?",
    read: "Read →",
  },
  {
    href: "/journal/pms",
    photo: "/photos/breakfast-smile.jpg",
    alt: "A woman enjoying a calm breakfast",
    tag: "PMS & mood",
    title: "The week before your period: understanding the luteal dip",
    body: "The cravings and low mood are real, and they have a name. What happens to your hormones, and how magnesium, B6 and steady blood sugar help.",
    read: "Read →",
  },
];

export default function JournalPage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 40 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Journal</p>
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
              href="/journal/period-pain"
            >
              <div className="jr-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/photos/cramps-sofa.jpg"
                  alt="A woman resting with period pain"
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

      <section className="band alt">
        <div className="wrap">
          <h2>More from the journal</h2>
          <div className="jr-grid">
            {ARTICLES.map((article) => (
              <JournalCard key={article.href} {...article} />
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>New articles, as they land</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            Join the newsletter and get each new journal piece in your inbox,
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
