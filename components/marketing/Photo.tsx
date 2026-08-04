import Image from "next/image";

/* Every photograph on the marketing pages.
 *
 * These were plain img tags pointing at JPEGs between 74KB and 179KB, and a
 * phone downloaded the full desktop file for a box a few hundred pixels wide.
 * The home page alone was about 750KB of photograph before a word was readable.
 *
 * Going through next/image gets three things that are tedious to do by hand and
 * easy to forget on the next one added: the file is re-encoded to AVIF or WebP,
 * a srcset is generated so a small screen fetches a small file, and everything
 * below the fold waits until it is nearly in view.
 *
 * fill rather than width and height, because the shape is set by the container
 * in CSS, which is where the aspect ratios and breakpoints already live. That
 * needs a positioned parent, which .photo now is.
 *
 * `sizes` is not optional here even though it looks it. Without it the browser
 * assumes the image spans the viewport and picks the largest candidate, which
 * quietly undoes the responsive part while still looking like it works.
 */
export function Photo({
  src,
  alt,
  className = "",
  style,
  objectPosition,
  priority = false,
  sizes = "(max-width: 920px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  objectPosition?: string;
  /* Set on the one image that is on screen at first paint. Marking more than
     that makes them compete with each other and with the stylesheet. */
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`photo ${className}`.trim()} style={style}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover", objectPosition }}
      />
    </div>
  );
}
