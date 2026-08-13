import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your Enugu Smart Bus account to manage your wallet, track buses and view your trip history.",
};

export default function LoginPage() {
  return <LoginForm />;
}
