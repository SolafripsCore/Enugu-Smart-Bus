"use client";

import { useState, type FormEvent } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { CodeInput } from "@/components/auth/CodeInput";
import { Button } from "@/components/ui/Button";
import { apiFetch, ApiError, type User } from "@/lib/api";

const PIN_LENGTH = 4;

const inputClass =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition placeholder:text-navy-900/40 focus:border-grass-400 focus:ring-2 focus:ring-grass-100";

function message(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

function Status({ tone, text }: { tone: "error" | "success"; text: string }) {
  return (
    <p
      aria-live="polite"
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-red-50 text-red-700"
          : "bg-grass-50 text-grass-800"
      }`}
    >
      {text}
    </p>
  );
}

export function ProfileSettings() {
  const { user, token, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [profilePending, setProfilePending] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{
    tone: "error" | "success";
    text: string;
  }>();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinPending, setPinPending] = useState(false);
  const [pinStatus, setPinStatus] = useState<{
    tone: "error" | "success";
    text: string;
  }>();

  if (!user || !token) return null;

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfilePending(true);
    setProfileStatus(undefined);
    try {
      const updated = await apiFetch<User>("/auth/me", {
        method: "PATCH",
        body: { full_name: fullName.trim(), email: email.trim() || null },
        token,
      });
      setUser(updated);
      setProfileStatus({ tone: "success", text: "Profile updated." });
    } catch (error) {
      setProfileStatus({ tone: "error", text: message(error) });
    } finally {
      setProfilePending(false);
    }
  };

  const changePin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPinPending(true);
    setPinStatus(undefined);
    try {
      await apiFetch<{ message: string }>("/auth/pin/change", {
        method: "POST",
        body: { current_pin: currentPin, new_pin: newPin },
        token,
      });
      setCurrentPin("");
      setNewPin("");
      setPinStatus({ tone: "success", text: "Your PIN has been updated." });
    } catch (error) {
      setPinStatus({ tone: "error", text: message(error) });
    } finally {
      setPinPending(false);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <form onSubmit={saveProfile} className="card-surface p-8">
        <h2 className="font-display text-lg font-semibold text-navy-800">
          Profile
        </h2>
        <p className="mt-1 text-sm text-navy-900/60">
          Your phone number is your account ID and can&apos;t be changed here.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium"
            >
              Full name
            </label>
            <input
              id="profile-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="profile-email"
              className="mb-2 block text-sm font-medium"
            >
              Email <span className="text-navy-900/40">(optional)</span>
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium">Phone number</span>
            <p className="rounded-xl bg-navy-50/70 px-4 py-3 text-sm font-semibold text-navy-800">
              {user.phone}
            </p>
          </div>
        </div>

        <Button type="submit" className="mt-6" disabled={profilePending}>
          {profilePending ? "Saving…" : "Save changes"}
        </Button>
        {profileStatus ? (
          <Status tone={profileStatus.tone} text={profileStatus.text} />
        ) : null}
      </form>

      <form onSubmit={changePin} className="card-surface p-8">
        <h2 className="font-display text-lg font-semibold text-navy-800">
          Security PIN
        </h2>
        <p className="mt-1 text-sm text-navy-900/60">
          Change the 4-digit PIN you use to log in.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <span className="mb-2 block text-sm font-medium">Current PIN</span>
            <CodeInput
              id="current-pin"
              label="Current PIN"
              length={PIN_LENGTH}
              value={currentPin}
              onChange={setCurrentPin}
              secure
              disabled={pinPending}
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium">New PIN</span>
            <CodeInput
              id="new-pin"
              label="New PIN"
              length={PIN_LENGTH}
              value={newPin}
              onChange={setNewPin}
              secure
              disabled={pinPending}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="mt-6"
          disabled={
            pinPending ||
            currentPin.length < PIN_LENGTH ||
            newPin.length < PIN_LENGTH
          }
        >
          {pinPending ? "Updating…" : "Update PIN"}
        </Button>
        {pinStatus ? (
          <Status tone={pinStatus.tone} text={pinStatus.text} />
        ) : null}
      </form>
    </div>
  );
}
