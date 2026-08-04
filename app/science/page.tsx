import Link from "next/link";

import { Chart } from "@/components/marketing/Chart";
import { Reveal } from "@/components/marketing/Reveal";
import { Photo } from "@/components/marketing/Photo";

export const metadata = {
  title: "The Science",
  description:
    "Cycle aligned nutrition is a body of peer reviewed research on how hormones change nutritional needs across the month. Here is what the evidence says.",
};

/* Each phase alternates which side the photo sits on. The original did that
   with direction:rtl on the row and direction:ltr on both children to undo it,
   which reverses the writing direction of everything inside on the way past.
   A class that reorders the photo says the same thing without touching text. */
const PHASES = [
  {
    phase: "menstrual",
    mix: 13,
    solid: true,
    label: "Menstrual · Days 1 to 5",
    title: "Replenish and rest",
    body: "Oestrogen and progesterone are at their lowest, and blood loss draws down iron stores. The research supports iron rich foods paired with vitamin C for absorption, and omega 3 fats, which randomised trials link to measurably less menstrual pain.",
    think: "Think: leafy greens, beans, fish, citrus, ginger tea.",
    photo: "/photos/seafood-pasta.jpg",
    alt: "A warm bowl of seafood pasta rich in omega 3",
    flip: false,
  },
  {
    phase: "follicular",
    mix: 15,
    solid: false,
    label: "Follicular · Days 6 to 13",
    title: "Build and energise",
    body: "Oestrogen climbs and energy returns. Your body is building the uterine lining and preparing to ovulate. Studies point to fermented foods for gut health, and cruciferous vegetables whose compounds support healthy oestrogen metabolism.",
    think: "Think: vegetables in variety, eggs, fermented grains, seeds.",
    photo: "/photos/veg-joy.jpg",
    alt: "A woman delighting in fresh colourful vegetables",
    flip: true,
  },
  {
    phase: "ovulatory",
    mix: 18,
    solid: false,
    label: "Ovulatory · Days 14 to 16",
    title: "Peak and protect",
    body: "Oestrogen peaks and inflammation sensitivity rises with it. The evidence favours antioxidant rich foods and fibre, which supports the gut's clearance of the oestrogen surge once it has done its work.",
    think: "Think: berries, peppers, whole grains, plenty of water.",
    photo: "/photos/buddha-bowl.jpg",
    alt: "A colourful antioxidant rich buddha bowl",
    flip: false,
  },
  {
    phase: "luteal",
    mix: 14,
    solid: true,
    label: "Luteal · Days 17 to 28",
    title: "Nourish and calm",
    body: "Progesterone rises, insulin sensitivity dips, and cravings follow. Clinical studies link magnesium and vitamin B6 to steadier mood and fewer premenstrual symptoms, and complex carbohydrates keep blood sugar level when it matters most.",
    think: "Think: dark chocolate, bananas, sweet potato, nuts, whole grains.",
    photo: "/photos/breakfast-smile.jpg",
    alt: "A woman enjoying a calm, nourishing breakfast",
    flip: true,
  },
];

