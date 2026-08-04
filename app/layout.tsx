import type { Metadata } from "next";

import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";
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
      {/* One header and one footer for the whole product. The community used to
          render its own, which is what made it feel like a different site. */}
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
