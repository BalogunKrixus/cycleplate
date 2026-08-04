import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/AuthForm";
import { getViewer } from "@/lib/supabase/server";

export const metadata = {
  title: "Join the community",
  description:
    "Create a CyclePlate account and join the community. Anonymous by default, moderated with love.",
};

/* Every Join Community call to action on the site points here.
 *
 * One address for all of them, rather than each button guessing at the right
 * destination. It also means the answer to "what happens when somebody who is
 * already a member clicks Join" lives in one place: they are already in, so send
 * them to the feed rather than showing them a sign up form for an account they
 * have.
 */
export default async function JoinPage() {
  const viewer = await getViewer();
  if (viewer) redirect("/app");

  return <AuthForm mode="sign-up" />;
}
