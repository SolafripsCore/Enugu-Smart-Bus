import type { Metadata } from "next";
import Image from "next/image";

import { AppCta } from "@/components/AppCta";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Download Our App",
  description:
    "Download the Enugu Smart Bus app for Android and iOS: register, fund your wallet, track buses live and pay with a tap.",
};

const appFeatures = [
  {
    title: "Plan your trip",
    body: "Search routes, see stops and get accurate arrival times before you leave home.",
  },
  {
    title: "Pay your way",
    body: "Fund your ESB Wallet by card, bank transfer, USSD or voucher, then tap or scan to board.",
  },
  {
    title: "Stay informed",
    body: "Push alerts for delays, diversions and safety updates on the routes you ride.",
  },
  {
    title: "Manage everything",
    body: "Trip history, receipts, concession applications and lost-and-found in one place.",
  },
];

export default function DownloadPage() {
  return (
    <>
      <PageHero
        eyebrow="Mobile app"
        title="Download the Enugu Smart Bus app"
        description="Your all-in-one platform for smart, safe and cashless travel across Enugu State — available on Android and iOS."
        image="/images/home/how-it-works-background-image.webp"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Download app" }]}
      />

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Why the app"
          title="Everything you need for a smarter commute"
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {appFeatures.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 70}>
              <div className="card-surface h-full p-6">
                <span className="font-display text-3xl font-bold text-navy-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-navy-800">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <AppCta />

      <Section className="bg-sand">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Image
              src="/images/home/get-smart-card.webp"
              alt="Getting an ESB smart card"
              width={594}
              height={290}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              align="left"
              eyebrow="No smartphone?"
              title="The ESB Smart Card works on its own"
              description="Collect a physical Smart Card at any ESB station counter or authorised partner outlet, top it up with cash or transfer, and tap to board — no app required."
            />
          </Reveal>
        </div>
      </Section>
    </>
  );
}
