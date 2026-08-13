import type { Metadata } from "next";

import { ForgotPinForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Reset your PIN",
  description:
    "Verify your phone number to set a new 4-digit PIN for your Enugu Smart Bus account.",
};

export default function ForgotPinPage() {
  return <ForgotPinForm />;
}
