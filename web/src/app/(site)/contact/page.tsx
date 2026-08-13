import type { Metadata } from "next";

import { Accordion } from "@/components/Accordion";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/PageHero";
import { Clock, Mail, MapPin, Phone } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { faqs, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Questions, feedback or partnership enquiries? Reach the Enugu Smart Bus team by phone, email or the contact form — we respond promptly.",
};

const channels = [
  {
    title: "Customer support",
    icon: Phone,
    lines: [
      { label: site.emails.support, href: `mailto:${site.emails.support}` },
      { label: site.phone, href: site.phoneHref },
      { label: site.hours },
    ],
  },
  {
    title: "Partnership & media",
    icon: Mail,
    lines: [
      {
        label: site.emails.partnerships,
        href: `mailto:${site.emails.partnerships}`,
      },
      { label: site.emails.media, href: `mailto:${site.emails.media}` },
    ],
  },
  {
    title: "Head office",
    icon: MapPin,
    lines: [{ label: site.address }],
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We're here to help"
        description="Questions, feedback or partnership enquiries? Reach out and our team will respond promptly."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />

      <Section className="bg-white">
        <div className="grid gap-6 md:grid-cols-3">
          {channels.map((channel, index) => (
            <Reveal key={channel.title} delay={index * 70}>
              <div className="card-surface h-full p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-grass-50 text-grass-600">
                  <channel.icon className="h-6 w-6" />
                </span>
                <h2 className="mt-5 font-display text-lg font-semibold text-navy-800">
                  {channel.title}
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-navy-900/70">
                  {channel.lines.map((line) => (
                    <li key={line.label}>
                      {"href" in line && line.href ? (
                        <a
                          href={line.href}
                          className="inline-flex min-h-11 items-center transition hover:text-grass-700"
                        >
                          {line.label}
                        </a>
                      ) : (
                        line.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <ContactForm />
          </Reveal>
          <Reveal delay={100}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="Quick answers"
                title="Frequently asked questions"
              />
              <div className="mt-8">
                <Accordion items={faqs} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-navy-900 p-6 text-sm text-white/75">
                  <p className="flex items-center gap-2 font-semibold text-white">
                    <Clock className="h-4 w-4 text-grass-300" />
                    Billing or refunds
                  </p>
                  <p className="mt-2">
                    Go to Help → Billing &amp; Refunds in the app, or email{" "}
                    {site.emails.support}.
                  </p>
                </div>
                <div className="rounded-2xl border border-navy-100 bg-white p-6 text-sm text-navy-900/70">
                  <p className="font-semibold text-navy-800">Lost an item?</p>
                  <p className="mt-2">
                    Open the app → Help → Lost &amp; Found and select your trip.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
