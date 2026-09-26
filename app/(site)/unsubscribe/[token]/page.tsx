import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Unsubscribed",
  robots: { index: false, follow: false },
};

/* One click, no sign in.
 *
 * Asking somebody to remember a password before they can stop being emailed is
 * the pattern this exists to avoid, so the token in the link is the whole
 * credential. It is a uuid, unique per member, and the function behind it can
 * only ever set the flag to false -- so the worst a guessed token could do is
 * stop mail somebody was not reading.
 *
 * It does nothing to the account. That is said on the page, because "stop
 * emailing me" and "delete my account" are very different intentions and a
 * member should not have to wonder which one she just chose.
 */
export default async function UnsubscribePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let name: string | null = null;
  let failed = false;

  /* A uuid or nothing: passing arbitrary text to a uuid argument is an error
     rather than a miss, and a mangled link should read as "already done"
     rather than as a crash. */
  if (/^[0-9a-f-]{36}$/i.test(token)) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("unsubscribe", { token });
      if (error) failed = true;
      else name = (data as { display_name: string }[] | null)?.[0]?.display_name ?? null;
    } catch {
      failed = true;
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-5 py-24 text-center sm:py-32">
      {failed ? (
        <>
          <h1 className="text-[32px] leading-tight">Something went wrong</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            We could not process that just now. Write to{" "}
            <a href="mailto:contact@hellocycleplate.com">contact@hellocycleplate.com</a>{" "}
            and a person will take you off the list by hand.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-[32px] leading-tight">
            {name ? "Done." : "You are unsubscribed."}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            {name
              ? `We will not email ${name} about community posts again.`
              : "If that link was still valid, you are off the list. Either way you will not get these emails."}{" "}
            Your account is untouched, and you can still sign in and read
            everything as normal.
          </p>
          <p className="mt-6 text-[14px] leading-relaxed text-muted">
            Changed your mind? Turn it back on under{" "}
            <Link href="/account">your account</Link>.
          </p>
        </>
      )}

      <div className="mt-10">
        <Link href="/" className="btn btn-quiet">
          Back to CyclePlate
        </Link>
      </div>
    </main>
  );
}
