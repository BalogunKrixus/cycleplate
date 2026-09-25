/* The top of the community.
 *
 * It used to be a 52px serif "Community" over a sentence explaining that the
 * community is anonymous and naming the handle you post under. Both were a
 * marketing header on a page people come back to several times a day: the
 * largest thing on screen told a returning member the one thing she already
 * knew, and the sentence under it told her the second.
 *
 * The title is still here, because a page needs a name, but it is sized like a
 * product header rather than a hero, and what the sentence took goes to the
 * two things a newcomer actually wants to know: is anyone here, and does anyone
 * qualified answer.
 *
 * Losing the sentence does not lose the fact. "You are posting as <handle>,
 * your real name and email are never shown" is still said in the composer,
 * which is the one moment it is genuinely load bearing -- at the point of
 * writing, not permanently above a feed somebody is only reading.
 *
 * The counts are real or they are absent. A community showing "1 member" is
 * worse than one showing nothing, so each number appears only once there is
 * something to say, and the whole row disappears when there is not.
 */
export function CommunityHeader({
  members,
  postsThisWeek,
  professionals,
}: {
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
