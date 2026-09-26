import type { ReactNode } from "react";

/* One number, with the thing it counts under it.
 *
 * `sub` is for the number that gives the big one meaning -- 312 members says
 * little, 312 members and 14 this week says whether the place is growing. It is
 * left off where there is no honest second number rather than filled with a
 * percentage nobody can act on. */
export function Stat({
  label,
  value,
  sub,
  tone = "plain",
}: {
  label: string;
  value: number | string;
  sub?: ReactNode;
  tone?: "plain" | "attention";
}) {
  return (
    <div className="rounded-[14px] bg-surface p-4 shadow-card sm:p-5">
      <p className="text-[13px] text-muted">{label}</p>
      <p
        className={`mt-1.5 font-serif text-[30px] leading-none tabular-nums sm:text-[34px] ${
          tone === "attention" && Number(value) > 0 ? "text-accent" : ""
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub ? <p className="mt-1.5 text-[13px] text-faint">{sub}</p> : null}
    </div>
  );
}
