import { Footer } from "@/components/chrome/Footer";
import { Header } from "@/components/chrome/Header";

/* The public product: marketing pages, the community, sign in, the account.
 *
 * One header and one footer for all of it. The community used to render its
 * own, which is what made it feel like a different site; this is the layout
 * that fixed that. What it deliberately does not wrap is /admin, which sits
 * outside this group and brings its own chrome.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
