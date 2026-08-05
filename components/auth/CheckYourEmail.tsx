import Link from "next/link";

/* Shown after signing up, in place of the form.
 *
 * The form used to stay on screen with a line of green text under it, which
 * reads as "something happened" rather than "you are done, now go and do this
 * one thing". Somebody who has just handed over an email deserves to be told
 * plainly what happens next, at which address, and what to do when it does not
 * arrive, because for a good number of people it will land in spam and they
 * will otherwise conclude the whole thing is broken.
 */
export function CheckYourEmail({ email }: { email: string }) {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28">
      <div className="rounded-card bg-surface p-8 text-center shadow-card sm:p-10">
        <span
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bg2 text-accent"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2.5" y="4.5" width="19" height="15" rx="3" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </span>

        <h1 className="mt-6 text-[30px] leading-tight">Check your inbox</h1>

        <p className="mt-3 text-[16px] text-muted">
          We have sent a link to{" "}
          <span className="font-medium text-ink">{email}</span>. Open it and it
          will bring you straight into the community, already signed in.
        </p>

        <div className="mt-7 rounded-card bg-bg2 p-5 text-left">
          <p className="text-[14px] font-medium">Not there after a minute?</p>
          <ul className="mt-2 flex list-none flex-col gap-1.5 p-0 text-[14px] text-muted">
            <li>Check your spam or promotions folder. It often lands there.</li>
            <li>Make sure the address above is right.</li>
            <li>
              Still nothing? Email{" "}
              <a href="mailto:hellocycleplate@gmail.com">
                hellocycleplate@gmail.com
              </a>{" "}
              and we will sort it out.
            </li>
          </ul>
        </div>

        <p className="mt-7 text-[14px] text-muted">
          Already confirmed?{" "}
          <Link href="/auth/sign-in" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-8 text-center text-[13px] text-faint">
        <Link href="/community" className="underline">
          Back to the community
        </Link>
      </p>
    </main>
  );
}
