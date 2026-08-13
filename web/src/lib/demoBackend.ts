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
  pin: string;
  transactions: Transaction[];
  trips: Trip[];
};

type PendingVerification = {
  phone: string;
  purpose: string;
  code: string;
};

type Store = {
  users: StoredUser[];
  nextId: number;
  verifications: Record<string, PendingVerification>;
};

const DEMO_OTP_TTL = 600;
const DEMO_RESEND_SECONDS = 30;

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
  const empty: Store = { users: [], nextId: 1, verifications: {} };
  if (!raw) return empty;
  try {
    return { ...empty, ...(JSON.parse(raw) as Store) };
  } catch {
    return empty;
  }
}

function writeStore(store: Store) {
  window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function normalizePhone(raw: string): string {
  const digits = String(raw).replace(/\D/g, "");
  const local = digits.startsWith("234")
    ? digits.slice(3)
    : digits.replace(/^0/, "");
  if (local.length !== 10) {
    throw new DemoApiError("Enter a valid Nigerian phone number.", 422);
  }
  return `+234${local}`;
}

function maskPhone(phone: string): string {
  return `${phone.slice(0, 7)} *** ${phone.slice(-4)}`;
}

function toUser(stored: StoredUser): User {
  const { pin, transactions, trips, ...user } = stored;
  void pin;
  void transactions;
  void trips;
  return user;
}

function authResponse(stored: StoredUser): AuthResponse {
  return {
    user: toUser(stored),
    token: {
      access_token: `demo.${stored.phone}`,
      token_type: "bearer",
      expires_in: 604800,
    },
  };
}

function requireUser(store: Store, token?: string | null): StoredUser {
  const phone = token?.startsWith("demo.") ? token.slice(5) : null;
  const user = phone
    ? store.users.find((candidate) => candidate.phone === phone)
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

  if (path === "/auth/otp/request" && method === "POST") {
    const phone = normalizePhone(String(body?.phone ?? ""));
    const purpose = String(body?.purpose ?? "signup");
    const existing = store.users.find((user) => user.phone === phone);
    if (purpose === "signup" && existing) {
      throw new DemoApiError(
        "This phone number is already registered. Log in instead.",
        409,
      );
    }
    if (purpose === "reset_pin" && !existing) {
      throw new DemoApiError(
        "We couldn't find an account for that number.",
        404,
      );
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const verificationToken = `demo-otp-${Math.random().toString(36).slice(2, 10)}`;
    store.verifications[verificationToken] = { phone, purpose, code };
    writeStore(store);
    return {
      message: `Verification code sent to ${maskPhone(phone)}.`,
      phone,
      masked_phone: maskPhone(phone),
      expires_in: DEMO_OTP_TTL,
      resend_in: DEMO_RESEND_SECONDS,
      delivered: false,
      debug_code: code,
    };
  }

  if (path === "/auth/otp/verify" && method === "POST") {
    const phone = normalizePhone(String(body?.phone ?? ""));
    const purpose = String(body?.purpose ?? "signup");
    const code = String(body?.code ?? "");
    const entry = Object.entries(store.verifications).find(
      ([, item]) =>
        item.phone === phone && item.purpose === purpose && item.code === code,
    );
    if (!entry) {
      throw new DemoApiError("That code is incorrect. Please try again.", 400);
    }
    return {
      verification_token: entry[0],
      expires_in: 900,
      purpose,
    };
  }

  if (path === "/auth/pin" && method === "POST") {
    const verificationToken = String(body?.verification_token ?? "");
    const verification = store.verifications[verificationToken];
    const pin = String(body?.pin ?? "");
    if (!verification || !/^\d{4}$/.test(pin)) {
      throw new DemoApiError(
        "Your verification has expired. Please start again.",
        400,
      );
    }
    delete store.verifications[verificationToken];
    const existing = store.users.find(
      (candidate) => candidate.phone === verification.phone,
    );
    if (existing) {
      existing.pin = pin;
      writeStore(store);
      return authResponse(existing);
    }
    const user: StoredUser = {
      id: store.nextId++,
      full_name: String(body?.full_name ?? "").trim() || "ESB rider",
      phone: verification.phone,
      email: null,
      phone_verified_at: new Date().toISOString(),
      pin,
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
    const phone = normalizePhone(String(body?.phone ?? ""));
    const user = store.users.find((candidate) => candidate.phone === phone);
    if (!user || user.pin !== String(body?.pin ?? "")) {
      throw new DemoApiError("Incorrect phone number or PIN.", 401);
    }
    return authResponse(user);
  }

  if (path === "/auth/me" && method === "GET") {
    return toUser(requireUser(store, token));
  }

  if (path === "/auth/me" && method === "PATCH") {
    const user = requireUser(store, token);
    if (body?.full_name) user.full_name = String(body.full_name).trim();
    if (body?.email !== undefined) {
      user.email = body.email ? String(body.email).toLowerCase() : null;
    }
    writeStore(store);
    return toUser(user);
  }

  if (path === "/auth/pin/change" && method === "POST") {
    const user = requireUser(store, token);
    if (user.pin !== String(body?.current_pin ?? "")) {
      throw new DemoApiError("Your current PIN is incorrect.", 400);
    }
    user.pin = String(body?.new_pin ?? "");
    writeStore(store);
    return { message: "Your PIN has been updated." };
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
