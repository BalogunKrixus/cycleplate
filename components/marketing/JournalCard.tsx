"use client";

import Image from "next/image";
import Link from "next/link";

import { useReveal } from "@/components/marketing/Reveal";

/* A card in the three-across journal and signpost grids.
 *
 * It reveals itself rather than being wrapped in a Reveal, so the card stays a
 * direct child of the grid and stretches to the height of the tallest in the
 * row. Wrapping it was enough to leave two of three cards short.
 */
export function JournalCard({
  href,
  photo,
  alt,
  tag,
  title,
  body,
  read,
}: {
  href: string;
  photo: string;
  alt: string;
  tag: string;
  title: string;
  body: string;
  read: string;
}) {
  const { ref, className } = useReveal();

  return (
    <Link className={`jr-card ${className}`.trim()} href={href} ref={ref as never}>
      <div className="jr-photo">
        <Image
          src={photo}
          alt={alt}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 920px) 50vw, 360px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="jr-body">
        <span className="jr-tag">{tag}</span>
        <h3>{title}</h3>
        <p>{body}</p>
        <span className="jr-read">{read}</span>
      </div>
    </Link>
  );
}
