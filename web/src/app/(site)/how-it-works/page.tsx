import type { Metadata } from "next";
import Image from "next/image";

import { AppCta } from "@/components/AppCta";
import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { rideSteps } from "@/lib/site";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Register, fund your ESB wallet, track your bus in real time, tap to pay and ride — a step-by-step guide to travelling with Enugu Smart Bus.",
};

const infoCards = [
  {
    title: "What you need",
    icon: "/images/how-it-works/what-you-need-icon.webp",
    items: [
      "A phone number and email address to sign up",
      "The Enugu Smart Bus app for Android or iOS",
      "Funds in your ESB Wallet or a linked Smart Card",
    ],
  },
  {
    title: "Payment options",
    icon: "/images/how-it-works/wallet-icon.webp",
    items: [
      "ESB Wallet (in-app balance)",
      "ESB Smart Card (contactless tap)",
      "Top-ups by card, bank transfer, USSD or voucher",
    ],
  },
  {
    title: "Tickets & discounts",
    icon: "/images/how-it-works/card-icon.webp",
    items: [
      "Standard fares calculated by distance and zone",
      "Concessions for students, elderly riders and persons with disabilities",
      "Apply in the app under Profile → Concessions",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Ride smart in six simple steps"
        description="From creating your account to rating your trip, here is exactly how travelling with Enugu Smart Bus works."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "How it works" }]}
        actions={
          <>
            <ButtonLink href="/signup" size="lg">
              Create your account
            </ButtonLink>
            <ButtonLink href="/download" variant="white" size="lg">
              Get the app
            </ButtonLink>
          </>
        }
      />

      <Section className="bg-white">
        <ol className="relative grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rideSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="card-surface relative h-full p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-900 font-display text-lg font-bold text-white">
                  {index + 1}
                </span>
                <Image
                  src={step.icon}
                  alt=""
                  width={44}
                  height={44}
                  className="absolute right-6 top-6 h-10 w-10 object-contain opacity-80"
                />
                <h2 className="mt-6 font-display text-lg font-semibold text-navy-800">
                  {step.title}
                </h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-grass-600">
                  {step.duration}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy-900/70">
                  {step.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section className="bg-sand">
        <SectionHeading
          eyebrow="Before you ride"
          title="Everything you need to know"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {infoCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 80}>
              <div className="card-surface h-full p-7">
                <Image
                  src={card.icon}
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                />
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">
                  {card.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {card.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm text-navy-900/70"
                    >
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-grass-100 text-grass-700">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-white">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-navy-900 p-8 text-white">
            <h3 className="font-display text-xl font-semibold">
              Safety & accessibility
            </h3>
            <p className="mt-4 leading-relaxed text-white/70">
              Every bus is CCTV-enabled with monitored routes, trained drivers
              and emergency hotlines. Priority seating, boarding assistance and
              low-floor access are available on designated routes.
            </p>
          </div>
          <div className="rounded-2xl border border-navy-100 p-8">
            <h3 className="font-display text-xl font-semibold text-navy-800">
              Lost something on board?
            </h3>
            <p className="mt-4 leading-relaxed text-navy-900/70">
              Open the app, go to Help → Lost &amp; Found and select your trip.
              Items are matched to your journey and held at the nearest terminal
              for collection.
            </p>
            <ButtonLink href="/contact" variant="ghost" className="mt-6">
              Contact support
            </ButtonLink>
          </div>
        </div>
      </Section>

      <AppCta />
    </>
  );
}
