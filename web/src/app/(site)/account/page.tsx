import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Manage your Enugu Smart Bus wallet, top up your balance and review recent trips.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-24 text-center text-navy-900/60">
          Loading your account…
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
