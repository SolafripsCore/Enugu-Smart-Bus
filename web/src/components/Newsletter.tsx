"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api";

export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    try {
      await apiFetch<{ message: string }>("/newsletter", {
        method: "POST",
        body: { email: email.trim() },
      });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-xl">
      <div
        className={[
          "flex flex-col gap-3 rounded-2xl p-2 sm:flex-row sm:items-center",
          tone === "dark"
            ? "bg-white/10 ring-1 ring-inset ring-white/20"
            : "bg-white shadow-card",
        ].join(" ")}
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email address"
          className={[
            "w-full rounded-xl bg-transparent px-4 py-3 text-sm outline-none",
            tone === "dark"
              ? "text-white placeholder:text-white/60"
              : "text-navy-900 placeholder:text-navy-900/50",
          ].join(" ")}
        />
        <Button
          type="submit"
          className="shrink-0"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Subscribing…" : "Subscribe"}
        </Button>
      </div>
      <p
        aria-live="polite"
        className={[
          "mt-3 text-sm",
          tone === "dark" ? "text-white/70" : "text-navy-900/60",
        ].join(" ")}
      >
        {status === "done"
          ? "Thanks! You're on the list — watch your inbox for route news and updates."
          : status === "error"
            ? "We couldn't subscribe you just now. Please try again."
            : "No spam. Unsubscribe at any time."}
      </p>
    </form>
  );
}
