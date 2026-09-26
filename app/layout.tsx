import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://hellocycleplate.com"),
  title: {
    default: "CyclePlate — Eat right, at the right time",
    template: "%s | CyclePlate",
  },
  description:
    "CyclePlate turns clinical nutrition science into daily food guidance for every phase of your cycle, using foods you can actually find where you live.",
};

/* Applied before the first paint, so a visitor who chose dark last time does not
   watch the page flash cream first. It has to be an inline script for that
   reason: anything deferred runs after the browser has already painted.
   The fallback is light rather than the system setting, which is deliberate. */
const THEME_BOOTSTRAP = `document.documentElement.dataset.theme=localStorage.getItem("cpTheme")||"light";`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Loaded by link tag rather than next/font, so a build never depends on
            being able to reach Google. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      {/* Just the document. The site header and footer live in the (site) group
          rather than here, because the admin is not part of that site: it is a
          separate tool for two people, and giving it a marketing nav with a
          "Go to Community" button on top of a moderation queue is exactly the
          seam this split removes. Everything shared -- the theme bootstrap
          above, the fonts, globals.css -- still lives here, so both halves stay
          the same product underneath. */}
      <body>{children}</body>
    </html>
  );
}
