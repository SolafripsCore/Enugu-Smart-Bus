/**
 * Browser-only stand-in for the ESB API.
 *
 * The static preview has no API host attached, so when a request can't reach
 * `NEXT_PUBLIC_API_URL` the app falls back to this implementation, which mirrors
 * the FastAPI routes (`/auth/*`, `/account/*`) against localStorage. It exists
 * purely so the signed-in experience can be demonstrated; point the app at the
 * real API and none of this runs.
 */

import type { AuthResponse, Transaction, Trip, User, Wallet } from "@/lib/api";

const STORE_KEY = "esb.demo.store";

type StoredUser = User & {
  password: string;
  transactions: Transaction[];
  trips: Trip[];
};

type Store = {
  users: StoredUser[];
  nextId: number;
  resetTokens: Record<string, string>;
};

const WELCOME_CREDIT = 2000;

const DEMO_TRIPS = [
  {
    route: "Route 3",
    origin: "Ogbete Main Market",
    destination: "Independence Layout",
    fare: 300,
    daysAgo: 1,
  },
  {
    route: "Route 7",
    origin: "New Haven",
    destination: "Enugu State University",
    fare: 250,
    daysAgo: 3,
  },
  {
    route: "Route 1",
    origin: "Holy Ghost Terminal",
    destination: "Abakpa Nike",
    fare: 350,
    daysAgo: 6,
  },
];

export class DemoApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "DemoApiError";
    this.status = status;
  }
}

function readStore(): Store {
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) return { users: [], nextId: 1, resetTokens: {} };
  try {
    return JSON.parse(raw) as Store;
  } catch {
    return { users: [], nextId: 1, resetTokens: {} };
  }
}

function writeStore(store: Store) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function toUser(stored: StoredUser): User {
  const { password, transactions, trips, ...user } = stored;
  void password;
  void transactions;
  void trips;
  return user;
}

function authResponse(stored: StoredUser): AuthResponse {
  return {
    user: toUser(stored),
    token: {
      access_token: `demo.${stored.email}`,
      token_type: "bearer",
      expires_in: 604800,
    },
  };
}

function requireUser(store: Store, token?: string | null): StoredUser {
  const email = token?.startsWith("demo.") ? token.slice(5) : null;
  const user = email
    ? store.users.find((candidate) => candidate.email === email)
    : undefined;
  if (!user) throw new DemoApiError("Not authenticated", 401);
  return user;
}

function seed(user: StoredUser) {
  let balance = WELCOME_CREDIT;
  let transactionId = 1;
  let tripId = 1;

  user.transactions = [
    {
      id: transactionId++,
      kind: "top_up",
      amount: WELCOME_CREDIT.toFixed(2),
      description: "Welcome credit",
      created_at: new Date().toISOString(),
    },
  ];

  for (const trip of DEMO_TRIPS) {
    const travelledAt = daysAgo(trip.daysAgo);
    user.trips.push({
      id: tripId++,
      route: trip.route,
      origin: trip.origin,
      destination: trip.destination,
      fare: trip.fare.toFixed(2),
      travelled_at: travelledAt,
    });
    user.transactions.push({
      id: transactionId++,
      kind: "fare",
      amount: trip.fare.toFixed(2),
      description: `${trip.route}: ${trip.origin} → ${trip.destination}`,
      created_at: travelledAt,
    });
    balance -= trip.fare;
  }

  user.wallet_balance = balance.toFixed(2);
}

function sortedTransactions(user: StoredUser) {
  return [...user.transactions].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

function wallet(user: StoredUser): Wallet {
  return {
    balance: user.wallet_balance,
    transactions: sortedTransactions(user),
  };
}

export function handleDemoRequest(
  path: string,
  method: string,
  body: Record<string, unknown> | undefined,
  token: string | null | undefined,
): unknown {
  const store = readStore();

  if (path === "/auth/signup" && method === "POST") {
    const email = String(body?.email ?? "").toLowerCase();
    if (store.users.some((user) => user.email === email)) {
      throw new DemoApiError("An account with this email already exists.", 409);
    }
    const user: StoredUser = {
      id: store.nextId++,
      full_name: String(body?.full_name ?? "").trim(),
      email,
      phone: (body?.phone as string | undefined) ?? null,
      password: String(body?.password ?? ""),
      wallet_balance: "0.00",
      created_at: new Date().toISOString(),
      transactions: [],
      trips: [],
    };
    seed(user);
    store.users.push(user);
    writeStore(store);
    return authResponse(user);
  }

  if (path === "/auth/login" && method === "POST") {
    const email = String(body?.email ?? "").toLowerCase();
    const user = store.users.find((candidate) => candidate.email === email);
    if (!user || user.password !== String(body?.password ?? "")) {
      throw new DemoApiError("Incorrect email or password.", 401);
    }
    return authResponse(user);
  }

  if (path === "/auth/me" && method === "GET") {
    return toUser(requireUser(store, token));
  }

  if (path === "/auth/forgot-password" && method === "POST") {
    const email = String(body?.email ?? "").toLowerCase();
    const message =
      "If an account exists for that email, a reset link is on its way.";
    if (!store.users.some((user) => user.email === email)) {
      return { message, reset_token: null };
    }
    const resetToken = `demo-reset-${Math.random().toString(36).slice(2, 10)}`;
    store.resetTokens[resetToken] = email;
    writeStore(store);
    return { message, reset_token: resetToken };
  }

  if (path === "/auth/reset-password" && method === "POST") {
    const resetToken = String(body?.token ?? "");
    const email = store.resetTokens[resetToken];
    const user = store.users.find((candidate) => candidate.email === email);
    if (!user) {
      throw new DemoApiError("This reset link is invalid or has expired.", 400);
    }
    user.password = String(body?.password ?? "");
    delete store.resetTokens[resetToken];
    writeStore(store);
    return { message: "Your password has been updated. You can log in now." };
  }

  if (path === "/account/wallet" && method === "GET") {
    return wallet(requireUser(store, token));
  }

  if (path === "/account/wallet/top-up" && method === "POST") {
    const user = requireUser(store, token);
    const amount = Number(body?.amount ?? 0);
    user.wallet_balance = (Number(user.wallet_balance) + amount).toFixed(2);
    user.transactions.push({
      id: user.transactions.length + 1,
      kind: "top_up",
      amount: amount.toFixed(2),
      description: String(body?.description ?? "Wallet top-up"),
      created_at: new Date().toISOString(),
    });
    writeStore(store);
    return wallet(user);
  }

  if (path === "/account/trips" && method === "GET") {
    const user = requireUser(store, token);
    return [...user.trips].sort(
      (a, b) => Date.parse(b.travelled_at) - Date.parse(a.travelled_at),
    ) satisfies Trip[];
  }

  if ((path === "/contact" || path === "/newsletter") && method === "POST") {
    return { message: "Thanks! We'll be in touch." };
  }

  throw new DemoApiError("Not found", 404);
}
