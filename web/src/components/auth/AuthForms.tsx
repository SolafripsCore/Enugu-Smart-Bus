"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CodeInput } from "@/components/auth/CodeInput";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Shield } from "@/components/ui/Icons";
import {
  apiFetch,
  ApiError,
  type OtpPurpose,
  type OtpResponse,
  type OtpVerifyResponse,
} from "@/lib/api";

const OTP_LENGTH = 6;
const PIN_LENGTH = 4;
const COUNTRY_CODE = "+234";

const inputClass =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition placeholder:text-navy-900/40 focus:border-grass-400 focus:ring-2 focus:ring-grass-100";

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: ReactNode;
}) {
  const tones = {
    error: "bg-red-50 text-red-700",
    success: "bg-grass-50 text-grass-800",
    info: "bg-navy-50 text-navy-700",
  };
  return (
    <p
      aria-live="polite"
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${tones[tone]}`}
    >
      {children}
    </p>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
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
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-navy-900/50">{hint}</p>
      ) : null}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function PhoneField({
  id,
  label = "Phone number",
  value,
  onChange,
  error,
  disabled = false,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div
        className={[
          "flex items-stretch overflow-hidden rounded-xl border bg-white transition focus-within:ring-2 focus-within:ring-grass-100",
          error
            ? "border-red-300"
            : "border-navy-100 focus-within:border-grass-400",
        ].join(" ")}
      >
        <span className="flex items-center gap-1.5 border-r border-navy-100 bg-navy-50/60 px-3 text-sm font-semibold text-navy-800">
          <span aria-hidden>🇳🇬</span>
          {COUNTRY_CODE}
        </span>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="803 000 0000"
          disabled={disabled}
          aria-invalid={Boolean(error)}
          value={value}
          onChange={(event) =>
            onChange(event.target.value.replace(/[^\d\s+]/g, ""))
          }
          className="w-full min-w-0 bg-transparent px-4 py-3 text-sm text-navy-900 outline-none placeholder:text-navy-900/40 disabled:opacity-60"
        />
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mt-8 flex items-center gap-2">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <span
              className={[
                "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition",
                done
                  ? "bg-grass-500 text-white"
                  : active
                    ? "bg-navy-800 text-white"
                    : "bg-navy-50 text-navy-900/40",
              ].join(" ")}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={[
                "hidden text-xs font-semibold sm:block",
                active ? "text-navy-900" : "text-navy-900/45",
              ].join(" ")}
            >
              {step}
            </span>
            {index < steps.length - 1 ? (
              <span
                className={[
                  "h-px flex-1 rounded-full",
                  done ? "bg-grass-400" : "bg-navy-100",
                ].join(" ")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/** Shared "enter the code we sent you" step. */
function VerifyStep({
  otp,
  code,
  setCode,
  onSubmit,
  onResend,
  onEdit,
  pending,
  error,
}: {
  otp: OtpResponse;
  code: string;
  setCode: (value: string) => void;
  onSubmit: (code?: string) => void;
  onResend: () => void;
  onEdit: () => void;
  pending: boolean;
  error?: string;
}) {
  const [seconds, setSeconds] = useState(otp.resend_in);

  useEffect(() => {
    setSeconds(otp.resend_in);
  }, [otp]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setInterval(
      () => setSeconds((current) => Math.max(0, current - 1)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [seconds]);

  return (
    <form
      className="mt-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-navy-900/60">
        Enter the {OTP_LENGTH}-digit code sent to{" "}
        <span className="font-semibold text-navy-900">{otp.masked_phone}</span>.{" "}
        <button
          type="button"
          onClick={onEdit}
          className="font-semibold text-grass-700 hover:underline"
        >
          Change number
        </button>
      </p>

      <div className="mt-5">
        <CodeInput
          id="otp"
          label="Verification code"
          length={OTP_LENGTH}
          value={code}
          onChange={setCode}
          onComplete={onSubmit}
          autoFocus
          invalid={Boolean(error)}
          disabled={pending}
        />
      </div>

      {otp.debug_code ? (
        <FormAlert tone="info">
          {`SMS delivery isn't connected yet — your code is ${otp.debug_code}.`}
        </FormAlert>
      ) : null}
      {error ? <FormAlert tone="error">{error}</FormAlert> : null}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={pending || code.length < OTP_LENGTH}
      >
        {pending ? "Verifying…" : "Verify number"}
      </Button>

      <p className="mt-4 text-center text-sm text-navy-900/60">
        {seconds > 0 ? (
          `You can request a new code in ${seconds}s`
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="min-h-11 font-semibold text-grass-700 hover:underline"
          >
            Send a new code
          </button>
        )}
      </p>
    </form>
  );
}

