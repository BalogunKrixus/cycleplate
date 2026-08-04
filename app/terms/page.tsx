import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description:
    "We translate published research into food guidance, we are not your doctor, and the community only works if everyone is kind.",
};

export default function TermsPage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="article-hero">
            <p className="eyebrow">Legal</p>
            <h1>Terms of Service</h1>
            <p className="lede" style={{ maxWidth: "none" }}>
              The short version: we translate published research into food
              guidance, we are not your doctor, and the community only works if
              everyone is kind. The longer version follows.
            </p>
            <div className="article-meta">
              <span>Last updated 4 August 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="article">
            <h2>Using CyclePlate</h2>
            <p>
              By using this site, subscribing to the newsletter, joining the
              community or sending a partner enquiry, you agree to these terms.
              If you do not agree with them, please do not use the site.
            </p>

            <h2>This is not medical advice</h2>
            <p className="pull">
              CyclePlate is a nutrition wellness tool. It is not medical advice,
              diagnosis, or treatment, and it will never pretend to be.
            </p>
            <p>
              Everything we publish is general information drawn from published
              research. It is not tailored to you, it does not account for your
              medical history, medication or allergies, and reading it does not
              create a clinical relationship between us.
            </p>
            <p>
              Always talk to a qualified clinician before making significant
              changes to your diet, particularly if you are pregnant or
              breastfeeding, are managing a diagnosed condition, or are taking
              medication. If your symptoms are severe, persistent, or have
              changed suddenly, seek medical care. Never delay or disregard
              medical advice because of something you read here.
            </p>

            <h2>What the research means, and does not</h2>
            <p>
              We cite peer-reviewed studies and link to their sources so you can
              read them yourself. Research describes what happened across a group
              of people; it does not promise what will happen for you. Findings
              also change over time. We correct things when we get them wrong,
              but we cannot guarantee that every claim on the site reflects the
              most recent evidence at the moment you read it.
            </p>

            <h2>The community</h2>
            <p>
              Members share their own experience, not professional guidance.
              Treat it as peer support: useful, human, and not a substitute for a
              clinician. Some members carry a badge showing they are a verified
              professional; that badge says we have checked who they are, not
              that their reply is a consultation.
            </p>
            <ul>
              <li>
                <strong>Kindness first.</strong> Every woman&apos;s experience is
                valid. No judgement, no shaming, no diet policing.
              </li>
              <li>
                <strong>No medical claims.</strong> Do not present yourself as a
                clinician or tell anyone to stop taking prescribed medication.
              </li>
              <li>
                <strong>Respect privacy.</strong> Do not repost what other
                members share outside the community, and do not share
                anyone&apos;s personal information.
              </li>
              <li>
                <strong>No selling.</strong> The community is not a place to
                promote products, supplements or services.
              </li>
            </ul>
            <p>
              We may remove content or withdraw access where these rules are
              broken, and we will tell you why if we do.
            </p>

            <h2>What you post</h2>
            <p>
              You keep ownership of anything you write. By posting it you give us
              permission to display it within the community and, where it is
              genuinely useful to others, to quote it elsewhere on the site in
              anonymised form. Tell us if you would rather we did not, and we
              will not.
            </p>
            <p>Do not post anything you do not have the right to share.</p>

            <h2>Our content</h2>
            <p>
              The writing, design, logo and illustrations on this site belong to
              CyclePlate. You are welcome to share links and to quote short
              passages with attribution. Republishing whole articles, or using
              our branding to suggest we endorse something, is not permitted
              without our agreement.
            </p>

            <h2>Links to other sites</h2>
            <p>
              We link to research on PubMed, the WHO and academic journals, among
              others. Those sites are not ours, and we are not responsible for
              their content or their privacy practices.
            </p>

            <h2>Availability</h2>
            <p>
              We aim to keep the site running and accurate, but we provide it as
              it is. We do not guarantee uninterrupted availability, and we may
              change or withdraw parts of it. To the extent the law allows, we
              are not liable for any loss arising from your use of the site or
              reliance on its content. Nothing in these terms limits liability
              for death or personal injury caused by negligence, or for fraud.
            </p>

            <h2>Your data</h2>
            <p>
              How we handle what you give us is set out in our{" "}
              <Link href="/privacy">Privacy Policy</Link>. You can unsubscribe,
              or ask us to delete your details or close your account, at any
              time.
            </p>

            <h2>Changes</h2>
            <p>
              We may update these terms. The date at the top of the page shows
              when they last changed, and continuing to use the site after a
              change means you accept the updated version.
            </p>

            <h2>Getting in touch</h2>
            <p>
              Questions about these terms go to{" "}
              <a href="mailto:hellocycleplate@gmail.com">
                hellocycleplate@gmail.com
              </a>
              . We answer every email.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
