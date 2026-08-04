import Link from "next/link";

import { Reveal } from "@/components/marketing/Reveal";
import { getViewer } from "@/lib/supabase/server";

export const metadata = {
  title: "Community",
  description:
    "A space for women to talk openly about their health, cycles and bodies. Ask a question, share what worked, and hear from women who have lived the same thing.",
};

/* The public face of the community.
 *
 * This is a marketing page and stays one. The community itself is an
 * application behind a sign in, at /app, and the only job of this page is to
 * explain what is in there and open the door. It used to end in a sign up form
 * that collected an email and posted it to a spreadsheet, which was a stand in
 * for an account. Real accounts exist now, so the form is a call to action.
 */

/* The six shown here are real categories in the feed, so each one links to it
   filtered. Naming a circle the product does not have is the kind of small lie
   that gets discovered thirty seconds after signing up. */
const CIRCLES = [
  {
    slug: "pcos-journey",
    label: "PCOS",
    phase: "luteal",
    mix: 14,
    solid: true,
    body: "Managing insulin, cycles, cravings and everything in between, together.",
  },
  {
    slug: "endometriosis",
    label: "Endometriosis",
    phase: "ovulatory",
    mix: 16,
    solid: false,
    body: "For the long road to diagnosis and the daily work of living well with it.",
  },
  {
    slug: "period-pain",
    label: "Period pain",
    phase: "menstrual",
    mix: 12,
    solid: true,
    body: "What actually helps with cramps, from heat to omega-3 to when to see a doctor.",
  },
  {
    slug: "pms-and-mood",
    label: "PMS & mood",
    phase: "follicular",
    mix: 16,
    solid: false,
    body: "The luteal-phase dip, cravings and low mood, and the food that steadies them.",
  },
  {
    slug: "cravings",
    label: "Cravings",
    phase: "accent",
    mix: 14,
    solid: true,
    body: "What you want and when you want it, and the swaps that actually satisfy.",
  },
  {
    slug: "first-periods",
    label: "First periods",
    phase: "ink2",
    mix: 16,
    solid: true,
    body: "For the beginning of it all, and for the people helping someone through it.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Sign up",
    body: "Create a free account. We give you a handle, so your name and email are never shown next to anything you post.",
  },
  {
    n: "2",
    title: "Ask anything",
    body: "Post a question about your cycle, symptoms or nutrition, and choose the category it belongs in.",
  },
  {
    n: "3",
    title: "Hear from women who relate",
    body: "Get insight from women who have been there, plus sourced notes from our team.",
  },
];

const THREADS = [
  {
    asker: { initial: "A", colour: "var(--luteal)" },
    meta: "Amara · PCOS · 2 days ago",
    question:
      "I keep reading that a “low-GI diet” helps PCOS but I don't really know what that means day to day. What do you actually eat for breakfast?",
    answerer: { initial: "N", colour: "var(--follicular)" },
    answerMeta: "Ngozi",
    badge: "Member",
    answer:
      "Swapping white bread and sugary cereal for eggs, beans, oats with nuts and plain yoghurt made the biggest difference for me. My energy stopped crashing by mid-morning. It took a few weeks to feel it but my cycles got more regular too.",
  },
  {
    asker: { initial: "P", colour: "var(--menstrual)" },
    meta: "Posted anonymously · Period pain · 5 days ago",
    question:
      "Does anything genuinely help cramps, or am I stuck with painkillers every month? Honestly asking.",
    answerer: { initial: "L", colour: "var(--ovulatory)" },
    answerMeta: "Lola",
    badge: "Member",
    answer:
      "Heat and gentle movement help me a lot on day one. I also started eating more oily fish and it took the edge off over a couple of months. The omega-3 research on this is actually solid, but please still see a doctor if the pain is severe, that's not something to just push through.",
  },
  {
    asker: { initial: "T", colour: "var(--follicular)" },
    meta: "Temi · PMS & mood · 1 week ago",
    question:
      "The week before my period my mood absolutely tanks and I crave everything. Is that normal or is something wrong with me?",
    answerer: { initial: "CP", colour: "var(--accent)" },
    answerMeta: "CyclePlate Team",
    badge: "Sourced note",
    answer:
      "You are very much not alone, this is the luteal phase, when progesterone rises and insulin sensitivity dips. Double-blind trials have found magnesium and vitamin B6 reduce PMS severity versus placebo, and complex carbohydrates help keep blood sugar steady. It's real, it's common, and food genuinely helps.",
  },
];

const RULES = [
  {
    title: "Kindness first",
    body: "Every woman's experience is valid. No judgement, no shaming, no diet policing. Ever.",
  },
  {
    title: "Support, not diagnosis",
    body: "The community is peer support and sourced information. It is not a substitute for a clinician, and we will always tell you when it's time to see one.",
  },
  {
    title: "Privacy is protected",
    body: "You post under a handle we generate, never your name or your email. What you share stays within the community, and we never sell your data.",
  },
];

