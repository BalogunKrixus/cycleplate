import Link from "next/link";

import { Avatar } from "@/components/ui/Primitives";
import type { Profile } from "@/lib/types";

/* The admin chrome.
 *
 * Deliberately not the site chrome. The admin used to render inside the
 * marketing header, so a moderation queue arrived under a nav offering The
 * Science and a "Go to Community" button, which is the tell that this was a
 * page bolted onto a website rather than a tool. It now sits outside the (site)
 * route group entirely and brings this instead: a rail, a title that says what
 * this is, and a single way back.
 *
 * It keeps the palette, the fonts and the shape language, because it is still
 * CyclePlate and two people who use both should not have to learn two products.
 * What changes is the information architecture, which is the part that was
 * actually wrong.
 */

const SECTIONS = [
  { href: "/admin", label: "Overview", exact: true, icon: "M4 13h6V4H4zM14 20h6V4h-6zM4 20h6v-5H4z" },
  { href: "/admin/members", label: "Members", icon: "M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 7.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M22 20v-1.5a4 4 0 0 0-3-3.87M16 4.13a4 4 0 0 1 0 7.75" },
  { href: "/admin/content", label: "Content", icon: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" },
  { href: "/admin/insights", label: "Insights", icon: "M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.8.6 1.2v1h6v-1c0-.4.2-.9.6-1.2A6 6 0 0 0 12 3zM9 20h6" },
] as const;

export function AdminShell({
  viewer,
  current,
  title,
  intro,
  children,
}: {
  viewer: Profile;
  current: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg2">
      {/* The rail is horizontal on a phone and vertical from lg. A sidebar that
          collapses into a hamburger would be one more thing to build and one
          more thing to get wrong for three links. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-10 lg:py-12">
        <nav className="shrink-0 lg:w-[210px]" aria-label="Admin sections">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-accent">
            CyclePlate
          </p>
          <p className="mt-0.5 font-serif text-[20px] leading-tight">
            Community Admin
          </p>

          <ul className="no-scrollbar mt-5 flex gap-2 overflow-x-auto lg:mt-7 lg:flex-col lg:gap-1 lg:overflow-visible">
            {SECTIONS.map((s) => {
              const active =
                "exact" in s && s.exact ? current === s.href : current.startsWith(s.href);
              return (
                <li key={s.href} className="shrink-0">
                  <Link
                    href={s.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-chip px-3.5 py-2 text-[14px] font-medium transition lg:rounded-[12px] ${
                      active
                        ? "bg-ink text-cream"
                        : "text-muted hover:bg-surface hover:text-ink"
                    }`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d={s.icon} />
                    </svg>
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 hidden lg:block">
            <div className="flex items-center gap-2.5 rounded-[12px] bg-surface p-3 shadow-card">
              <Avatar displayName={viewer.display_name} size={30} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium">
                  {viewer.display_name}
                </p>
                <p className="text-[12px] capitalize text-faint">
                  {viewer.role === "super_admin" ? "Super admin" : "Moderator"}
                </p>
              </div>
            </div>
            <Link
              href="/app"
              className="mt-2 flex items-center gap-1.5 px-3 text-[13px] text-muted transition hover:text-ink"
            >
              ← Back to the community
            </Link>
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          <header className="mb-7">
            <h1 className="font-serif text-[30px] leading-tight sm:text-[34px]">
              {title}
            </h1>
            {intro ? (
              <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-muted">
                {intro}
              </p>
            ) : null}
          </header>
          {children}

          <Link
            href="/app"
            className="mt-10 flex items-center gap-1.5 text-[13px] text-muted transition hover:text-ink lg:hidden"
          >
            ← Back to the community
          </Link>
        </main>
      </div>
    </div>
  );
}
