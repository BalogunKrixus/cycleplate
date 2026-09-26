import type { Config } from "tailwindcss";

/* Colours resolve to the custom properties defined in app/globals.css rather
 * than to literal hex values. That is what lets the marketing pages, which style
 * themselves through the class names in that file, and the community, which uses
 * these utilities, stay the same colour as each other. It is also what makes the
 * dark theme work for free: [data-theme="dark"] reassigns the variables, and
 * every utility built on them follows without a single dark: prefix.
 *
 * Separation comes from a hairline and a change of shade, not from blur. The
 * original rule here was the opposite -- no borders anywhere, everything
 * separated by a soft shadow -- and carried far enough that a text field, a
 * select, a card, a chip and a button all wore the same faint halo. At that
 * point the shadow had stopped separating anything, because everything had
 * one, and the controls you were meant to operate looked like the surfaces you
 * were meant to read.
 *
 * So `card` and `chip` below are no longer blurs. They are one pixel rings at
 * zero radius: crisp edges, drawn as shadows purely so they cost no layout.
 * `lift` is still a real shadow and is now the only one, reserved for things
 * genuinely floating above the page -- a modal, the floating compose pill, the
 * mobile menu, a popover, and the hover state of a card that moves.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Surfaces, darkest to lightest in the light theme. */
        bg: "var(--bg)",
        /* The field surface and the hairline, so a component can reach them as
           utilities instead of reaching for a shadow. */
        field: "var(--field)",
        line: "var(--line)",
        bg2: "var(--bg2)",
        surface: "var(--card)",
        cream: "var(--bg)",

        /* Text. `faint` is the same value as `muted`; the marketing site never
           needed a third step, and inventing one here would have put the two
           halves back out of step. Where something genuinely needs to recede
           further, it does it with opacity. */
        ink: "var(--ink)",
        muted: "var(--ink2)",
        faint: "var(--ink2)",

        accent: "var(--accent)",
        "accent-ink": "var(--on-accent)",

        /* Cycle phases. Shared by the marketing charts and the community
           category chips, which is why they belong here and not in either. */
        menstrual: "var(--menstrual)",
        follicular: "var(--follicular)",
        ovulatory: "var(--ovulatory)",
        luteal: "var(--luteal)",

        /* Text-safe versions of the four phase colours, for the places they
           are read rather than looked at. The vivid values above stay for
           fills, dots and charts; used as *text* on a pale tint of themselves
           they bottomed out at 2.01:1, which is the gold chip on a cream card
           and effectively invisible. */
        "menstrual-ink": "var(--menstrual-ink)",
        "follicular-ink": "var(--follicular-ink)",
        "ovulatory-ink": "var(--ovulatory-ink)",
        "luteal-ink": "var(--luteal-ink)",

        /* The professional badge borrows the follicular green rather than
           introducing a colour that means nothing anywhere else. It needs its
           own pair because it is the one place the green carries writing: in
           the light theme a dark green with white on it, in the dark theme a
           pale green with dark on it. Using one green for both put white text
           on pale green at 1.72:1. */
        expert: "var(--expert)",
        "expert-ink": "var(--expert-ink)",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        /* Hairlines, not shadows. Named for what they are attached to rather
           than renamed across every file that already uses them. */
        card: "0 0 0 1px var(--line)",
        chip: "0 0 0 1px var(--line)",
        /* The only real shadow left. */
        lift: "var(--sh-lg)",
        inset: "inset 0 1px 2px rgba(42, 31, 23, 0.06)",
      },
      borderRadius: {
        card: "22px",
        chip: "999px",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "none" },
        },
        peak: {
          "0%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.25)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        rise: "rise 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
        peak: "peak 0.32s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
