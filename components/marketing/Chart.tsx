"use client";

import { useEffect, useRef, useState } from "react";

/* The horizontal bar charts on the marketing pages.
 *
 * Bars grow from zero once the card is on screen. The width is applied a frame
 * after mount rather than in the initial render, because a CSS transition needs
 * two different values to animate between; setting the final width immediately
 * would simply draw the finished bar.
 *
 * The figures are also written out as text for anyone using a screen reader,
 * since a bar whose only content is a coloured div says nothing at all.
 */

export type Bar = {
  label: string;
  value: string;
  color: string;
};

export function Chart({
  title,
  bars,
  caption,
}: {
  title: string;
  bars: Bar[];
  caption?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            /* One frame's delay, so the browser has painted the zero width
               state and has something to animate away from. */
            requestAnimationFrame(() => setGrown(true));
            io.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="chart-card" ref={ref}>
      <p className="chart-title">{title}</p>
      <div className="chart">
        {bars.map((bar) => (
          <div className="bar-row" key={bar.label}>
            <span className="bar-label">{bar.label}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{
                  width: grown ? bar.value : 0,
                  background: bar.color,
                }}
              />
            </span>
            <span className="bar-val">{bar.value}</span>
          </div>
        ))}
      </div>
      {caption ? <p className="chart-cap">{caption}</p> : null}
    </div>
  );
}
