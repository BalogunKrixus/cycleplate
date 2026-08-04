"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/Primitives";
import type { Profile } from "@/lib/types";

/* The interactive half of the header: navigation, the theme toggle, the mobile
 * menu and the call to action.
 *
 * Split out from Header so that the session read stays on the server and only
 * this much ships to the browser. The active link is decided from the pathname
 * rather than a data-page attribute set by hand on every page, which is one
 * fewer thing to forget when a page is added.
 */
export function HeaderControls({
  pages,
  viewer,
}: {
  pages: readonly (readonly [string, string])[];
  viewer: Profile | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  /* Read the theme after mount. The inline script in the layout has already
     applied it to <html>, so reading it here only syncs the icon; doing it
     during render would disagree with the server and hydration would complain. */
  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  /* A menu left open while the page changes underneath is a small thing that
     feels broken on a phone. */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("cpTheme", next);
    setDark(next === "dark");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className={`nav-links${menuOpen ? " open" : ""}`} id="navLinks">
        {pages.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={isActive(href) ? "active" : undefined}
            aria-current={isActive(href) ? "page" : undefined}
          >
            {label}
          </Link>
        ))}

        {/* The old stylesheet hid the header button below 760px, which left a
            phone with no way into the community from the header at all. These
            repeat it inside the menu, where there is room for it. */}
        {viewer ? (
          <>
            <Link href="/community" className="nav-only-mobile">
              Go to community
            </Link>
            <Link href="/account" className="nav-only-mobile">
              {viewer.display_name}
            </Link>
            {viewer.role === "admin" ? (
              <Link href="/admin" className="nav-only-mobile">
                Admin
              </Link>
            ) : null}
          </>
        ) : (
          <Link href="/join" className="nav-only-mobile">
            Join the community
          </Link>
        )}
      </nav>

      <div className="nav-cta">
        {viewer?.role === "admin" ? (
          <Link href="/admin" className="nav-admin">
            Admin
          </Link>
        ) : null}

        {viewer ? (
          <Link href="/account" className="nav-who" title="Your account">
            <Avatar displayName={viewer.display_name} size={28} />
            <span>{viewer.display_name}</span>
          </Link>
        ) : null}

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {dark ? (
              <>
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" />
              </>
            ) : (
              <path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5z" />
            )}
          </svg>
        </button>

        {viewer ? (
          <Link href="/community" className="btn btn-primary">
            Go to community
          </Link>
        ) : (
          <Link href="/join" className="btn btn-primary">
            Join the community
          </Link>
        )}

        <button
          className="nav-burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="navLinks"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>
    </>
  );
}
