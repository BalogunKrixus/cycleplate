import { ArticleLayout, Sup } from "@/components/marketing/ArticleLayout";

export const metadata = {
  title: "Why your period hurts, and what food can actually do about it",
  description:
    "Around 71% of women experience period pain. The research on omega-3, magnesium and anti-inflammatory eating is more encouraging than most of us were told.",
};

const REFERENCES = [
  {
    id: "ref1",
    text: (
      <>
        Worldwide prevalence of dysmenorrhoea: a systematic review and
        meta-analysis. <em>PAIN</em>, 2026.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/41031966/",
    label: "pubmed.ncbi.nlm.nih.gov/41031966",
  },
  {
    id: "ref2",
    text: (
      <>
        Armour M, et al. The prevalence and academic impact of dysmenorrhea in
        21,573 young women. <em>Journal of Women&apos;s Health</em>, 2019.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/31170024/",
    label: "pubmed.ncbi.nlm.nih.gov/31170024",
  },
  {
    id: "ref3",
    text: (
      <>
        Snipe RMJ, et al. Omega-3 long-chain PUFAs and dysmenorrhoea: a
        systematic review and meta-analysis. 2023.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/37545015/",
    label: "pubmed.ncbi.nlm.nih.gov/37545015",
  },
  {
    id: "ref4",
    text: (
      <>
        Mohammadi MM, et al. Effect of omega-3 fatty acids on primary
        dysmenorrhoea: a meta-analysis. 2022.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/35059756/",
    label: "pubmed.ncbi.nlm.nih.gov/35059756",
  },
  {
    id: "ref5",
    text: (
      <>
        Zafari M, et al. Comparison of omega-3 and ibuprofen for primary
        dysmenorrhoea (double-blind crossover RCT). 2012.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/22261128/",
    label: "pubmed.ncbi.nlm.nih.gov/22261128",
  },
  {
    id: "ref6",
    text: (
      <>
        Fathizadeh N, et al. Magnesium and magnesium plus vitamin B6 for
        premenstrual syndrome. 2010.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/22069417/",
    label: "pubmed.ncbi.nlm.nih.gov/22069417",
  },
  {
    id: "ref7",
    text: (
      <>
        Endometriosis: research and diagnostic delay.{" "}
        <em>npj Women&apos;s Health</em>, 2024.
      </>
    ),
    href: "https://www.nature.com/articles/s44294-024-00048-6",
    label: "nature.com/articles/s44294-024-00048-6",
  },
];

export default function PeriodPainArticle() {
  return (
    <ArticleLayout
      eyebrow="Period pain"
      title="Why your period hurts, and what food can actually do about it"
      readTime="8 min read"
      photo="/photos/cramps-sofa.jpg"
      alt="A woman resting on a sofa with a hot water bottle"
      references={REFERENCES}
      closing={{
        title: "Compare notes with women who get it",
        body: "Our period pain category is full of women sharing what actually helped them.",
      }}
    >
      <p className="lede">
        For something so common, period pain is remarkably under-discussed. Most
        of us were handed a packet of painkillers and told it was just part of
        being a woman. The research tells a more useful story, and food plays a
        bigger role in it than you might expect.
      </p>

      <h2>Just how common is it?</h2>
      <p>
        Period pain, or dysmenorrhoea, is not a minor issue affecting a few
        unlucky people. A 2026 systematic review and meta-analysis that pooled
        data across 70 countries put the worldwide prevalence at roughly 71%.
        <Sup n={1} /> A large study of more than 21,000 young women found a
        strikingly similar figure, and went further: about one in five reported
        missing school or university because of the pain, and 41% said it hurt
        their concentration or performance in class.
        <Sup n={2} />
      </p>
      <p className="pull">
        This is not something to quietly endure. It is a health issue that
        affects how women learn, work and live, every single month.
      </p>

      <h2>Why does it hurt in the first place?</h2>
      <p>
        Most period pain is driven by prostaglandins, hormone-like compounds your
        body releases to help the uterus contract and shed its lining. Higher
        prostaglandin levels mean stronger contractions, less blood flow to the
        muscle, and more pain. Prostaglandins are also inflammatory, which is
        part of why an anti-inflammatory approach to eating shows up again and
        again in the research.
      </p>

      <h2>What the evidence says food can do</h2>
      <h3>Omega-3 fatty acids</h3>
      <p>
        This is where the evidence is strongest. A 2023 systematic review and
        meta-analysis of 12 randomised controlled trials, covering 881 women,
        found that omega-3 long-chain fatty acids taken over two to three months
        produced a large reduction in menstrual pain.
        <Sup n={3} /> A separate meta-analysis reached the same conclusion,
        reporting a substantial drop in the severity of primary dysmenorrhoea.
        <Sup n={4} />
      </p>
      <p>
        One of the clearest individual trials was a double-blind,
        placebo-controlled crossover study: after three months of omega-3, women
        reported markedly less pain, and crucially, needed fewer rescue doses of
        ibuprofen than when they took a placebo.
        <Sup n={5} /> In practice that means oily fish and, where relevant, a
        quality omega-3 source in your diet.
      </p>

      <h3>Magnesium</h3>
      <p>
        Magnesium is involved in muscle relaxation, which is exactly what a
        cramping uterus needs. It also appears repeatedly in the
        premenstrual-symptom literature, often paired with vitamin B6, where it
        is linked to steadier mood and fewer symptoms in the days before a
        period.
        <Sup n={6} /> Magnesium-rich foods, like dark leafy greens, beans, nuts
        and wholegrains, are an easy, low-risk place to start.
      </p>

      <h3>An anti-inflammatory pattern overall</h3>
      <p>
        Because prostaglandins are inflammatory, an eating pattern that is
        generally rich in vegetables, fibre, omega-3 fats and antioxidants, and
        lighter on ultra-processed food, gives your body less to fight against.
        It is not a single magic ingredient; it is the overall pattern that
        matters.
      </p>

      <h2>What to actually eat</h2>
      <ul>
        <li>
          <strong>During your period:</strong> iron-rich foods (beans, leafy
          greens, red meat if you eat it) paired with vitamin C for absorption,
          plus oily fish or another omega-3 source.
        </li>
        <li>
          <strong>Every day:</strong> plenty of vegetables and fibre,
          magnesium-rich foods, and water.
        </li>
        <li>
          <strong>Worth easing off:</strong> very high intakes of ultra-processed
          and sugary foods, which push the body toward inflammation.
        </li>
      </ul>

      <h2>When food is not enough</h2>
      <p>
        This matters: diet is a lever, not a cure. Severe period pain, pain that
        stops you functioning, or pain that has suddenly changed can be a sign of
        an underlying condition such as endometriosis, which takes seven to nine
        years to diagnose on average.
        <Sup n={7} /> If that sounds like you, please see a clinician. Food can
        help with the everyday. It should never replace medical care when your
        body is telling you something is wrong.
      </p>
    </ArticleLayout>
  );
}
