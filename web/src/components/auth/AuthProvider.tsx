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

type SignupInput = {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
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
      login: async (email, password) =>
        applySession(
          await apiFetch<AuthResponse>("/auth/login", {
            method: "POST",
            body: { email, password },
          }),
        ),
      signup: async (input) =>
        applySession(
          await apiFetch<AuthResponse>("/auth/signup", {
            method: "POST",
            body: input,
          }),
        ),
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
