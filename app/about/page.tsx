import Link from "next/link";

import { Reveal } from "@/components/marketing/Reveal";
import { Photo } from "@/components/marketing/Photo";

export const metadata = {
  title: "About",
  description:
    "CyclePlate closes the gap between cycle nutrition research and the plate, built on foods women actually cook with.",
};

const BELIEFS = [
  {
    title: "Women deserve evidence, not vibes",
    body: "Too much cycle guidance cites no medical literature at all. Every recommendation we make traces back to published research, and we show our sources in plain language.",
  },
  {
    title: "Good guidance meets you where you shop",
    body: "Nutrition advice that requires imported ingredients is advice for someone else. Local foods carry the same nutrients, and often better ones.",
  },
  {
    title: "Your data is yours",
    body: "Cycle data is intimate. We will never sell it, and anything shared with partners is aggregate and anonymised, with your consent, every time.",
  },
  {
    title: "Food is support, not treatment",
    body: "We are a wellness tool, not a clinic. We say so clearly, everywhere, and we encourage every woman with symptoms to seek real medical care.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 56 }}>
        <div className="wrap" style={{ maxWidth: 840 }}>
          <p className="eyebrow">About</p>
          <h1>Women wait a decade for answers. Dinner cannot wait that long.</h1>
          <p className="lede" style={{ maxWidth: "none" }}>
            The average endometriosis diagnosis takes seven to nine years. Most
            women with PCOS never get one at all. CyclePlate exists for all the
            days in between: the ordinary meals where food can quietly do its
            work.
          </p>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap cols">
          <div>
            <p className="eyebrow">Why we exist</p>
            <h2>The gap between the research and the plate</h2>
            <p className="muted">
              The science on cycle aligned nutrition is real and growing: omega 3
              fats for menstrual pain, low glycaemic eating for PCOS, magnesium
              for premenstrual symptoms. But it lives in journals, behind
              paywalls, written for other researchers.
            </p>
            <p className="muted">
              Meanwhile, the nutrition advice women actually receive assumes a
              body that never changes, and a grocery store that looks like a
              stock photo. Salmon and kale, everywhere, forever.
            </p>
            <p className="muted">
              CyclePlate closes that gap. We translate the evidence into daily
              guidance built on the foods women actually cook with, wherever they
              live, and we keep it grounded in the research the whole way
              through.
            </p>
          </div>
          <Photo src="/photos/kitchen-apple.jpg" alt="A woman cooking with fresh produce in her own kitchen" style={{ aspectRatio: "4/4.6" }} objectPosition="center 30%" />
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 880 }}>
          <h2>What we believe</h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 36,
              marginTop: 44,
            }}
          >
            {BELIEFS.map((belief) => (
              <Reveal key={belief.title}>
                <h3>{belief.title}</h3>
                <p className="muted" style={{ margin: 0, maxWidth: "64ch" }}>
                  {belief.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap cols">
          <Photo src="/photos/veg-joy.jpg" alt="A woman smiling with fresh colourful vegetables" style={{ aspectRatio: "5/4" }} />
          <div>
            <p className="eyebrow">More than guidance</p>
            <h2>Built with women, not just for them</h2>
            <p className="muted">
              Cycle health has been under-researched and under-discussed for
              generations, and a lot of what women know they learned from each
              other. Our community is where that knowledge lives: a place to ask
              the questions you were told not to, and to hear from women whose
              cycles and conditions look like yours.
            </p>
            <p className="muted">
              Everything we publish traces back to the evidence. Everything we
              learn, we learn alongside the people we build for.
            </p>
            <Link href="/join" className="btn btn-primary" style={{ marginTop: 12 }}>
              Join the community
            </Link>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 640, textAlign: "center" }}>
          <h2>Say hello</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            Questions, ideas, or just want to talk about cycle nutrition? We
            answer every email.
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
            <a href="mailto:hellocycleplate@gmail.com" className="btn btn-quiet">
              hellocycleplate@gmail.com
            </a>
            <Link href="/partners#enquiry" className="btn btn-primary">
              Partner with us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
