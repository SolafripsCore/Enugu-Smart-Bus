import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Enugu Smart Bus account.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