/** Shared "choose your 4-digit PIN" step. */
function PinStep({
  title,
  cta,
  pin,
  setPin,
  confirm,
  setConfirm,
  onSubmit,
  pending,
  error,
}: {
  title: string;
  cta: string;
  pin: string;
  setPin: (value: string) => void;
  confirm: string;
  setConfirm: (value: string) => void;
  onSubmit: () => void;
  pending: boolean;
  error?: string;
}) {
  const mismatch = confirm.length === PIN_LENGTH && confirm !== pin;

  return (
    <form
      className="mt-8"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <p className="text-sm text-navy-900/60">{title}</p>

      <div className="mt-5 space-y-5">
        <div>
          <span className="mb-2 block text-sm font-medium">
            Your 4-digit PIN
          </span>
          <CodeInput
            id="pin"
            label="PIN"
            length={PIN_LENGTH}
            value={pin}
            onChange={setPin}
            secure
            autoFocus
            disabled={pending}
            invalid={Boolean(error)}
          />
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium">Confirm PIN</span>
          <CodeInput
            id="pin-confirm"
            label="Confirm PIN"
            length={PIN_LENGTH}
            value={confirm}
            onChange={setConfirm}
            secure
            disabled={pending}
            invalid={mismatch}
          />
          {mismatch ? (
            <p className="mt-1.5 text-xs text-red-600">Both PINs must match.</p>
          ) : null}
        </div>
      </div>

      <p className="mt-5 flex items-start gap-2 rounded-xl bg-navy-50/70 px-4 py-3 text-xs text-navy-700">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-grass-600" />
        Your PIN unlocks your wallet. Keep it private and avoid 1234 or your
        date of birth.
      </p>

      {error ? <FormAlert tone="error">{error}</FormAlert> : null}

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={pending || pin.length < PIN_LENGTH || confirm !== pin}
      >
        {pending ? "Securing your account…" : cta}
      </Button>
    </form>
  );
}

function requestOtp(phone: string, purpose: OtpPurpose) {
  return apiFetch<OtpResponse>("/auth/otp/request", {
    method: "POST",
    body: { phone, purpose },
  });
}

function verifyOtp(phone: string, code: string, purpose: OtpPurpose) {
  return apiFetch<OtpVerifyResponse>("/auth/otp/verify", {
    method: "POST",
    body: { phone, code, purpose },
  });
}

function withCountryCode(local: string) {
  const digits = local.replace(/\D/g, "");
  return digits.startsWith("234") ? `+${digits}` : `${COUNTRY_CODE}${digits}`;
}

