/** @type {import('next').NextConfig} */

/* The site was twelve .html files before it became an application, and those
 * addresses are in search results, in newsletters already sent, and in whatever
 * anyone bookmarked. Permanent redirects keep every one of them working and
 * hand the search ranking to the new address rather than starting over.
 *
 * /community.html is the interesting one. It used to be a marketing page whose
 * job was to collect an email through a form. It now points at the real
 * community, which is what that page was always promising.
 */
const REDIRECTS = [
  ["/index.html", "/"],
  ["/about.html", "/about"],
  ["/science.html", "/science"],
  ["/journal.html", "/insights"],
  ["/journal-pcos.html", "/insights/pcos"],
  ["/journal-endometriosis.html", "/insights/endometriosis"],
  ["/journal-period-pain.html", "/insights/period-pain"],
  ["/journal-pms.html", "/insights/pms"],
  ["/partners.html", "/partners"],
  ["/privacy.html", "/privacy"],
  ["/terms.html", "/terms"],
  ["/community.html", "/community"],

  /* The journal became Insights. These are not legacy .html addresses, they are
     the live ones from yesterday: linked from the newsletter, shared, and the
     pages search actually has indexed. A permanent redirect is what hands the
     ranking to the new address instead of starting the section from zero. */
  ["/journal", "/insights"],
  ["/journal/pcos", "/insights/pcos"],
  ["/journal/endometriosis", "/insights/endometriosis"],
  ["/journal/period-pain", "/insights/period-pain"],
  ["/journal/pms", "/insights/pms"],
];

const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      ...REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      /* The old join anchor was a form section on the marketing page. Anyone
         arriving on it wanted to join, so send them to the flow that does it. */
      {
        source: "/community.html",
        has: [{ type: "query", key: "join" }],
        destination: "/join",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
