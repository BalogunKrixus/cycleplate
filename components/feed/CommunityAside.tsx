import { GUIDELINES_TEXT } from "@/lib/config";
import type { Category } from "@/lib/types";

/* The desktop column beside the feed.
 *
 * The feed itself stays narrow. That was a deliberate decision before this
 * change and it survives it: a paragraph somebody typed on a phone should not
 * stretch the width of a desktop monitor, and widening the reading column to
 * fill the screen would have made the writing harder to read in exchange for
 * looking busier. What was wrong was not the column width, it was that
 * everything else on a 1400px screen was empty margin.
 *
 * So the space goes to context rather than to content: what this place is, how
 * it behaves, and who answers. None of it is a control that also exists
 * elsewhere -- the category filter stays the single chip rail above the feed
 * rather than appearing twice in two shapes, which is the usual way a sidebar
 * turns into a second, competing navigation.
 *
 * Hidden below lg entirely. On a phone this is three cards between a member and
 * the conversation she opened the app to read.
 */
export function CommunityAside({
  categories,
  professionals,
}: {
  categories: Category[];
  professionals: number;
}) {
  return (
    <aside className="hidden w-[280px] shrink-0 flex-col gap-4 lg:flex" aria-label="About this community">
      <section className="rounded-card bg-surface p-5 shadow-card">
        <h2 className="text-[15px] font-semibold">About</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          A space for women to talk openly about their health, cycles and
          bodies. Ask the questions you were told not to.
        </p>
        {professionals > 0 ? (
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-ink">
              {professionals} verified professional
              {professionals === 1 ? "" : "s"}
            </span>{" "}
            post here. Their replies carry a badge with their qualification, so
            you can tell advice from experience at a glance.
          </p>
        ) : null}
      </section>

      <section className="rounded-card bg-surface p-5 shadow-card">
        <h2 className="text-[15px] font-semibold">How we behave</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          {GUIDELINES_TEXT}
        </p>
      </section>

      {categories.length ? (
        /* Named topics rather than links. The chips above the feed already do
           the filtering, and a second set of category controls in a different
           shape is how a member ends up wondering which one is the real one.
           This is here to answer "what is talked about", not to be clicked. */
        <section className="rounded-card bg-surface p-5 shadow-card">
          <h2 className="text-[15px] font-semibold">What women ask about</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            {categories.map((c) => c.label).join(" · ")}
          </p>
        </section>
      ) : null}

      <p className="px-1 text-[12px] leading-relaxed text-faint">
        CyclePlate is a nutrition wellness tool. Nothing here is medical advice,
        diagnosis or treatment.
      </p>
    </aside>
  );
}
