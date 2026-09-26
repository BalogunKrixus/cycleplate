import type { ReactNode } from "react";

/* A small markdown subset, rendered to React rather than to HTML.
 *
 * The obvious move is a markdown library and dangerouslySetInnerHTML. This
 * does neither, for two reasons. There is no HTML injection surface at all if
 * no HTML is ever produced -- the output is React elements and text nodes, so
 * a <script> in a draft is just characters on the page. And the styling has to
 * match four articles that already exist and were written by hand, which is
 * easier to guarantee by emitting the same classes than by writing a
 * stylesheet that reaches into whatever a library produced.
 *
 * What it covers is what an article needs: headings, paragraphs, bold, italic,
 * links, bullet and numbered lists, blockquotes and horizontal rules. Anything
 * it does not recognise renders as the text that was typed, which is the right
 * failure: a stray asterisk looks wrong, rather than the paragraph vanishing.
 */
export function Markdown({ source }: { source: string }) {
  return <>{blocks(source)}</>;
}

function blocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      out.push(<hr key={key++} className="my-10 h-px border-0 bg-line" />);
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = inline(heading[2]);
      if (level === 1) out.push(<h2 key={key++}>{text}</h2>);
      else if (level === 2) out.push(<h3 key={key++}>{text}</h3>);
      else
        out.push(
          <h4 key={key++} className="mt-8 text-[18px] font-semibold">
            {text}
          </h4>,
        );
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }
      out.push(
        <blockquote
          key={key++}
          className="my-6 rounded-card bg-bg2 px-6 py-4 text-[17px] leading-relaxed"
        >
          {inline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    /* Lists. The marker decides the tag, and a list ends at the first line
       that is not one, which is what people expect from a blank line. */
    const bullet = /^\s*[-*]\s+(.*)$/;
    const numbered = /^\s*\d+[.)]\s+(.*)$/;

    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const pattern = ordered ? numbered : bullet;
      const items: string[] = [];
      while (i < lines.length && pattern.test(lines[i])) {
        items.push(lines[i].match(pattern)![1]);
        i += 1;
      }
      const li = items.map((item, n) => <li key={n}>{inline(item)}</li>);
      out.push(
        ordered ? (
          <ol key={key++} className="my-5 list-decimal pl-6 leading-relaxed">
            {li}
          </ol>
        ) : (
          <ul key={key++} className="my-5 list-disc pl-6 leading-relaxed">
            {li}
          </ul>
        ),
      );
      continue;
    }

    /* Everything else is a paragraph, and a paragraph runs until a blank line
       so a sentence wrapped in the editor does not become three paragraphs. */
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|>|---+\s*$)/.test(lines[i]) &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    out.push(<p key={key++}>{inline(para.join(" "))}</p>);
  }

  return out;
}

/* Bold, italic, code and links, in one pass so nested markers do not need a
   parser. Order matters: the link pattern is tried first because its label may
   itself contain emphasis. */
function inline(text: string): ReactNode[] {
  const pattern =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g;
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));

    if (m[1] !== undefined) {
      const href = m[2];
      /* Only http(s), mailto and same-site paths. A javascript: URL typed into
         the editor would otherwise become a live link. */
      const safe = /^(https?:\/\/|mailto:|\/)/i.test(href) ? href : "#";
      const external = /^https?:\/\//i.test(safe);
      out.push(
        <a
          key={key++}
          href={safe}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {inline(m[1])}
        </a>,
      );
    } else if (m[3] !== undefined) {
      out.push(<strong key={key++}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      out.push(<em key={key++}>{m[4]}</em>);
    } else if (m[5] !== undefined) {
      out.push(
        <code key={key++} className="rounded bg-bg2 px-1.5 py-0.5 text-[0.9em]">
          {m[5]}
        </code>,
      );
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}
