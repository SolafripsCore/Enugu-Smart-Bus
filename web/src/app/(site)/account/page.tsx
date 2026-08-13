import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Manage your Enugu Smart Bus wallet, top up your balance and review recent trips.",
  robots: { index: false },
};

export default function AccountPage() {
  return <AccountDashboard />;
}
