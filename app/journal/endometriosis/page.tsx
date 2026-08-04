import { ArticleLayout, Sup } from "@/components/marketing/ArticleLayout";

export const metadata = {
  title: "Endometriosis: the long wait, and eating for inflammation",
  description:
    "190 million women live with endometriosis, and diagnosis takes seven to nine years. What an anti-inflammatory diet can realistically offer.",
};

const REFERENCES = [
  {
    id: "ref1",
    text: <>World Health Organization. Endometriosis, fact sheet, 2023.</>,
    href: "https://www.who.int/news-room/fact-sheets/detail/endometriosis",
    label: "who.int/news-room/fact-sheets/detail/endometriosis",
  },
  {
    id: "ref2",
    text: (
      <>
        Endometriosis: diagnostic delay and research funding.{" "}
        <em>npj Women&apos;s Health</em>, 2024.
      </>
    ),
    href: "https://www.nature.com/articles/s44294-024-00048-6",
    label: "nature.com/articles/s44294-024-00048-6",
  },
  {
    id: "ref3",
    text: (
      <>
        Sienko A, et al. The role of omega-3 fatty acids and anti-inflammatory
        diet in endometriosis: a systematic review. 2023.
      </>
    ),
    href: "https://pubmed.ncbi.nlm.nih.gov/37768015/",
    label: "pubmed.ncbi.nlm.nih.gov/37768015",
  },
];

export default function EndometriosisArticle() {
  return (
    <ArticleLayout
      eyebrow="Endometriosis"
      title="Endometriosis: the long wait, and eating for inflammation"
      readTime="8 min read"
      photo="/photos/seafood-pasta.jpg"
      alt="An omega-3 rich seafood dish"
      references={REFERENCES}
      closing={{
        title: "Talk to women who understand the wait",
        body: "Our endometriosis category is a space for the long road to diagnosis and everything after it.",
      }}
    >
      <p className="lede">
        Endometriosis affects around one in ten women, yet it remains one of the
        most under-recognised and underfunded conditions in medicine. While
        diagnosis and treatment slowly improve, many women want to know: is there
        anything I can do in the meantime? The honest answer involves food, and
        honesty about its limits.
      </p>

      <h2>A condition hiding in plain sight</h2>
      <p>
        The World Health Organization estimates endometriosis affects roughly 10%
        of reproductive-age women and girls globally, about 190 million people.
        <Sup n={1} /> It occurs when tissue similar to the uterine lining grows
        outside the uterus, causing inflammation, pain and often scarring.
        Despite how common it is, women wait an average of seven to nine years
        for a diagnosis, and research into the condition has been significantly
        underfunded relative to diseases of comparable burden.
        <Sup n={2} />
      </p>
      <p className="pull">
        Seven to nine years is a long time to live with pain and no name for it.
        Food cannot close that gap, but it can help you cope inside it.
      </p>

      <h2>Why inflammation is the key word</h2>
      <p>
        Endometriosis is fundamentally an inflammatory condition. The lesions
        provoke an inflammatory response, which drives pain and can contribute to
        the cycle of tissue growth. That is why so much of the dietary research
        focuses not on any single &quot;cure food&quot; but on an overall
        anti-inflammatory pattern of eating.
      </p>

      <h2>What the research suggests about food</h2>
      <h3>Omega-3 fats</h3>
      <p>
        Omega-3 fatty acids, particularly EPA, have well-documented
        anti-inflammatory properties, and reviews of the evidence highlight their
        relevance to endometriosis, where anti-inflammatory dietary components
        are associated with reduced inflammation and angiogenesis in studies.
        <Sup n={3} /> Practically, that points to oily fish and other omega-3
        sources featuring regularly in the diet.
      </p>

      <h3>Fibre and antioxidants</h3>
      <p>
        Diets rich in fibre, fruit and vegetables provide antioxidants that help
        counter oxidative stress, and fibre supports the gut&apos;s role in
        clearing excess oestrogen, a hormone that can feed endometrial tissue
        growth. A pattern built around vegetables, wholegrains, legumes and fruit
        is a recurring theme in the literature.
      </p>

      <h3>What to ease off</h3>
      <p>
        The flip side of an anti-inflammatory diet is reducing the things that
        promote inflammation: very high intakes of ultra-processed foods, trans
        fats and excess sugar. The goal is not perfection or restriction, it is
        shifting the overall balance.
      </p>

      <h2>A realistic picture</h2>
      <p>
        It is important to be clear-eyed here. The dietary evidence in
        endometriosis is promising but still developing, and studies vary in
        quality. Food is not a treatment for endometriosis, and it is certainly
        not a substitute for medical or surgical care. What it can offer is a
        daily, accessible way to reduce your body&apos;s inflammatory load and,
        for some women, to take the edge off symptoms while they navigate the
        medical system.
      </p>

      <h2>If this is you</h2>
      <p>
        If you have persistent, severe pain, especially pain that disrupts your
        life or has changed suddenly, please push for medical assessment, and
        keep pushing if you are dismissed. The long diagnostic delay is a failure
        of the system, not of you. Use food as one steady tool in your corner,
        and use it alongside, never instead of, proper care.
      </p>
    </ArticleLayout>
  );
}