export function SignupForm() {
  const router = useRouter();
  const { completePin } = useAuth();
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<OtpResponse | null>(null);
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = "Enter your full name.";
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter your phone number, e.g. 803 000 0000.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      setOtp(await requestOtp(withCountryCode(phone), "signup"));
      setCode("");
      setStep(1);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const verify = async (enteredCode = code) => {
    if (!otp || enteredCode.length < OTP_LENGTH || pending) return;
    setPending(true);
    setFormError(undefined);
    try {
      const verified = await verifyOtp(otp.phone, enteredCode, "signup");
      setVerificationToken(verified.verification_token);
      setStep(2);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!otp) return;
    setFormError(undefined);
    try {
      setOtp(await requestOtp(otp.phone, "signup"));
      setCode("");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  const finish = async () => {
    setPending(true);
    setFormError(undefined);
    try {
      await completePin({
        verification_token: verificationToken,
        pin,
        full_name: fullName.trim(),
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
        Register with your phone number, verify it and set a 4-digit PIN. It
        takes about a minute.
      </p>

      <Stepper
        steps={["Your details", "Verify number", "Secure PIN"]}
        current={step}
      />

      {step === 0 ? (
        <form onSubmit={start} noValidate className="mt-8 space-y-5">
          <Field
            id="full-name"
            label="Full name"
            autoComplete="name"
            placeholder="Ada Okonkwo"
            value={fullName}
            onChange={setFullName}
            error={errors.fullName}
          />
          <PhoneField
            id="signup-phone"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Sending code…" : "Send verification code"}
            {!pending ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
          </Button>
          {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}
        </form>
      ) : null}

      {step === 1 && otp ? (
        <VerifyStep
          otp={otp}
          code={code}
          setCode={setCode}
          onSubmit={verify}
          onResend={resend}
          onEdit={() => {
            setStep(0);
            setFormError(undefined);
          }}
          pending={pending}
          error={formError}
        />
      ) : null}

      {step === 2 ? (
        <PinStep
          title="Choose the PIN you'll use to log in and approve fares."
          cta="Create my account"
          pin={pin}
          setPin={setPin}
          confirm={confirm}
          setConfirm={setConfirm}
          onSubmit={finish}
          pending={pending}
          error={formError}
        />
      ) : null}

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

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const submit = async (enteredPin = pin) => {
    const next: Record<string, string> = {};
    if (phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter your phone number, e.g. 803 000 0000.";
    if (enteredPin.length < PIN_LENGTH) next.pin = "Enter your 4-digit PIN.";
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length > 0) return;

    setPending(true);
    try {
      await login(withCountryCode(phone), enteredPin);
      router.push("/account");
    } catch (error) {
      setPin("");
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Welcome back</h1>
      <p className="mt-3 text-navy-900/60">
        Log in with your phone number and 4-digit PIN.
      </p>

      <form
        noValidate
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <PhoneField
          id="login-phone"
          value={phone}
          onChange={setPhone}
          error={errors.phone}
        />
        <div>
          <span className="mb-2 block text-sm font-medium">4-digit PIN</span>
          <CodeInput
            id="login-pin"
            label="PIN"
            length={PIN_LENGTH}
            value={pin}
            onChange={setPin}
            onComplete={submit}
            secure
            disabled={pending}
            invalid={Boolean(errors.pin || formError)}
          />
          {errors.pin ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.pin}</p>
          ) : null}
        </div>
        <div className="flex justify-end">
          <Link
            href="/forgot-pin"
            className="inline-flex min-h-11 items-center text-sm font-medium text-grass-700 hover:underline"
          >
            Forgot your PIN?
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

export function ForgotPinForm() {
  const router = useRouter();
  const { completePin } = useAuth();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<OtpResponse | null>(null);
  const [code, setCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phoneError, setPhoneError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [pending, setPending] = useState(false);

  const start = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setPhoneError("Enter your phone number, e.g. 803 000 0000.");
      return;
    }
    setPhoneError(undefined);
    setFormError(undefined);
    setPending(true);
    try {
      setOtp(await requestOtp(withCountryCode(phone), "reset_pin"));
      setCode("");
      setStep(1);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const verify = async (enteredCode = code) => {
    if (!otp || enteredCode.length < OTP_LENGTH || pending) return;
    setPending(true);
    setFormError(undefined);
    try {
      const verified = await verifyOtp(otp.phone, enteredCode, "reset_pin");
      setVerificationToken(verified.verification_token);
      setStep(2);
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const resend = async () => {
    if (!otp) return;
    setFormError(undefined);
    try {
      setOtp(await requestOtp(otp.phone, "reset_pin"));
      setCode("");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  };

  const finish = async () => {
    setPending(true);
    setFormError(undefined);
    try {
      await completePin({ verification_token: verificationToken, pin });
      router.push("/account");
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <h1 className="heading-md text-navy-900">Reset your PIN</h1>
      <p className="mt-3 text-navy-900/60">
        We&apos;ll text a verification code to your registered number, then you
        can choose a new PIN.
      </p>

      <Stepper steps={["Your number", "Verify", "New PIN"]} current={step} />

      {step === 0 ? (
        <form onSubmit={start} noValidate className="mt-8 space-y-5">
          <PhoneField
            id="reset-phone"
            label="Registered phone number"
            value={phone}
            onChange={setPhone}
            error={phoneError}
          />
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Sending code…" : "Send verification code"}
          </Button>
          {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}
        </form>
      ) : null}

      {step === 1 && otp ? (
        <VerifyStep
          otp={otp}
          code={code}
          setCode={setCode}
          onSubmit={verify}
          onResend={resend}
          onEdit={() => {
            setStep(0);
            setFormError(undefined);
          }}
          pending={pending}
          error={formError}
        />
      ) : null}

      {step === 2 ? (
        <PinStep
          title="Choose a new 4-digit PIN for your account."
          cta="Save my new PIN"
          pin={pin}
          setPin={setPin}
          confirm={confirm}
          setConfirm={setConfirm}
          onSubmit={finish}
          pending={pending}
          error={formError}
        />
      ) : null}

      <p className="mt-8 text-center text-sm text-navy-900/60">
        Remembered it?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="inline-flex min-h-11 items-center font-semibold text-navy-700 hover:underline"
        >
          Back to log in
        </button>
      </p>
    </div>
  );
}
