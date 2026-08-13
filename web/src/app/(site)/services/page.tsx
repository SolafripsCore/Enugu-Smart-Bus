import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";

import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import {
  Accessibility,
  ArrowRight,
  Building,
  Bus,
  Chat,
  Check,
  CreditCard,
  MapPin,
  Megaphone,
  Shield,
  Smartphone,
} from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { roadmap, services } from "@/lib/site";

const serviceIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  bus: Bus,
  card: CreditCard,
  app: Smartphone,
  tracking: MapPin,
  security: Shield,
  accessibility: Accessibility,
  support: Chat,
  corporate: Building,
  ads: Megaphone,
};

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "City bus services, smart card and wallet payments, real-time tracking, safety, accessibility, corporate programmes and advertising with Enugu Smart Bus.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Smart, safe and seamless mobility for everyone"
        description="From daily city routes to corporate shuttles and advertising partnerships, here is everything Enugu Smart Bus delivers."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <Section className="bg-white">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = serviceIcons[service.icon] ?? Bus;
            return (
              <Reveal key={service.title} delay={index * 60}>
                <article className="card-surface h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-grass-50 text-grass-600">
                    <Icon className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 font-display text-lg font-semibold text-navy-800">
                    {service.title}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-3 text-sm leading-relaxed text-navy-900/70"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                          <Check className="h-3 w-3" />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Roadmap"
              title="What's next for the network"
              description="Our service plan keeps expanding as ridership grows across Enugu State."
            />
            <ul className="mt-8 space-y-4">
              {roadmap.map((item, index) => (
                <li
                  key={item}
                  className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-card"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-navy-800">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-3xl bg-navy-900 p-8 text-white sm:p-10">
              <h3 className="font-display text-2xl font-semibold">
                Get the app and start riding
              </h3>
              <ol className="mt-6 space-y-3 text-white/75">
                {[
                  "Create your account",
                  "Fund your ESB Wallet",
                  "Track your bus in real time",
                  "Tap your card or QR to board",
                ].map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-grass-200">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/signup">Create account</ButtonLink>
                <ButtonLink href="/download" variant="white">
                  Download app
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
