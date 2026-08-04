import type { Config } from "tailwindcss";

/* Colours resolve to the custom properties defined in app/globals.css rather
 * than to literal hex values. That is what lets the marketing pages, which style
 * themselves through the class names in that file, and the community, which uses
 * these utilities, stay the same colour as each other. It is also what makes the
 * dark theme work for free: [data-theme="dark"] reassigns the variables, and
 * every utility built on them follows without a single dark: prefix.
 *
 * No border utilities are used anywhere by design. Separation comes from the
 * shadow scale below, which is deliberately soft and low contrast.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Surfaces, darkest to lightest in the light theme. */
        bg: "var(--bg)",
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
        "accent-ink": "var(--accent-ink)",

        /* Cycle phases. Shared by the marketing charts and the community
           category chips, which is why they belong here and not in either. */
        menstrual: "var(--menstrual)",
        follicular: "var(--follicular)",
        ovulatory: "var(--ovulatory)",
        luteal: "var(--luteal)",

        /* The professional badge borrows the follicular green rather than
           introducing a colour that means nothing anywhere else. */
        expert: "var(--follicular)",
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "var(--sh)",
        lift: "var(--sh-lg)",
        chip: "var(--sh)",
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
