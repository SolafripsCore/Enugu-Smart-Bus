import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Reset your password",
  description:
    "Request a password reset link for your Enugu Smart Bus account.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
