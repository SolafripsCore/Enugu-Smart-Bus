import type { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { objectives, site, smartFeatures } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Enugu Smart Bus",
  description:
    "A new era of smart mobility in Enugu State: our mission, vision, core objectives and the technology behind the Enugu Smart Bus network.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About ESB"
        title="A new era of smart mobility in Enugu State"
        description="Enugu Smart Bus is a groundbreaking public transport initiative built to make everyday travel safer, cleaner and more predictable for every citizen."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "About ESB" }]}
      />

      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Who we are"
              title="Public transport, reimagined for a smart city"
              description="Enugu Smart Bus is designed to transform urban mobility across Enugu State and is a major step toward the State Government's vision of a Smart, Safe and Sustainable Enugu, where technology improves everyday living and connectivity."
            />
            <p className="mt-5 text-navy-900/70">
              Developed and operated under {site.operator}, the project
              introduces an innovative, eco-friendly and cashless transportation
              system that combines efficiency, comfort and convenience for every
              resident.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <Image
              src="/images/about/blue-bus.webp"
              alt="Enugu Smart Bus fleet"
              width={1400}
              height={1001}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card-surface h-full p-8">
              <h3 className="font-display text-xl font-semibold text-navy-800">
                Our mission
              </h3>
              <p className="mt-4 leading-relaxed text-navy-900/70">
                To build a world-class smart mobility system that delivers safe,
                affordable and efficient transportation for all residents of
                Enugu State, while driving sustainable economic growth and
                technological advancement.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl bg-navy-900 p-8 text-white shadow-card">
              <h3 className="font-display text-xl font-semibold">Our vision</h3>
              <p className="mt-4 leading-relaxed text-white/75">
                To redefine the public transport experience through digital
                innovation, environmental responsibility and citizen-centred
                service delivery — setting a new benchmark for modern urban
                mobility in Nigeria.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14">
          <SectionHeading
            align="left"
            eyebrow="Core objectives"
            title="What we are working towards"
          />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {objectives.map((objective, index) => (
              <Reveal key={objective} delay={index * 60}>
                <li className="flex h-full items-start gap-3 rounded-2xl bg-white p-5 shadow-card">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grass-100 text-grass-700">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm leading-relaxed text-navy-900/75">
                    {objective}
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Image
              src="/images/about/features.webp"
              alt="Smart features of the Enugu Smart Bus"
              width={1400}
              height={1495}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              align="left"
              eyebrow="Smart features"
              title="Technology that makes every trip better"
            />
            <ul className="mt-8 space-y-4">
              {smartFeatures.map((feature, index) => (
                <li
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-navy-100 p-5"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-semibold text-white">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-800">
                      {feature.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-navy-900/70">
                      {feature.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Operator"
              title={`Powered by ${site.operator}`}
              description="Enugu Smart Bus is operated by Blue Noble Motors Limited, a subsidiary of Blue Noble Limited — a leading African transport and infrastructure consulting company with expertise in smart mobility, engineering and sustainable transport planning."
            />
            <ButtonLink href="/blue-noble" variant="secondary" className="mt-8">
              About Blue Noble Motors
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
          <Reveal delay={100}>
            <Image
              src="/images/about/powered.webp"
              alt="Blue Noble Motors Limited"
              width={1400}
              height={1556}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
        </div>
      </Section>

      <section className="bg-navy-900 py-16 sm:py-20">
        <div className="container grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="heading-lg text-white">
              Driving the Smart Enugu vision
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-white/70">
              The Smart Bus project is a flagship component of the Smart Enugu
              Initiative, championed by the Enugu State Government under the
              leadership of His Excellency, Dr. Peter Ndubuisi Mbah. By
              digitising transport operations and promoting cleaner mobility,
              the initiative positions Enugu as one of Nigeria&apos;s leading
              smart cities.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <ButtonLink href="/services" size="lg">
              Explore our services
            </ButtonLink>
            <ButtonLink href="/contact" variant="white" size="lg">
              Talk to us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
