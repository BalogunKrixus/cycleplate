import Link from "next/link";

import { Chart } from "@/components/marketing/Chart";
import { JournalCard } from "@/components/marketing/JournalCard";
import { Reveal } from "@/components/marketing/Reveal";
import { SubscribeForm } from "@/components/marketing/SubscribeForm";

export const metadata = {
  title: "CyclePlate — Eat right, at the right time",
};

const STATS = [
  {
    n: "190M",
    l: "women live with endometriosis worldwide, around 1 in 10 of reproductive age",
    cite: "WHO, 2023",
  },
  {
    n: "10–13%",
    l: "of women have PCOS, and up to 70% are never diagnosed",
    cite: "WHO, 2023",
  },
  {
    n: "71%",
    l: "of women experience period pain, across 70 countries studied",
    cite: "PAIN, meta-analysis, 2026",
  },
  {
    n: "1 in 5",
    l: "young women miss school or work because of that pain",
    cite: "J. Women's Health, 2019",
  },
];

/* The chip colour follows the phase variable. Luteal and menstrual are dark
   enough to use straight; the lighter two are mixed toward ink so the label
   still passes as readable on the tinted background. */
const CONDITIONS = [
  {
    name: "PCOS",
    phase: "luteal",
    mix: 14,
    solid: true,
    body: "Affects 10 to 13% of women worldwide, with insulin resistance at its centre. Up to 70% of those affected are never formally diagnosed.",
  },
  {
    name: "Dysmenorrhoea",
    phase: "menstrual",
    mix: 12,
    solid: true,
    body: "Around 71% of women experience period pain, and most treat it as something to endure rather than something diet can influence.",
  },
  {
    name: "Endometriosis",
    phase: "ovulatory",
    mix: 16,
    solid: false,
    body: "190 million women live with it, waiting seven to nine years on average for a diagnosis while inflammation goes unmanaged.",
  },
  {
    name: "PMS & the luteal dip",
    phase: "follicular",
    mix: 16,
    solid: false,
    body: "The days before a period bring cramps, low mood and cravings for most women, and are among the most responsive to what you eat.",
  },
];

const FINDINGS = [
  {
    title: "Omega-3 fatty acids",
    body: "A meta-analysis of 12 randomised trials found omega-3 produced a large reduction in menstrual pain; in one trial women needed fewer ibuprofen doses.",
  },
  {
    title: "Magnesium & vitamin B6",
    body: "Double-blind trials link the pair to lower premenstrual symptom severity than placebo, with steadier mood across the luteal phase.",
  },
  {
    title: "Low-glycaemic eating",
    body: "A 12-month trial in women with PCOS improved insulin sensitivity and menstrual regularity, independent of weight change.",
  },
];

