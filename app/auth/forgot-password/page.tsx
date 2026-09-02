import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Reset your password" };

/* The form reads the query string to know whether it is being shown because a
   link failed, and reading it makes the page dynamic. The boundary is what lets
   the rest of the page stay static instead of the build refusing it. */
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto w-full max-w-md px-5 py-20 sm:py-28" />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