export default async function CommunityPage() {
  const viewer = await getViewer();

  /* Somebody who is already a member should be offered the door they actually
     want. Asking a member to join is the tell that two things were bolted
     together rather than built as one. */
  const primary = viewer
    ? { href: "/app", label: "Go to the community" }
    : { href: "/join", label: "Join the community" };

  return (
    <main>
      <section className="band" style={{ paddingBottom: 56 }}>
        <div className="wrap cols">
          <div>
            <p className="eyebrow">Community</p>
            <h1>Ask the questions you were told not to.</h1>
            <p className="lede" style={{ maxWidth: "none" }}>
              CyclePlate&apos;s community is a space for women to talk openly
              about their health, cycles, and bodies. Ask a question, share what
              worked for you, and hear from women who have lived the same thing.
              Everything grounded in respect, and where it matters, in the
              evidence.
            </p>
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <Link href={primary.href} className="btn btn-primary">
                {primary.label}
              </Link>
              <a href="#threads" className="btn btn-quiet">
                See what women are asking
              </a>
            </div>
          </div>
          <Reveal className="photo" style={{ aspectRatio: "4/4.4" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/photos/groceries-smile.jpg"
              alt="A woman smiling warmly"
              style={{ objectPosition: "center 30%" }}
            />
          </Reveal>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <p className="eyebrow">How the community works</p>
          <h2 style={{ maxWidth: "22ch" }}>
            A simple, kind way to get real answers
          </h2>
          <div className="feat-grid">
            {STEPS.map((step) => (
              <div key={step.n} style={{ display: "flex", gap: 18 }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 40,
                    color: "var(--accent)",
                    lineHeight: 1,
                    flex: "none",
                  }}
                >
                  {step.n}
                </div>
                <div>
                  <h3 style={{ fontSize: 19, margin: "2px 0 6px" }}>
                    {step.title}
                  </h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Circles</p>
          <h2 style={{ maxWidth: "20ch" }}>
            Find the women who understand your experience
          </h2>
          <div className="circle-grid">
            {CIRCLES.map((circle) => (
              <Reveal key={circle.slug} className="card circle-card">
                <span
                  className="phase-chip"
                  style={{
                    background: `color-mix(in srgb,var(--${circle.phase}) ${circle.mix}%,var(--card))`,
                    color: circle.solid
                      ? `var(--${circle.phase})`
                      : `color-mix(in srgb,var(--${circle.phase}) 70%,var(--ink))`,
                  }}
                >
                  <span
                    className="dot"
                    style={{ background: `var(--${circle.phase})` }}
                  />
                  {circle.label}
                </span>
                <p style={{ margin: "14px 0 0" }} className="muted">
                  {circle.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt" id="threads">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">Inside the community</p>
          <h2>Real questions, real insight</h2>
          <p className="lede">
            A glimpse of the kinds of conversations happening every day.
          </p>
          <div className="qa-thread">
            {THREADS.map((thread) => (
              <Reveal key={thread.meta} className="qa-card">
                <div className="qa-q">
                  <div
                    className="qa-av"
                    style={{ background: thread.asker.colour }}
                  >
                    {thread.asker.initial}
                  </div>
                  <div>
                    <div className="qa-meta">{thread.meta}</div>
                    <p style={{ margin: 0 }}>{thread.question}</p>
                  </div>
                </div>
                <div className="qa-a">
                  <div
                    className="qa-av"
                    style={{ background: thread.answerer.colour }}
                  >
                    {thread.answerer.initial}
                  </div>
                  <div>
                    <div className="qa-meta">
                      {thread.answerMeta}{" "}
                      <span className="qa-badge">{thread.badge}</span> · replied
                    </div>
                    <p style={{ margin: 0 }}>{thread.answer}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 880 }}>
          <h2>A few house rules</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 32,
              marginTop: 40,
            }}
          >
            {RULES.map((rule) => (
              <Reveal key={rule.title}>
                <h3>{rule.title}</h3>
                <p className="muted" style={{ margin: 0, maxWidth: "64ch" }}>
                  {rule.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Where the sign up form used to be. It collected an email into a
          spreadsheet because there was nothing to sign up to; there is now. */}
      <section className="band alt" id="join">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>{viewer ? "Your community is waiting" : "Come and join us"}</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            {viewer
              ? `You are signed in as ${viewer.display_name}. Pick up where you left off.`
              : "It is free. Create an account, choose a category, and start asking, or just read for a while. There is no wrong way to be here."}
          </p>
          <div style={{ marginTop: 32 }}>
            <Link href={primary.href} className="btn btn-primary">
              {primary.label}
            </Link>
          </div>
          {!viewer ? (
            <p className="small muted" style={{ marginTop: 20 }}>
              Already a member?{" "}
              <Link href="/auth/sign-in">Sign in</Link>.
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