const ROUTES = [
  {
    href: "/science",
    photo: "/photos/buddha-bowl.jpg",
    alt: "A colourful nourishing bowl of food",
    tag: "The Science",
    title: "Evidence, in plain language",
    body: "What actually changes across your four phases, and the peer-reviewed research behind every recommendation.",
    read: "Explore the science →",
  },
  {
    href: "/community",
    photo: "/photos/veg-joy.jpg",
    alt: "A woman enjoying fresh vegetables",
    tag: "Community",
    title: "Women who get it",
    body: "Ask questions about your body and your cycle, and hear from women who have been through the same thing.",
    read: "Join the conversation →",
  },
  {
    href: "/journal",
    photo: "/photos/breakfast-smile.jpg",
    alt: "A woman enjoying a calm breakfast",
    tag: "Journal",
    title: "Deep, sourced reads",
    body: "Long-form articles on period pain, PCOS, endometriosis and PMS, each one grounded in the evidence.",
    read: "Read the journal →",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="band" style={{ paddingTop: 72 }}>
        <div className="wrap cols">
          <div>
            <h1>Eat right, at the right time.</h1>
            <p className="lede">
              CyclePlate turns clinical nutrition science into daily food guidance
              for every phase of your cycle, using foods you can actually find
              where you live. Backed by published research, shaped by a community
              of women who get it.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <Link href="/join" className="btn btn-primary">
                Join the community
              </Link>
              <Link href="/science" className="btn btn-quiet">
                Read the science
              </Link>
            </div>
          </div>
          <Reveal className="photo" style={{ aspectRatio: "4/4.6" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/cta-fruit.jpg"
              alt="A smiling woman holding fresh grapefruit, pears, strawberries and blueberries"
              style={{ objectPosition: "center 38%" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <p className="eyebrow">The problem, in numbers</p>
          <Reveal className="stat-row">
            {STATS.map((stat) => (
              <div className="stat" key={stat.n}>
                <div className="n">{stat.n}</div>
                <div className="l">
                  {stat.l}
                  <span className="cite">{stat.cite}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Nobody told you this</p>
          <h2>Your hormones change every week. Your plate never got the memo.</h2>
          <p className="lede" style={{ maxWidth: "none" }}>
            Oestrogen and progesterone rise and fall in a predictable rhythm
            across the month, and each shift changes what your body needs: how you
            process iron, how sensitive you are to insulin, how inflammation
            behaves, how your mood holds up. Most nutrition advice ignores all of
            it and hands every woman the same static plan.
          </p>
          <p className="lede" style={{ maxWidth: "none" }}>
            Food is one of the most accessible tools you have for working with
            those shifts instead of against them. Not supplements, not a
            subscription box of imported superfoods. The ingredients already in
            your market, eaten at the right time.
          </p>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap cols">
          <Reveal className="photo photo-fill">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/cramps-sofa.jpg"
              alt="A woman resting on a sofa with a hot water bottle, managing cramps"
            />
          </Reveal>
          <div>
            <h2 style={{ fontSize: "clamp(26px,2.8vw,36px)" }}>
              The conditions nobody is connecting to food
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 32,
              }}
            >
              {CONDITIONS.map((c) => (
                <div className="card" key={c.name}>
                  <span
                    className="phase-chip"
                    style={{
                      background: `color-mix(in srgb,var(--${c.phase}) ${c.mix}%,var(--card))`,
                      color: c.solid
                        ? `var(--${c.phase})`
                        : `color-mix(in srgb,var(--${c.phase}) 70%,var(--ink))`,
                    }}
                  >
                    <span
                      className="dot"
                      style={{ background: `var(--${c.phase})` }}
                    />
                    {c.name}
                  </span>
                  <p style={{ margin: "14px 0 0" }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap cols cols-start">
          <div>
            <h2 style={{ fontSize: "clamp(26px,2.8vw,36px)" }}>
              What the research says food can do
            </h2>
            <p className="lede" style={{ maxWidth: "none" }}>
              These are not folk remedies. They are findings from randomised
              controlled trials and meta-analyses.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                marginTop: 32,
              }}
            >
              {FINDINGS.map((f) => (
                <div className="card" key={f.title}>
                  <h3 style={{ fontSize: 19, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ margin: 0 }} className="muted">
                    {f.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 64 }}>
            <Chart
              title="Low-GI diet vs conventional healthy diet in PCOS"
              bars={[
                {
                  label: "Low-glycaemic diet",
                  value: "95%",
                  color: "var(--follicular)",
                },
                {
                  label: "Conventional healthy diet",
                  value: "63%",
                  color: "var(--luteal)",
                },
              ]}
              caption={
                <>
                  Share of participants whose menstrual regularity improved over
                  12 months. Marsh et&nbsp;al.,{" "}
                  <em>American Journal of Clinical Nutrition</em>, 2010.
                </>
              }
            />
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <p className="eyebrow">What you&apos;ll find here</p>
          <h2 style={{ maxWidth: "20ch" }}>
            Three ways CyclePlate helps you eat for your cycle
          </h2>
          <div className="jr-grid">
            {ROUTES.map((r) => (
              <JournalCard key={r.href} {...r} />
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">This is not a niche problem</p>
          <div className="cols cols-start" style={{ marginTop: 12, gap: 56 }}>
            <Chart
              title="How common these conditions are, worldwide"
              bars={[
                { label: "Period pain", value: "71%", color: "var(--menstrual)" },
                { label: "PCOS", value: "13%", color: "var(--luteal)" },
                {
                  label: "Endometriosis",
                  value: "10%",
                  color: "var(--ovulatory)",
                },
              ]}
              caption="Estimated prevalence among women of reproductive age. Sources: WHO (2023); PAIN meta-analysis of 70 countries (2026)."
            />
            <div>
              <h2 style={{ fontSize: "clamp(26px,2.8vw,36px)" }}>
                Half the world moves through a cycle. The science has barely
                caught up.
              </h2>
              <p className="lede" style={{ maxWidth: "none" }}>
                Endometriosis takes seven to nine years to diagnose on average,
                and remains significantly underfunded relative to conditions of
                similar burden. Most women with PCOS are never diagnosed at all.
                The gap between what research knows and what women are told is
                enormous, and food guidance is one of the simplest ways to start
                closing it.
              </p>
              <p className="muted small">
                Sources: npj Women&apos;s Health (2024); WHO (2023).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap cols">
          <Reveal className="photo" style={{ aspectRatio: "5/4" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/groceries-smile.jpg"
              alt="A woman smiling while unpacking fresh groceries"
            />
          </Reveal>
          <div>
            <p className="eyebrow">Partner with us</p>
            <h2>Good food guidance travels through partners</h2>
            <p className="lede" style={{ maxWidth: "none" }}>
              We are building alongside corporate wellness programmes, healthcare
              providers, researchers, pharmacies, food brands, insurers, and
              media. If your organisation reaches women, we should talk.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 24,
              }}
            >
              <Link href="/partners" className="btn btn-quiet">
                See how we partner
              </Link>
              <Link href="/partners#enquiry" className="btn btn-primary">
                Become a partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band" id="waitlist">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>Science-backed cycle nutrition, in your inbox</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            Join our newsletter for sourced, practical guidance on eating for your
            cycle, plus new journal articles as they land. No noise, no selling.
          </p>
          <div style={{ marginTop: 36, textAlign: "left" }}>
            <SubscribeForm kind="newsletter" submitLabel="Subscribe">
              <div className="field">
                <label htmlFor="wl-email">Email address</label>
                <input
                  type="email"
                  id="wl-email"
                  name="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="wl-name">
                  First name <span className="opt">(optional)</span>
                </label>
                <input type="text" id="wl-name" name="first_name" />
              </div>
            </SubscribeForm>
            <p
              className="small muted"
              style={{ textAlign: "center", marginTop: 16 }}
            >
              We will only email you about CyclePlate. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