export default function SciencePage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 56 }}>
        <div className="wrap" style={{ maxWidth: 820 }}>
          <p className="eyebrow">The Science</p>
          <h1>The science is real. We just made it accessible.</h1>
          <p className="lede" style={{ maxWidth: "none" }}>
            Cycle aligned nutrition is not a wellness trend. It is a body of peer
            reviewed research on how hormones change nutritional needs across the
            month, and what food can do about it. Here is what the evidence
            actually says.
          </p>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <h2>The four phases</h2>
          <p className="lede">
            One cycle, four hormonal environments. Each asks something different
            of your plate.
          </p>

          {PHASES.map((p) => (
            <div
              className={`phase-row${p.flip ? " flip" : ""}`}
              key={p.phase}
            >
              <div>
                <span
                  className="phase-chip"
                  style={{
                    background: `color-mix(in srgb,var(--${p.phase}) ${p.mix}%,var(--bg))`,
                    color: p.solid
                      ? `var(--${p.phase})`
                      : `color-mix(in srgb,var(--${p.phase}) 70%,var(--ink))`,
                  }}
                >
                  <span className="dot" style={{ background: `var(--${p.phase})` }} />
                  {p.label}
                </span>
                <h3 style={{ marginTop: 18 }}>{p.title}</h3>
                <p className="muted">{p.body}</p>
                <p className="small muted">{p.think}</p>
              </div>
              <Photo src={p.photo} alt={p.alt} />
            </div>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 880 }}>
          <h2>PCOS, cramps, and endometriosis</h2>
          <p className="lede">
            Three conditions, three bodies of evidence that food makes a
            difference.
          </p>

          <div style={{ marginTop: 48 }}>
            <h3>PCOS</h3>
            <p className="muted" style={{ maxWidth: "64ch" }}>
              PCOS affects an estimated 10 to 13% of women globally, and up to
              70% of those affected are never formally diagnosed. Insulin
              resistance is central to the condition, which is exactly why food
              matters: low-glycaemic diets have been shown in controlled studies
              to improve insulin sensitivity and menstrual regularity in women
              with PCOS, independent of weight change.
            </p>
            <div style={{ marginTop: 24, maxWidth: 560 }}>
              <Chart
                title="Menstrual regularity improved over 12 months"
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
                    Marsh et&nbsp;al.,{" "}
                    <em>American Journal of Clinical Nutrition</em>, 2010.
                  </>
                }
              />
            </div>
          </div>

          <div className="cond-split">
            <div>
              <h3>Dysmenorrhoea</h3>
              <p className="muted" style={{ maxWidth: "60ch" }}>
                Around 71% of women experience period pain, a figure pooled
                across 70 countries. In randomised trials, omega-3
                supplementation reduced pain intensity enough that participants
                needed significantly less ibuprofen, and a meta-analysis of 12
                trials found a large overall effect. Magnesium shows similar
                promise for cramping and associated low mood.
              </p>
            </div>
            <div className="stat" style={{ paddingTop: 6 }}>
              <div className="n" style={{ color: "var(--menstrual)" }}>
                71%
              </div>
              <div className="l">
                experience period pain
                <span className="cite">PAIN, 2026</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3>Endometriosis</h3>
            <p className="muted" style={{ maxWidth: "64ch" }}>
              190 million women live with endometriosis, waiting seven to nine
              years on average for a diagnosis. It is an inflammatory condition,
              and dietary patterns rich in omega-3 fats, fibre, and antioxidants
              are associated in the literature with lower inflammatory load and
              reduced symptom burden. Food is not a cure. It is a lever that is
              available every single day.
            </p>
          </div>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap cols">
          <div>
            <p className="eyebrow">Why local foods matter</p>
            <h2>The science works everywhere. The shopping list should adapt.</h2>
            <p className="lede" style={{ maxWidth: "none" }}>
              A recommendation is only useful if you can act on it. The same
              nutrients that make an expensive superfood work are found in
              ordinary, affordable ingredients almost everywhere. What matters is
              the omega-3, the iron, the fibre, the magnesium, not the brand on
              the label. CyclePlate translates the evidence into the foods
              already around you.
            </p>
          </div>
          <Photo src="/photos/kitchen-apple.jpg" alt="A woman in her kitchen with fresh local produce" style={{ aspectRatio: "5/4" }} />
        </div>
      </section>

      <section className="band">
        <div className="wrap" style={{ maxWidth: 720, textAlign: "center" }}>
          <h2>A note on what we are, and what we are not</h2>
          <p className="lede" style={{ margin: "0 auto" }}>
            CyclePlate is a wellness tool grounded in published research. It is
            not medical advice, diagnosis, or treatment, and it will never
            pretend to be. If something feels wrong, see a clinician. For
            everything in between, we are here to help you eat well for the body
            you have today.
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 32,
            }}
          >
            <Link href="/join" className="btn btn-primary">
              Join the community
            </Link>
            <Link href="/journal" className="btn btn-quiet">
              Read the journal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
