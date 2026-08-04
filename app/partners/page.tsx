import { Reveal } from "@/components/marketing/Reveal";
import { SubscribeForm } from "@/components/marketing/SubscribeForm";

export const metadata = {
  title: "Partners",
  description:
    "CyclePlate sits at the moment a woman decides what to eat today. We are opening a small number of launch partnerships.",
};

const WAYS = [
  {
    who: "Food delivery platforms",
    title: "Order the recommendation",
    body: "Phase aware meal suggestions that resolve to a real basket, so a woman can see what her body needs tonight and order the ingredients without a second search.",
  },
  {
    who: "Corporate wellness",
    title: "A benefit women actually use",
    body: "Cycle aware nutrition support as part of your employee wellbeing programme, with aggregate, anonymised engagement reporting and none of the surveillance.",
  },
  {
    who: "Healthcare providers",
    title: "Between appointment support",
    body: "Clinicians managing PCOS and endometriosis can point patients to structured daily food guidance that reinforces, never replaces, their care plan.",
  },
  {
    who: "Researchers",
    title: "Better data on women's nutrition",
    body: "Consent driven, ethics first collaboration on one of the most understudied areas in nutrition science, with populations that have long been left out finally represented.",
  },
  {
    who: "Pharmacies",
    title: "The next question after the counter",
    body: "Women managing cramps or hormonal symptoms ask pharmacists what else they can do. CyclePlate is a concrete, evidence grounded answer.",
  },
  {
    who: "Food brands",
    title: "Context, not banner ads",
    body: "If your product genuinely fits a phase, iron rich, high fibre, omega 3, it can appear as an ingredient option where it is relevant. Clearly labelled, always.",
  },
  {
    who: "Insurers",
    title: "Prevention that compounds",
    body: "Everyday nutrition support for hormonal conditions is one of the cheapest levers for long term outcomes. We are ready to design pilots that prove it.",
  },
  {
    who: "Media and creators",
    title: "Tell this story with us",
    body: "Cycle nutrition is underreported and widely misunderstood. We collaborate on accurate, sourced content that respects your audience's intelligence.",
  },
];

const STATS = [
  { n: "190M", l: "women live with endometriosis worldwide", cite: "WHO, 2023" },
  { n: "10–13%", l: "of women have PCOS, up to 70% undiagnosed", cite: "WHO, 2023" },
  { n: "71%", l: "of women experience period pain", cite: "PAIN, 2026" },
  {
    n: "7–9",
    l: "years of diagnostic delay for endometriosis",
    cite: "npj Women's Health, 2024",
  },
];

const ORG_TYPES = [
  "Food delivery platform",
  "Corporate wellness",
  "Healthcare provider",
  "Research institution",
  "Pharmacy",
  "Food brand",
  "Insurer",
  "Media or creator",
  "Other",
];

const INTERESTS = [
  ["integration", "Product integration"],
  ["wellness", "Employee wellness"],
  ["research", "Research"],
  ["content", "Content"],
  ["other", "Something else"],
];

export default function PartnersPage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 56 }}>
        <div className="wrap" style={{ maxWidth: 860 }}>
          <p className="eyebrow">Partners</p>
          <h1>Reach women where wellness decisions actually happen</h1>
          <p className="lede" style={{ maxWidth: "none" }}>
            CyclePlate sits at the moment a woman decides what to eat today. For
            platforms, providers, employers, and brands, that is a moment worth
            being part of. We are opening a small number of launch partnerships.
          </p>
          <a href="#enquiry" className="btn btn-primary" style={{ marginTop: 24 }}>
            Start a conversation
          </a>
        </div>
      </section>

      <section className="band alt">
        <div className="wrap">
          <h2>Eight ways to work with us</h2>
          <div className="pt-grid">
            {WAYS.map((way) => (
              <Reveal key={way.who} className="card">
                <div className="who">{way.who}</div>
                <h3>{way.title}</h3>
                <p className="muted" style={{ margin: 0 }}>
                  {way.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <p className="eyebrow">Why now</p>
          <h2 style={{ maxWidth: "22ch" }}>
            The need is enormous. The science is ready.
          </h2>
          <Reveal className="stat-row" style={{ marginTop: 44 }}>
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

      <section className="band alt" id="enquiry">
        <div className="wrap cols cols-start">
          <div>
            <h2>Start the conversation</h2>
            <p className="lede" style={{ maxWidth: "none" }}>
              Tell us who you are and what you have in mind. We read every enquiry
              and respond within two business days.
            </p>
            <p className="muted small">
              Prefer email? Write to us at{" "}
              <a href="mailto:info@hellocycleplate.com">
                info@hellocycleplate.com
              </a>
              .
            </p>
          </div>
          <div>
            <SubscribeForm kind="partner" submitLabel="Send enquiry">
              <div className="field">
                <label htmlFor="pf-org">Organisation name</label>
                <input type="text" id="pf-org" name="org_name" required />
              </div>
              <div className="field">
                <label htmlFor="pf-name">Your name</label>
                <input type="text" id="pf-name" name="contact_name" required />
              </div>
              <div className="field">
                <label htmlFor="pf-email">Work email</label>
                <input type="email" id="pf-email" name="email" required />
              </div>
              <div className="field">
                <label htmlFor="pf-type">Organisation type</label>
                <select id="pf-type" name="org_type" defaultValue={ORG_TYPES[0]}>
                  {ORG_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Partnership interest</label>
                <div className="checks">
                  {INTERESTS.map(([value, label]) => (
                    <label key={value}>
                      <input type="checkbox" name="interest" value={value} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field">
                <label htmlFor="pf-msg">
                  Tell us a little about what you have in mind{" "}
                  <span className="opt">(optional)</span>
                </label>
                <textarea id="pf-msg" name="message" />
              </div>
            </SubscribeForm>
          </div>
        </div>
      </section>
    </main>
  );
}
