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

const PAGES = [
  ["The Science", "/science"],
  ["Community", "/community"],
  ["Journal", "/journal"],
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
