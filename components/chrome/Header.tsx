import Link from "next/link";

import { Lockup } from "@/components/brand/Logo";
import { HeaderControls } from "@/components/chrome/HeaderControls";
import { getViewer } from "@/lib/supabase/server";

/* The site header, shared by the marketing pages and the community.
 *
 * This is the seam where the two halves of the product became one. It is a
 * server component so that it can read the session directly: a visitor who is
 * signed in sees their handle and a way into the community on every page,
 * including the marketing pages, without a flash of the signed out state first.
 *
 * The call to action changes with that session rather than always saying Join.
 * Telling somebody who joined last week to join is the small tell that gives
 * away two applications wearing the same paint.
 */

/* Labels are named for what is on the other side of them, which sounds obvious
 * and was not true here. "Community" pointed at the page that *explains* the
 * community, while the button beside it pointed at the community itself, so two
 * controls a centimetre apart made the same promise and kept it differently.
 * The page is an explainer, so it says so, and "Go to community" is left as the
 * only thing in the header that claims to be the door.
 *
 * "About" is left alone on purpose. It is the page about CyclePlate — the
 * company, what it believes, why it exists — so calling it "About Community"
 * would have fixed one mislabelled link by creating another. */
const PAGES = [
  ["The Science", "/science"],
  ["About Community", "/community"],
  ["Insights", "/insights"],
  ["Partners", "/partners"],
  ["About", "/about"],
] as const;

export async function Header() {
  const viewer = await getViewer();

  return (
    <header className="nav">
      <div className="nav-in">
        <Link className="nav-logo" href="/" aria-label="CyclePlate home">
          <Lockup markSize={34} wordSize={22} />
        </Link>

        <HeaderControls pages={PAGES} viewer={viewer} />
      </div>
    </header>
  );
}
