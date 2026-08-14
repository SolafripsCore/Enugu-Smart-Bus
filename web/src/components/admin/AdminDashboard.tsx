"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  apiFetch,
  formatNaira,
  type AdminContactMessage,
  type AdminOverview,
  type AdminRider,
  type AdminSubscriber,
  type AdminTransaction,
  type AdminTrip,
} from "@/lib/api";

type Tab = "riders" | "transactions" | "trips" | "messages" | "newsletter";

const tabs: { id: Tab; label: string }[] = [
  { id: "riders", label: "Riders" },
  { id: "transactions", label: "Transactions" },
  { id: "trips", label: "Trips" },
  { id: "messages", label: "Messages" },
  { id: "newsletter", label: "Newsletter" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy-900/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-navy-900/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-navy-900/10 bg-white shadow-sm">
      <div className="border-b border-navy-900/10 px-4 py-3">
        <h2 className="font-semibold text-navy-900">{title}</h2>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("riders");
  const [search, setSearch] = useState("");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [riders, setRiders] = useState<AdminRider[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<AdminSubscriber[]>([]);
  const [error, setError] = useState<string>();
  const [busyId, setBusyId] = useState<number>();

  const isAdmin = Boolean(user?.is_admin);

  const load = useCallback(async (accessToken: string, term: string) => {
    const query = term.trim()
      ? `?search=${encodeURIComponent(term.trim())}`
      : "";
    const [
      overviewData,
      riderData,
      transactionData,
      tripData,
      messageData,
      subscriberData,
    ] = await Promise.all([
      apiFetch<AdminOverview>("/admin/overview", { token: accessToken }),
      apiFetch<AdminRider[]>(`/admin/riders${query}`, { token: accessToken }),
      apiFetch<AdminTransaction[]>("/admin/transactions", {
        token: accessToken,
      }),
      apiFetch<AdminTrip[]>("/admin/trips", { token: accessToken }),
      apiFetch<AdminContactMessage[]>("/admin/messages", {
        token: accessToken,
      }),
      apiFetch<AdminSubscriber[]>("/admin/newsletter", {
        token: accessToken,
      }),
    ]);
    setOverview(overviewData);
    setRiders(riderData);
    setTransactions(transactionData);
    setTrips(tripData);
    setMessages(messageData);
    setSubscribers(subscriberData);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    if (!user.is_admin) {
      router.replace("/account");
      return;
    }
    load(token, "").catch(() =>
      setError("Couldn't load the admin data right now."),
    );
  }, [load, loading, router, token, user]);

  const onSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    try {
      const query = search.trim()
        ? `?search=${encodeURIComponent(search.trim())}`
        : "";
      setRiders(
        await apiFetch<AdminRider[]>(`/admin/riders${query}`, { token }),
      );
      setTab("riders");
    } catch {
      setError("Search failed. Please try again.");
    }
  };

  const updateRider = async (
    rider: AdminRider,
    patch: { is_active?: boolean; is_admin?: boolean },
  ) => {
    if (!token) return;
    setBusyId(rider.id);
    setError(undefined);
    try {
      const updated = await apiFetch<AdminRider>(`/admin/riders/${rider.id}`, {
        method: "PATCH",
        body: patch,
        token,
      });
      setRiders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch {
      setError("Couldn't update that rider.");
    } finally {
      setBusyId(undefined);
    }
  };

  const stats = useMemo(() => {
    if (!overview) return [];
    return [
      { label: "Riders", value: String(overview.riders) },
      { label: "Verified", value: String(overview.verified_riders) },
      { label: "New (7 days)", value: String(overview.new_riders_7d) },
      {
        label: "Wallet balances",
        value: formatNaira(overview.wallet_balance_total),
      },
      { label: "Top-ups", value: formatNaira(overview.top_up_total) },
      { label: "Fares", value: formatNaira(overview.fare_total) },
      { label: "Trips", value: String(overview.trips) },
      { label: "Messages", value: String(overview.contact_messages) },
      { label: "Subscribers", value: String(overview.newsletter_subscribers) },
    ];
  }, [overview]);

  if (loading || !user || !isAdmin) {
    return (
      <div className="container py-24 text-center text-navy-900/60">
        Checking your access…
      </div>
    );
  }

  return (
    <div className="container py-10 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-grass-700">
            Super admin
          </p>
          <h1 className="heading-lg mt-2 text-navy-900">Operations overview</h1>
          <p className="mt-2 text-navy-900/60">
            Signed in as {user.full_name} · {user.phone}
          </p>
        </div>
        <Link href="/account">
          <Button variant="ghost">My account</Button>
        </Link>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <form
        onSubmit={onSearch}
        className="mt-8 flex flex-wrap items-center gap-3"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search riders by name, phone or email"
          className="min-h-11 w-full flex-1 rounded-xl border border-navy-900/15 px-4 text-navy-900 sm:w-auto"
        />
        <Button type="submit">Search</Button>
      </form>

      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-navy-900 text-white"
                : "bg-navy-50 text-navy-900/70 hover:bg-navy-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "riders" ? (
        <Panel title={`Riders (${riders.length})`}>
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-900/60">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Wallet</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((rider) => (
                <tr key={rider.id} className="border-t border-navy-900/5">
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {rider.full_name}
                    {rider.is_admin ? (
                      <span className="ml-2 rounded-full bg-grass-100 px-2 py-0.5 text-xs text-grass-700">
                        admin
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {rider.phone ?? rider.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {formatNaira(rider.wallet_balance)}
                  </td>
                  <td className="px-4 py-3">{formatDate(rider.created_at)}</td>
                  <td className="px-4 py-3">
                    {rider.is_active ? "Active" : "Blocked"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busyId === rider.id || rider.id === user.id}
                        onClick={() =>
                          void updateRider(rider, {
                            is_active: !rider.is_active,
                          })
                        }
                        className="rounded-full border border-navy-900/15 px-3 py-1 text-xs font-semibold text-navy-900 disabled:opacity-40"
                      >
                        {rider.is_active ? "Block" : "Unblock"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === rider.id || rider.id === user.id}
                        onClick={() =>
                          void updateRider(rider, { is_admin: !rider.is_admin })
                        }
                        className="rounded-full border border-navy-900/15 px-3 py-1 text-xs font-semibold text-navy-900 disabled:opacity-40"
                      >
                        {rider.is_admin ? "Revoke admin" : "Make admin"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : null}

      {tab === "transactions" ? (
        <Panel title={`Recent transactions (${transactions.length})`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-900/60">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id} className="border-t border-navy-900/5">
                  <td className="px-4 py-3">
                    {item.user_name}
                    <span className="block text-xs text-navy-900/50">
                      {item.user_phone ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {item.kind === "top_up" ? "Top-up" : "Fare"}
                  </td>
                  <td className="px-4 py-3">{formatNaira(item.amount)}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3">{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : null}

      {tab === "trips" ? (
        <Panel title={`Recent trips (${trips.length})`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-900/60">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Journey</th>
                <th className="px-4 py-3">Fare</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t border-navy-900/5">
                  <td className="px-4 py-3">
                    {trip.user_name}
                    <span className="block text-xs text-navy-900/50">
                      {trip.user_phone ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{trip.route}</td>
                  <td className="px-4 py-3">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="px-4 py-3">{formatNaira(trip.fare)}</td>
                  <td className="px-4 py-3">{formatDate(trip.travelled_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ) : null}

      {tab === "messages" ? (
        <Panel title={`Contact messages (${messages.length})`}>
          <ul className="divide-y divide-navy-900/5">
            {messages.map((message) => (
              <li key={message.id} className="px-4 py-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-navy-900">
                    {message.subject}
                  </p>
                  <p className="text-xs text-navy-900/50">
                    {formatDate(message.created_at)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-navy-900/60">
                  {message.name} · {message.email}
                  {message.phone ? ` · ${message.phone}` : ""}
                </p>
                <p className="mt-2 text-sm text-navy-900/80">
                  {message.message}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {tab === "newsletter" ? (
        <Panel title={`Newsletter subscribers (${subscribers.length})`}>
          <ul className="divide-y divide-navy-900/5">
            {subscribers.map((subscriber) => (
              <li
                key={subscriber.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="text-navy-900">{subscriber.email}</span>
                <span className="text-xs text-navy-900/50">
                  {formatDate(subscriber.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}
