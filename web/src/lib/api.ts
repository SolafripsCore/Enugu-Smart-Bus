import { DemoApiError, handleDemoRequest } from "@/lib/demoBackend";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const TOKEN_STORAGE_KEY = "esb.token";

export type User = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  phone_verified_at: string | null;
  wallet_balance: string;
  is_admin: boolean;
  created_at: string;
};

export type OtpPurpose = "signup" | "reset_pin";

export type OtpResponse = {
  message: string;
  phone: string;
  masked_phone: string;
  expires_in: number;
  resend_in: number;
  delivered: boolean;
  debug_code: string | null;
};

export type OtpVerifyResponse = {
  verification_token: string;
  expires_in: number;
  purpose: OtpPurpose;
};

export type AuthResponse = {
  user: User;
  token: { access_token: string; token_type: string; expires_in: number };
};

export type Transaction = {
  id: number;
  kind: "top_up" | "fare";
  amount: string;
  description: string;
  created_at: string;
};

export type Wallet = {
  balance: string;
  transactions: Transaction[];
};

export type Trip = {
  id: number;
  route: string;
  origin: string;
  destination: string;
  fare: string;
  travelled_at: string;
};

export type AdminOverview = {
  riders: number;
  verified_riders: number;
  active_riders: number;
  new_riders_7d: number;
  wallet_balance_total: string;
  top_up_total: string;
  transactions: number;
  trips: number;
  fare_total: string;
  contact_messages: number;
  newsletter_subscribers: number;
};

export type AdminRider = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  phone_verified_at: string | null;
  wallet_balance: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
};

export type AdminTransaction = Transaction & {
  user_id: number;
  user_name: string;
  user_phone: string;
};

export type AdminTrip = Trip & {
  user_id: number;
  user_name: string;
  user_phone: string;
};

export type AdminContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
};

export type AdminSubscriber = {
  id: number;
  email: string;
  created_at: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function readDetail(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as { msg?: unknown } | undefined;
    if (first && typeof first.msg === "string") return first.msg;
  }
  return undefined;
}

const DEMO_FLAG_KEY = "esb.demo.active";

/** A real API host is configured, so the in-browser fallback stays off. */
const HAS_API_HOST = Boolean(process.env.NEXT_PUBLIC_API_URL);

/** True once a request has fallen back to the in-browser demo backend. */
export function isDemoMode() {
  if (HAS_API_HOST || typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_FLAG_KEY) === "1";
}

function runDemoRequest<T>(
  path: string,
  method: string,
  body: unknown,
  token: string | null | undefined,
): T {
  window.localStorage.setItem(DEMO_FLAG_KEY, "1");
  try {
    return handleDemoRequest(
      path,
      method,
      body as Record<string, unknown> | undefined,
      token,
    ) as T;
  } catch (error) {
    if (error instanceof DemoApiError) {
      throw new ApiError(error.message, error.status);
    }
    throw error;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null } = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  if (isDemoMode()) return runDemoRequest<T>(path, method, body, token);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    if (HAS_API_HOST) {
      throw new ApiError("Can't reach the server. Please try again.", 503);
    }
    return runDemoRequest<T>(path, method, body, token);
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      readDetail(payload) ?? "Something went wrong. Please try again.",
      response.status,
    );
  }
  return payload as T;
}

export function formatNaira(amount: string | number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
