export const metadata = {
  title: "Privacy Policy",
  description:
    "What CyclePlate collects, why, who else sees it, and how to have it removed.",
};

export default function PrivacyPage() {
  return (
    <main>
      <section className="band" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="article-hero">
            <p className="eyebrow">Legal</p>
            <h1>Privacy Policy</h1>
            <p className="lede" style={{ maxWidth: "none" }}>
              Cycle data is intimate, and what you post in the community says
              something about your health. This page sets out exactly what we
              collect, why, who else sees it, and how to get it removed.
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
            <h2>Who we are</h2>
            <p>
              CyclePlate provides cycle-aligned nutrition guidance and a
              community for women. For anything in this policy, write to{" "}
              <a href="mailto:hellocycleplate@gmail.com">
                hellocycleplate@gmail.com
              </a>
              .
            </p>

            <h2>What we collect</h2>
            <p>
              Only what you type into a form, and what you choose to post. We do
              not run advertising trackers, and we do not buy data about you from
              anyone else.
            </p>
            <ul>
              <li>
                <strong>Newsletter sign up:</strong> your email address, and your
                first name if you choose to give it.
              </li>
              <li>
                <strong>A community account:</strong> your email address and a
                password, which is stored only as a hash and is never readable by
                us. We generate a display name for you rather than asking for
                one, so your real name never enters the system by accident.
              </li>
              <li>
                <strong>What you post:</strong> your posts, replies, the things
                you like, and anything you report to a moderator, along with the
                time each happened.
              </li>
              <li>
                <strong>Partner enquiry:</strong> your organisation name, your
                name, your work email, the organisation type, the partnership
                interests you tick, and anything you write in the message field.
              </li>
            </ul>

            <h2>A specific word about what you post</h2>
            <p className="pull">
              Posting in the PCOS, endometriosis, period pain or PMS categories
              tells us something about your health. That is sensitive
              information and we treat it that way.
            </p>
            <p>
              Your email address is never shown next to anything you post, and it
              is not stored in the table that the feed can read. Only an
              administrator can look up the address behind a display name, and
              only through a database function that refuses to answer anyone
              else. You post under a generated handle, and you can read the whole
              community without an account at all.
            </p>

            <h2>Why we use it, and on what basis</h2>
            <p>
              We rely on your consent, which you give by submitting a form or
              creating an account, and can withdraw at any time. We use what you
              give us to send the newsletter you asked for, to run the community,
              to keep it safe through moderation, and to reply to partner
              enquiries. That is all.
            </p>

            <h2>Who else processes it</h2>
            <p>
              We use a small number of services to run the site. Each only
              receives what it needs.
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — holds community accounts and
                everything posted in the community, and sends the confirmation
                email when you sign up.
              </li>
              <li>
                <strong>Buttondown</strong> — our newsletter platform. Holds the
                email addresses of newsletter subscribers, and sends the emails.
              </li>
              <li>
                <strong>Google (Sheets and Apps Script)</strong> — partner
                enquiries are recorded in a private spreadsheet we control.
              </li>
              <li>
                <strong>Vercel</strong> — hosts the site and processes form
                submissions in transit. Vercel logs standard request information,
                including IP addresses, for operational purposes.
              </li>
              <li>
                <strong>Google Fonts</strong> — the site loads two typefaces from
                Google&apos;s servers, so Google receives your IP address when a
                page loads.
              </li>
            </ul>
            <p>
              We do not sell your data, and we do not share it with partner
              organisations in a form that identifies you. If we ever report
              anything to a partner it will be aggregate and anonymised, as we
              say elsewhere on this site.
            </p>

            <h2>Cookies</h2>
            <p>
              We set no tracking or advertising cookies. If you sign in, we set a
              cookie that keeps you signed in; removing it signs you out. The
              site also stores one item in your browser&apos;s local storage,{" "}
              <span className="mono">cpTheme</span>, which remembers whether you
              chose light or dark mode. That one never leaves your device and
              clearing your browser data removes it.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Newsletter details are kept until you unsubscribe or ask us to
              delete them. Community accounts are kept until you ask us to close
              them. Content removed by a moderator stays in the database, hidden
              from the community, together with who removed it and when, so that
              a moderation decision can be reviewed or reversed. Partner
              enquiries are kept for as long as the conversation is live, and for
              up to two years afterwards so we have a record of who we have
              spoken to. Delete requests are honoured regardless.
            </p>

            <h2>Your rights</h2>
            <p>
              If you are in the UK or the EU, you have the right to ask for a
              copy of what we hold, to have it corrected or deleted, to restrict
              or object to how we use it, to receive it in a portable form, and
              to withdraw your consent at any time. Every newsletter has an
              unsubscribe link, and unsubscribing is always enough on its own.
            </p>
            <p>
              Email{" "}
              <a href="mailto:hellocycleplate@gmail.com">
                hellocycleplate@gmail.com
              </a>{" "}
              and we will action it. If you are not satisfied with our response,
              you can complain to your data protection regulator; in the UK that
              is the Information Commissioner&apos;s Office at{" "}
              <a href="https://ico.org.uk" target="_blank" rel="noopener">
                ico.org.uk
              </a>
              .
            </p>

            <h2>Children</h2>
            <p>
              CyclePlate is not intended for children under 16, and we do not
              knowingly collect their data. If you believe a child has signed up,
              tell us and we will remove it.
            </p>

            <h2>Changes</h2>
            <p>
              If this policy changes we will update the date at the top of the
              page. If a change materially affects how we use what you have
              already given us, we will email you before it takes effect.
            </p>

            <h2>A reminder about what we are</h2>
            <p>
              CyclePlate is a nutrition wellness tool grounded in published
              research. It is not medical advice, diagnosis, or treatment.
              Nothing here creates a clinical relationship, and none of what you
              tell us is a medical record.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
