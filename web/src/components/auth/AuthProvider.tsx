"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  apiFetch,
  TOKEN_STORAGE_KEY,
  type AuthResponse,
  type User,
} from "@/lib/api";

type SetPinInput = {
  verification_token: string;
  pin: string;
  full_name?: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, pin: string) => Promise<User>;
  completePin: (input: SetPinInput) => Promise<User>;
  setUser: (user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback((response: AuthResponse) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token.access_token);
    setToken(response.token.access_token);
    setUser(response.user);
    return response.user;
  }, []);

  const loadSession = useCallback(async (stored: string) => {
    try {
      const current = await apiFetch<User>("/auth/me", { token: stored });
      setToken(stored);
      setUser(current);
    } catch {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    loadSession(stored).finally(() => setLoading(false));
  }, [loadSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login: async (phone, pin) =>
        applySession(
          await apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            body: { phone, pin },
          }),
        ),
      completePin: async (input) =>
        applySession(
          await apiFetch<AuthResponse>("/auth/pin", {
            method: "POST",
            body: input,
          }),
        ),
      setUser,
      logout: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      },
      refresh: async () => {
        if (token) await loadSession(token);
      },
    }),
    [applySession, loadSession, loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
