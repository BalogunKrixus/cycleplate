import Link from "next/link";

/* The top of the community.
 *
 * It used to be a 52px serif "Community" and a sentence, which is a marketing
 * header on a page people come back to every day: the largest thing on screen
 * told a returning member the one thing she already knew. The title is still
 * here, because a page needs a name, but it is sized like a product header
 * rather than a hero, and the space it gave back goes to the two things a
 * newcomer actually wants to know: is anyone here, and does anyone qualified
 * answer.
 *
 * The counts are real or they are absent. A community showing "1 member" is
 * worse than one showing nothing, so each number appears only once there is
 * something to say, and the whole row disappears when there is not.
 */
export function CommunityHeader({
  displayName,
  members,
  postsThisWeek,
  professionals,
}: {
  displayName: string;
  members: number;
  postsThisWeek: number;
  professionals: number;
}) {
  const stats = [
    members > 1 ? `${members.toLocaleString()} members` : null,
    postsThisWeek > 0
      ? `${postsThisWeek} post${postsThisWeek === 1 ? "" : "s"} this week`
      : null,
    professionals > 0
      ? `${professionals} professional${professionals === 1 ? "" : "s"} answering`
      : null,
  ].filter(Boolean) as string[];

  return (
    <header className="mb-6">
      <h1 className="font-serif text-[30px] leading-none sm:text-[34px]">
        Community
      </h1>

      <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted">
        Anonymous by default, moderated with love. You are posting as{" "}
        <Link href="/account" className="font-medium text-ink underline">
          {displayName}
        </Link>
        .
      </p>

      {stats.length ? (
        /* Signs of life, stated plainly. A dot between them rather than boxed
           statistics: this is a room, not a dashboard, and three numbers in
           cards would make it look like one. */
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-faint">
          {stats.map((stat, i) => (
            <span key={stat} className="inline-flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true">·</span> : null}
              {stat}
            </span>
          ))}
        </p>
      ) : null}
    </header>
  );
}
