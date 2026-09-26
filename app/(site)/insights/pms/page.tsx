import { ArticleLayout, Sup } from "@/components/marketing/ArticleLayout";

export const metadata = {
  title: "The week before your period: understanding the luteal dip",
  description:
    "The cravings and low mood are real, and they have a name. What happens to your hormones, and how magnesium, B6 and steady blood sugar help.",
};

const REFERENCES = [
  {
    id: "ref1",
    text: (
      <>
        Fathizadeh N, et al. Evaluating the effect of magnesium and magnesium
        plus vitamin B6 supplement on the severity of premenstrual syndrome.
        2010.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/22069417/",
    label: "pubmed.ncbi.nlm.nih.gov/22069417",
  },
  {
    id: "ref2",
    text: (
      <>
        Ebrahimi E, et al. Effects of magnesium and vitamin B6 on the severity of
        premenstrual syndrome symptoms (double-blind trial). 2012.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/25276694/",
    label: "pubmed.ncbi.nlm.nih.gov/25276694",
  },
];

export default function PmsArticle() {
  return (
    <ArticleLayout
      eyebrow="PMS & mood"
      title="The week before your period: understanding the luteal dip"
      readTime="7 min read"
      photo="/photos/breakfast-smile.jpg"
      alt="A woman enjoying a calm, nourishing breakfast"
      references={REFERENCES}
      closing={{
        title: "Share your luteal-phase hacks",
        body: "The PMS and mood category is where women trade what genuinely helps the week before.",
      }}
    >
      <p className="lede">
        The cravings, the low mood, the sudden urge to reorganise your whole life
        or cry at an advert, the week before your period is real, it has a name,
        and there is genuine science on how food can steady it.
      </p>

      <h2>What is actually happening</h2>
      <p>
        The two weeks after ovulation are called the luteal phase. During this
        window, progesterone rises and then, if you are not pregnant, both
        progesterone and oestrogen fall away sharply just before your period.
        That hormonal shift is behind the familiar cluster of premenstrual
        symptoms: irritability and low mood, bloating, breast tenderness,
        fatigue, and cravings, especially for sugar and carbohydrates.
      </p>
      <p>
        There is also a metabolic piece. Insulin sensitivity tends to dip in the
        luteal phase, which means your blood sugar can swing more easily, and
        blood-sugar crashes feed both cravings and mood dips. This is why steady
        eating matters more in this phase than at any other point in your cycle.
      </p>
      <p className="pull">
        You are not imagining it, and you are not weak. Your body is moving
        through a real hormonal shift, and food is one of the gentlest ways to
        support it.
      </p>

      <h2>What the research says helps</h2>
      <h3>Magnesium and vitamin B6</h3>
      <p>
        This pairing has some of the most encouraging evidence in the
        premenstrual literature. A double-blind trial found that magnesium
        combined with vitamin B6 was more effective than either magnesium alone
        or placebo at reducing the severity of PMS symptoms.
        <Sup n={1} /> A separate double-blind study reached a similar conclusion,
        with both magnesium and B6 significantly lowering PMS severity scores.
        <Sup n={2} /> Magnesium-rich foods include dark leafy greens, beans,
        nuts, seeds, wholegrains and dark chocolate; B6 shows up in bananas,
        poultry, fish, chickpeas and potatoes.
      </p>

      <h3>Steady, complex carbohydrates</h3>
      <p>
        Because blood sugar is more volatile in this phase, complex
        carbohydrates, oats, wholegrains, beans, sweet potato, help keep energy
        and mood level and take the sharp edge off cravings. Pairing them with
        protein and healthy fat slows the release further. Reaching for a
        wholegrain option rather than a sugary quick fix is a small change that
        pays off in this specific window.
      </p>

      <h3>Enough of the basics</h3>
      <p>
        Adequate protein, plenty of vegetables and fibre, and staying hydrated
        all support a smoother luteal phase. Fibre in particular helps the body
        clear excess oestrogen through the gut, which is part of keeping hormones
        in balance.
      </p>

      <h2>A practical luteal-phase plate</h2>
      <ul>
        <li>
          <strong>Breakfast:</strong> oats or eggs with something fibrous, rather
          than sugary cereal, to start the day steady.
        </li>
        <li>
          <strong>Snacks:</strong> nuts, dark chocolate, fruit with yoghurt,
          magnesium and satisfaction in one.
        </li>
        <li>
          <strong>Dinner:</strong> complex carbs plus protein and vegetables,
          e.g. beans and wholegrains with plenty of greens.
        </li>
        <li>
          <strong>Go easy on:</strong> big sugar hits and excess caffeine and
          alcohol, which can worsen mood swings and disrupt sleep.
        </li>
      </ul>

      <h2>When to seek more support</h2>
      <p>
        For most women, premenstrual symptoms are uncomfortable but manageable.
        For some, though, they are severe enough to disrupt daily life, this may
        be premenstrual dysphoric disorder (PMDD), which is a recognised medical
        condition and deserves proper care. If your low mood is intense,
        persistent, or affects your ability to function, please talk to a
        clinician. Food helps with the everyday dip. It is not a treatment for
        PMDD or depression.
      </p>
    </ArticleLayout>
  );
}
