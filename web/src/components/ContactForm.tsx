"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { ApiError, apiFetch } from "@/lib/api";
import { contactCategories } from "@/lib/site";

type Fields = {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
  consent: boolean;
};

const empty: Fields = {
  name: "",
  email: "",
  phone: "",
  category: contactCategories[0],
  message: "",
  consent: false,
};

const inputClass =
  "w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition placeholder:text-navy-900/40 focus:border-grass-400 focus:ring-2 focus:ring-grass-100";

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>(
    {},
  );
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = () => {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (fields.name.trim().length < 2)
      next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      next.email = "Please enter a valid email address.";
    if (fields.phone && !/^[0-9+()\s-]{7,}$/.test(fields.phone))
      next.phone = "Please enter a valid phone number.";
    if (fields.message.trim().length < 10)
      next.message = "Tell us a little more (at least 10 characters).";
    if (!fields.consent) next.consent = "Please accept the privacy policy.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSending(true);
    setFormError(null);
    try {
      await apiFetch<{ message: string }>("/contact", {
        method: "POST",
        body: {
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim() || undefined,
          subject: fields.category,
          message: fields.message.trim(),
        },
      });
      setSent(true);
      setFields(empty);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Couldn't send your message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="card-surface p-7 sm:p-8">
      <h2 className="font-display text-xl font-semibold text-navy-800">
        Send us a message
      </h2>
      <p className="mt-2 text-sm text-navy-900/60">
        We typically respond within one business day.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            className={inputClass}
            value={fields.name}
            onChange={(event) =>
              setFields({ ...fields, name: event.target.value })
            }
            placeholder="Ada Okonkwo"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            className={inputClass}
            value={fields.email}
            onChange={(event) =>
              setFields({ ...fields, email: event.target.value })
            }
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Phone number <span className="text-navy-900/40">(optional)</span>
          </label>
          <input
            id="phone"
            className={inputClass}
            value={fields.phone}
            onChange={(event) =>
              setFields({ ...fields, phone: event.target.value })
            }
            placeholder="+234 800 000 0000"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            className={inputClass}
            value={fields.category}
            onChange={(event) =>
              setFields({ ...fields, category: event.target.value })
            }
          >
            {contactCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-2 block text-sm font-medium">
            How can we help?
          </label>
          <textarea
            id="message"
            rows={5}
            className={inputClass}
            value={fields.message}
            onChange={(event) =>
              setFields({ ...fields, message: event.target.value })
            }
            placeholder="Tell us about your enquiry…"
            aria-invalid={Boolean(errors.message)}
          />
          {errors.message ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>
          ) : null}
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm text-navy-900/70">
        <input
          type="checkbox"
          checked={fields.consent}
          onChange={(event) =>
            setFields({ ...fields, consent: event.target.checked })
          }
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-navy-200 text-grass-500 focus:ring-grass-400"
        />
        I agree to the privacy policy and consent to being contacted about this
        enquiry.
      </label>
      {errors.consent ? (
        <p className="mt-1.5 text-xs text-red-600">{errors.consent}</p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="mt-7 w-full sm:w-auto"
        disabled={sending}
      >
        {sending ? "Sending…" : "Send message"}
      </Button>

      <p aria-live="polite" className="mt-4 text-sm text-grass-700">
        {sent
          ? "Thanks! Your message has been received — our team will get back to you shortly."
          : ""}
      </p>
      {formError ? (
        <p aria-live="polite" className="mt-2 text-sm text-red-600">
          {formError}
        </p>
      ) : null}
    </form>
  );
}
