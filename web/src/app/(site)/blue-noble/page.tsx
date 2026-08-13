import type { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { principles } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Blue Noble Motors Limited",
  description:
    "Blue Noble Motors Limited is the operator and systems integrator behind Enugu Smart Bus, delivering fleet operations, safety standards and smart fare collection.",
};

export default function BlueNoblePage() {
  return (
    <>
      <PageHero
        eyebrow="About BNML"
        title="Blue Noble Motors Limited"
        description="The operator and systems integrator behind Enugu Smart Bus — combining transport consulting, engineering and technology to modernise urban mobility in Africa."
        image="/images/blue/section-1.webp"
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About BNML" }]}
      />

      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Who we are"
              title="An African multinational in transport consulting"
              description="Blue Noble Ltd provides transport consulting across Africa and has set track records including the initiation and implementation of the Transport Master Plan for a State Government in Nigeria."
            />
            <p className="mt-5 leading-relaxed text-navy-900/70">
              The Chief Executive Officer, Reverend Doctor Engineer Nnamdi
              Obiakalusi, collaborates with the Austrian multinational Alpine
              Technologies Ltd, which specialises in business development,
              infrastructure consultancy and project financing.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Image
              src="/images/blue/section-2.webp"
              alt="Blue Noble Motors operations"
              width={1400}
              height={1025}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Image
              src="/images/blue/section-3.webp"
              alt="Fleet operations and maintenance"
              width={1400}
              height={1250}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              align="left"
              eyebrow="Our role"
              title="Operator and systems integrator for ESB"
              description="We coordinate fleet operations, driver training, preventive maintenance, safety standards and customer experience — and we integrate Automatic Fare Collection (AFC), real-time tracking and data-driven service management to keep the network running smoothly."
            />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Our principles"
          title="How we run the network"
        />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {principles.map((principle, index) => (
            <Reveal key={principle.title} delay={index * 70}>
              <li className="card-surface h-full p-6">
                <span className="font-display text-3xl font-bold text-navy-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold text-navy-800">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                  {principle.body}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section className="bg-navy-900">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Image
              src="/images/blue/section-5.webp"
              alt="Leadership at Blue Noble Motors Limited"
              width={1400}
              height={1400}
              className="w-full rounded-3xl object-cover"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              align="left"
              tone="dark"
              eyebrow="Leadership"
              title="Rev. Dr. Engr. Nnamdi Obiakalusi"
              description="Chief Executive Officer"
            />
            <p className="mt-5 leading-relaxed text-white/70">
              A transport engineer and mobility strategist, Dr. Obiakalusi leads
              Blue Noble Motors Limited with a clear mission: to modernise urban
              mobility through innovation, service excellence and partnerships
              that improve people&apos;s daily lives.
            </p>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
