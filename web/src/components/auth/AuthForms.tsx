"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError } from "@/lib/api";

const inputClass =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition placeholder:text-navy-900/40 focus:border-grass-400 focus:ring-2 focus:ring-grass-100";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: string;
}) {
  return (
    <p
      aria-live="polite"
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-50 text-red-700"
          : "bg-grass-50 text-grass-800"
      }`}
    >
      {children}
    </p>
  );
}

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!emailPattern.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      await login(email, password);
      router.push("/account");
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Welcome back</h1>
      <p className="mt-3 text-navy-900/60">
        Log in to manage your wallet, track buses and view your trips.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center text-sm font-medium text-grass-700 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </Button>
      </form>

      {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}

      <p className="mt-8 text-center text-sm text-navy-900/60">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center font-semibold text-navy-700 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const set = (key: keyof typeof fields) => (value: string) =>
    setFields((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (fields.firstName.trim().length < 2)
      next.firstName = "Enter your first name.";
    if (fields.lastName.trim().length < 2)
      next.lastName = "Enter your last name.";
    if (!emailPattern.test(fields.email))
      next.email = "Enter a valid email address.";
    if (fields.password.length < 8)
      next.password = "Use at least 8 characters.";
    if (fields.confirm !== fields.password)
      next.confirm = "Passwords do not match.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      await signup({
        full_name: `${fields.firstName.trim()} ${fields.lastName.trim()}`,
        email: fields.email.trim(),
        phone: fields.phone.trim() || undefined,
        password: fields.password,
      });
      router.push("/account");
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Create your ESB account</h1>
      <p className="mt-3 text-navy-900/60">
        It takes about a minute. Then fund your wallet and start riding.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="firstName"
            label="First name"
            autoComplete="given-name"
            placeholder="Ada"
            value={fields.firstName}
            onChange={set("firstName")}
            error={errors.firstName}
          />
          <Field
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            placeholder="Okonkwo"
            value={fields.lastName}
            onChange={set("lastName")}
            error={errors.lastName}
          />
        </div>
        <Field
          id="signup-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={fields.email}
          onChange={set("email")}
          error={errors.email}
        />
        <Field
          id="signup-phone"
          label="Phone number (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="+234 800 000 0000"
          value={fields.phone}
          onChange={set("phone")}
        />
        <Field
          id="signup-password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={fields.password}
          onChange={set("password")}
          error={errors.password}
        />
        <Field
          id="signup-confirm"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={fields.confirm}
          onChange={set("confirm")}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}

      <p className="mt-8 text-center text-sm text-navy-900/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-navy-700 hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setPending(true);
    try {
      const response = await apiFetch<{
        message: string;
        reset_token: string | null;
      }>("/auth/forgot-password", { method: "POST", body: { email } });
      setMessage(response.message);
      setResetToken(response.reset_token);
    } catch (submitError) {
      setError(errorMessage(submitError));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Reset your password</h1>
      <p className="mt-3 text-navy-900/60">
        Enter the email address linked to your ESB account and we&apos;ll send
        you a reset link.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          id="reset-email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          error={error}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      {message ? <FormAlert tone="success">{message}</FormAlert> : null}

      {resetToken ? (
        <p className="mt-3 text-sm text-navy-900/60">
          Reset emails aren&apos;t connected yet, so use this link:{" "}
          <Link
            href={`/reset-password?token=${resetToken}`}
            className="font-semibold text-grass-700 hover:underline"
          >
            set a new password
          </Link>
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm text-navy-900/60">
        Remembered it?{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center font-semibold text-navy-700 hover:underline"
        >
          Back to log in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (token.trim().length === 0) next.token = "Paste your reset token.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      const response = await apiFetch<{ message: string }>(
        "/auth/reset-password",
        { method: "POST", body: { token: token.trim(), password } },
      );
      setMessage(response.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Set a new password</h1>
      <p className="mt-3 text-navy-900/60">
        Choose a new password for your ESB account.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Field
          id="reset-token"
          label="Reset token"
          value={token}
          onChange={setToken}
          error={errors.token}
          placeholder="Paste the token from your reset link"
        />
        <Field
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />
        <Field
          id="new-password-confirm"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={confirm}
          onChange={setConfirm}
          error={errors.confirm}
        />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>

      {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}
      {message ? <FormAlert tone="success">{message}</FormAlert> : null}
    </div>
  );
}
