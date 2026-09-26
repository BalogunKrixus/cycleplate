/* Values that product decisions hang on, kept in one place so changing one is
   a one line edit rather than a search across components. */

export const POST_MAX_LENGTH = 2000;
export const REPLY_MAX_LENGTH = 2000;
export const FEED_PAGE_SIZE = 20;

export const ADMIN_BADGE_LABEL = "CyclePlate Team";

/* The guidelines banner. The professional wording stays generic rather than
   naming one role, so it does not go stale as the panel of professionals
   changes. */
export const GUIDELINES_TEXT =
  "Be kind. No diagnoses, no shame, no selling. A real professional answers flagged questions within 48 hours.";

export const GUIDELINES_DISMISS_KEY = "cp_guidelines_dismissed";

export const PROFESSIONAL_CATEGORIES = [
  { value: "nutritionist", label: "Nutritionist" },
  { value: "dietitian", label: "Dietitian" },
  { value: "doctor", label: "Doctor" },
  { value: "gynecologist", label: "Gynecologist" },
  { value: "other", label: "Other" },
] as const;

/* Phase palette from the brand guide. Categories borrow these so a chip and its
   posts read as one colour family. */
export const PHASE_COLORS = {
  menstrual: "#B23A4B",
  follicular: "#7C9A65",
  ovulatory: "#E0A33E",
  luteal: "#96617F",
} as const;

/* The same four, dark enough to be read.
 *
 * A category chip paints its text in the phase colour on a 10% tint of that
 * same colour, which is a lovely idea and, for the gold, produced 2.01:1 --
 * text you cannot see. These are used wherever a phase colour is the writing;
 * the vivid ones above stay for the dot, the fill and the charts, where nothing
 * sits on top. They are CSS variables rather than hexes so the dark theme can
 * go the other way and lighten instead. */
export const PHASE_INK = {
  menstrual: "var(--menstrual-ink)",
  follicular: "var(--follicular-ink)",
  ovulatory: "var(--ovulatory-ink)",
  luteal: "var(--luteal-ink)",
} as const;

const CATEGORY_COLOR_ORDER = [
  PHASE_COLORS.menstrual,
  PHASE_COLORS.follicular,
  PHASE_COLORS.ovulatory,
  PHASE_COLORS.luteal,
];

/* Same order, so a slug keeps the same hue whichever of the two it asks for. */
const CATEGORY_INK_ORDER = [
  PHASE_INK.menstrual,
  PHASE_INK.follicular,
  PHASE_INK.ovulatory,
  PHASE_INK.luteal,
];

/* Categories are editable in the panel, so a colour cannot be hardcoded per
   slug. Deriving it from the slug keeps a category the same colour for good,
   without a lookup table to maintain. */
export function categoryColor(slug: string | null | undefined): string {
  return CATEGORY_COLOR_ORDER[phaseIndex(slug)];
}

/* The readable counterpart, for the label on the chip. */
export function categoryInk(slug: string | null | undefined): string {
  return CATEGORY_INK_ORDER[phaseIndex(slug)];
}

function phaseIndex(slug: string | null | undefined): number {
  if (!slug) return 3;
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % CATEGORY_COLOR_ORDER.length;
}

/* Slugs the file-based articles already own. A row with one of these would be
   invisible: Next serves the static route and the database version is never
   reached, so the admin refuses the name rather than letting somebody publish
   into a hole. Keep in step with app/(site)/insights/. */
export const RESERVED_ARTICLE_SLUGS = [
  "pcos",
  "endometriosis",
  "period-pain",
  "pms",
] as const;

/* What an article can be filed under. A short fixed list rather than a table:
   these are editorial sections, they change about once a year, and a second
   categories table to maintain would be the definition of over-engineering. */
export const ARTICLE_CATEGORIES = [
  "PCOS",
  "Endometriosis",
  "Period pain",
  "PMS & mood",
  "Nutrition",
  "Cycle science",
  "Community",
] as const;

/* Turns a title into an address.
 *
 * Lives here rather than in lib/actions.ts because that file is "use server"
 * and every export from one of those has to be an async server action -- a
 * plain helper alongside them fails the build. It is shared rather than
 * duplicated so the slug previewed in the editor is character for character
 * the one the server saves.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
