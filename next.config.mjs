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
  ["/journal.html", "/journal"],
  ["/journal-pcos.html", "/journal/pcos"],
  ["/journal-endometriosis.html", "/journal/endometriosis"],
  ["/journal-period-pain.html", "/journal/period-pain"],
  ["/journal-pms.html", "/journal/pms"],
  ["/partners.html", "/partners"],
  ["/privacy.html", "/privacy"],
  ["/terms.html", "/terms"],
  ["/community.html", "/community"],
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
