import { redirect } from "next/navigation";

/* There is one place to create an account, and it is /join.
 *
 * This route rendered a second, identical copy of the sign up form. Two
 * addresses for the same thing is how they drift: a change to the welcome
 * wording lands on one and not the other, and half the site's buttons keep
 * pointing at the stale one. The address stays because it is linked from the
 * sign in page and may be bookmarked.
 */
export default function SignUpPage() {
  redirect("/join");
}
