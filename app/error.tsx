"use client";

import { useEffect } from "react";
import Link from "next/link";

/* Shown when a page throws.
 *
 * Next's own fallback is a bare sentence and a digest number on a white page,
 * which tells a visitor nothing and does not look like this site. The digest is
 * still the thing that ties a report back to a log line, so it is kept, just
 * put somewhere it does not shout.
 *
 * The header and footer still render around this, because a route error
 * replaces the page rather than the layout. That matters: somebody who hits a
 * problem in the community can still reach the rest of the site.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="band">
      <div className="wrap" style={{ maxWidth: 560, textAlign: "center" }}>
        <p className="eyebrow">Something went wrong</p>
        <h1 style={{ fontSize: "clamp(30px,4vw,44px)" }}>
          This page did not load.
        </h1>
        <p className="lede" style={{ margin: "0 auto" }}>
          The problem is on our side, not yours. Trying again often works, and if
          it does not, the rest of the site is still here.
        </p>

        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 32,
          }}
        >
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn-quiet">
            Back to the home page
          </Link>
        </div>

        {error.digest ? (
          <p className="small muted" style={{ marginTop: 32 }}>
            If you report this, quoting{" "}
            <span className="mono">{error.digest}</span> will let us find it in
            the logs.
          </p>
        ) : null}
      </div>
    </main>
  );
}
