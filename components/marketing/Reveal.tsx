"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Fades content up as it scrolls into view.
 *
 * Content starts visible and only becomes transparent once the observer is
 * attached. That ordering matters: if it started hidden and the JavaScript
 * failed, or a crawler read the page without running it, the content would be
 * invisible rather than merely unanimated. The stylesheet disables the
 * transition under prefers-reduced-motion, so nobody who asked for stillness
 * gets movement.
 */
function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setArmed(true);

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, className: `${armed ? "rv" : ""}${shown ? " in" : ""}`.trim() };
}

/* The hook, for when the element being revealed has to stay exactly where it is
 * in the tree. A grid lays out its direct children, so wrapping a card in a
 * spare div hands the layout to the div and leaves the card sitting at its own
 * content height inside a stretched box. On the journal cards that showed up as
 * two of the three no longer reaching the bottom of the row.
 */
export { useReveal };

/* The wrapper, for the ordinary case where an extra element changes nothing. */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "figure";
} & React.HTMLAttributes<HTMLElement>) {
  const { ref, className: revealClass } = useReveal();

  return (
    <Tag
      ref={ref as never}
      className={`${revealClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}
