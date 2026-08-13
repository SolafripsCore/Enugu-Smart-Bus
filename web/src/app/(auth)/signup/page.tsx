import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Register for Enugu Smart Bus in about a minute, fund your ESB wallet and start riding cashless across Enugu State.",
};

export default function SignupPage() {
  return <SignupForm />;
}
