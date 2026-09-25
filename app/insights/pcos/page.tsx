import { ArticleLayout, Sup } from "@/components/marketing/ArticleLayout";
import { Chart } from "@/components/marketing/Chart";

export const metadata = {
  title: "PCOS and the plate: what a low-GI diet really means",
  description:
    "PCOS affects up to 13% of women and most are never diagnosed. Why insulin sits at the centre of it, and what a 12-month trial found food could do.",
};

const REFERENCES = [
  {
    id: "ref1",
    text: <>World Health Organization. Polycystic ovary syndrome, fact sheet, 2023.</>,
    href: "https://www.who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
    label: "who.int/news-room/fact-sheets/detail/polycystic-ovary-syndrome",
  },
  {
    id: "ref2",
    text: (
      <>
        Marsh KA, et al. Effect of a low glycemic index diet on the reproductive
        and metabolic profile of women with PCOS.{" "}
        <em>American Journal of Clinical Nutrition</em>, 2010.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/20484445/",
    label: "pubmed.ncbi.nlm.nih.gov/20484445",
  },
  {
    id: "ref3",
    text: (
      <>
        Isocaloric low-GI dietary intervention and insulin sensitivity in PCOS.
        2013.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/23999280/",
    label: "pubmed.ncbi.nlm.nih.gov/23999280",
  },
];

export default function PcosArticle() {
  return (
    <ArticleLayout
      eyebrow="PCOS"
      title="PCOS and the plate: what a low-GI diet really means"
      readTime="9 min read"
      photo="/photos/buddha-bowl.jpg"
      alt="A colourful low-glycaemic bowl of food"
      references={REFERENCES}
      closing={{
        title: "You don't have to figure this out alone",
        body: "The PCOS category in our community is full of women sharing meals, swaps and hard-won insight.",
      }}
    >
      <p className="lede">
        Polycystic ovary syndrome is one of the most common hormonal conditions
        in women, and one of the most misunderstood. The phrase &quot;just eat
        low-GI&quot; gets thrown around a lot. Here is what that actually means,
        and what the research shows it can do.
      </p>

      <h2>A common condition, rarely diagnosed</h2>
      <p>
        The World Health Organization estimates that PCOS affects 10 to 13% of
        women of reproductive age, and that up to 70% of those affected are never
        formally diagnosed.
        <Sup n={1} /> That is an enormous number of women living with symptoms,
        irregular cycles, difficult skin, unpredictable weight, fertility
        struggles, without a name for what is happening.
      </p>

      <h2>Insulin is at the centre</h2>
      <p>
        For most women with PCOS, insulin resistance is a core driver. When cells
        respond less well to insulin, the body produces more of it, and higher
        insulin levels can push the ovaries to produce more androgens (male-type
        hormones), which disrupts ovulation and drives many of the symptoms. This
        is why what and how you eat matters so directly: food is one of the most
        powerful ways to influence insulin.
      </p>
      <p className="pull">
        If insulin is the lever, the glycaemic quality of your diet is one of the
        main ways to pull it.
      </p>

      <h2>What &quot;low-GI&quot; actually means</h2>
      <p>
        The glycaemic index ranks carbohydrate foods by how quickly they raise
        blood sugar. Low-GI foods release glucose slowly and steadily; high-GI
        foods spike it. A low-GI way of eating is not low-carb and not
        restrictive, it is about the <em>type</em> of carbohydrate:
      </p>
      <ul>
        <li>
          <strong>Choose more often:</strong> oats, beans and lentils,
          wholegrains, most vegetables, plain yoghurt, nuts, and whole fruit.
        </li>
        <li>
          <strong>Ease off:</strong> white bread, sugary cereals, sweetened
          drinks, and heavily processed snacks that spike blood sugar fast.
        </li>
        <li>
          <strong>A simple trick:</strong> pair carbohydrates with protein, fat
          or fibre, which blunts the blood-sugar rise.
        </li>
      </ul>

      <h2>What a year-long trial found</h2>
      <p>
        The standout study is a 12-month randomised trial published in the{" "}
        <em>American Journal of Clinical Nutrition</em>. Women with PCOS followed
        either a low-GI diet or a conventional healthy diet. Menstrual regularity
        improved in 95% of the low-GI group, compared with 63% of those on the
        conventional diet, and insulin sensitivity improved, independent of
        weight loss.
        <Sup n={2} /> That last point matters: the benefit was not simply about
        losing weight.
      </p>

      <div style={{ margin: "32px 0" }}>
        <Chart
          title="Share of women whose cycles became more regular (12 months)"
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
              Marsh KA et&nbsp;al.,{" "}
              <em>American Journal of Clinical Nutrition</em>, 2010.
            </>
          }
        />
      </div>

      <p>
        Other controlled work supports the mechanism: isocaloric low-GI diets
        have been shown to improve insulin sensitivity in women with PCOS without
        requiring weight change.
        <Sup n={3} /> In other words, it is the quality of the carbohydrate, not
        just the calories, that moves the needle.
      </p>

      <h2>Beyond the glycaemic index</h2>
      <p>
        A low-GI pattern pairs naturally with the rest of a hormone-supportive
        diet: plenty of fibre (which supports the gut&apos;s clearance of excess
        hormones), adequate protein, and anti-inflammatory fats like omega-3. You
        do not need imported superfoods. Beans, oats, eggs, vegetables and oily
        fish do the job in most kitchens in the world.
      </p>

      <h2>An important note</h2>
      <p>
        PCOS is a medical condition, and food is a supporting tool, not a
        replacement for care. If you suspect you have PCOS, a proper diagnosis
        matters, because management may also involve medication and monitoring.
        Use nutrition as one reliable, daily lever alongside your clinician, not
        instead of them.
      </p>
    </ArticleLayout>
  );
}
