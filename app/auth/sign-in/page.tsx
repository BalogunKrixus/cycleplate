import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign in" };

/* The callback sends people here with ?error=link when an emailed confirmation
   link did not work. Without a word about it they arrive at an ordinary sign in
   form and assume the link took them nowhere. */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthForm
      mode="sign-in"
      notice={
        error === "link"
          ? "That link has expired or had already been used. Sign in below, or ask for a new one."
          : undefined
      }
    />
  );
}
