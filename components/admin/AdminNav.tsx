import Link from "next/link";

/* Navigation between the two admin screens.
 *
 * It lived in app/admin/page.tsx and was imported from there by the members
 * page. Next only allows a page file to export a specific set of fields, so a
 * component sitting beside the default export fails the build outright. It
 * belongs in components anyway, which is where the other admin pieces are.
 */
export function AdminNav({ current }: { current: "moderation" | "members" }) {
  const link = "text-[14px] transition";

  return (
    <nav className="flex items-center gap-5">
      <Link href="/app" className={`${link} text-muted hover:text-ink`}>
        Back to the community
      </Link>
      <span className="text-faint">|</span>
      <Link
        href="/admin"
        className={`${link} ${current === "moderation" ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
      >
        Moderation
      </Link>
      <Link
        href="/admin/members"
        className={`${link} ${current === "members" ? "font-medium text-ink" : "text-muted hover:text-ink"}`}
      >
        Members
      </Link>
    </nav>
  );
}
