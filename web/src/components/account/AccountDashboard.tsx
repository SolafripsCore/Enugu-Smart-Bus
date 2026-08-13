"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Bus, CreditCard } from "@/components/ui/Icons";
import {
  apiFetch,
  formatNaira,
  isDemoMode,
  type Trip,
  type Wallet,
} from "@/lib/api";

const quickAmounts = ["1000", "2000", "5000"];

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AccountDashboard() {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [amount, setAmount] = useState("2000");
  const [pending, setPending] = useState(false);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string>();

  const load = useCallback(async (accessToken: string) => {
    const [walletData, tripData] = await Promise.all([
      apiFetch<Wallet>("/account/wallet", { token: accessToken }),
      apiFetch<Trip[]>("/account/trips", { token: accessToken }),
    ]);
    setWallet(walletData);
    setTrips(tripData);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    load(token)
      .catch(() => setError("Couldn't load your account right now."))
      .finally(() => setDemo(isDemoMode()));
  }, [load, loading, router, token]);

  const onTopUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(undefined);
    try {
      const updated = await apiFetch<Wallet>("/account/wallet/top-up", {
        method: "POST",
        body: { amount, description: "Wallet top-up" },
        token,
      });
      setWallet(updated);
    } catch {
      setError("Top-up failed. Please try again.");
    } finally {
      setPending(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container py-24 text-center text-navy-900/60">
        Loading your account…
      </div>
    );
  }

  return (
    <div className="container py-14 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-grass-700">
            My account
          </p>
          <h1 className="heading-lg mt-2 text-navy-900">
            Hello, {user.full_name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-navy-900/60">{user.email}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Log out
        </Button>
      </div>

      {demo ? (
        <p className="mt-6 rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-700">
          Preview mode: no API host is attached, so your account lives in this
          browser only.
        </p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl bg-navy-900 p-8 text-white shadow-lift">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-grass-300">
            <CreditCard className="h-6 w-6" />
          </span>
          <p className="mt-6 text-sm uppercase tracking-[0.14em] text-white/60">
            Wallet balance
          </p>
          <p className="mt-2 font-display text-4xl font-bold">
            {formatNaira(wallet?.balance ?? user.wallet_balance)}
          </p>

          <form onSubmit={onTopUp} className="mt-8">
            <label
              htmlFor="top-up-amount"
              className="text-sm font-medium text-white/70"
            >
              Top up your wallet
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    amount === value
                      ? "bg-grass-500 text-white"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {formatNaira(value)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <input
                id="top-up-amount"
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-grass-400"
              />
              <Button type="submit" disabled={pending}>
                {pending ? "Adding…" : "Add funds"}
              </Button>
            </div>
          </form>
        </div>

        <div className="card-surface p-8">
          <h2 className="font-display text-lg font-semibold text-navy-800">
            Recent activity
          </h2>
          <ul className="mt-5 divide-y divide-navy-100/70">
            {wallet?.transactions.length ? (
              wallet.transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-navy-800">
                      {transaction.description}
                    </p>
                    <p className="mt-0.5 text-xs text-navy-900/50">
                      {formatDateTime(transaction.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      transaction.kind === "top_up"
                        ? "text-grass-600"
                        : "text-navy-900/70"
                    }`}
                  >
                    {transaction.kind === "top_up" ? "+" : "−"}
                    {formatNaira(transaction.amount)}
                  </span>
                </li>
              ))
            ) : (
              <li className="py-3.5 text-sm text-navy-900/60">
                No transactions yet.
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="card-surface mt-6 p-8">
        <h2 className="font-display text-lg font-semibold text-navy-800">
          Your trips
        </h2>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {trips.length ? (
            trips.map((trip) => (
              <li key={trip.id} className="rounded-2xl bg-sand p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-grass-600">
                  <Bus className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-navy-800">
                  {trip.origin} → {trip.destination}
                </p>
                <p className="mt-1 text-xs text-navy-900/60">
                  {trip.route} · {formatDateTime(trip.travelled_at)}
                </p>
                <p className="mt-3 text-sm font-semibold text-navy-900">
                  {formatNaira(trip.fare)}
                </p>
              </li>
            ))
          ) : (
            <li className="text-sm text-navy-900/60">No trips recorded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
