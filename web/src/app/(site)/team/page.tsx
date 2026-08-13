import type { Metadata } from "next";
import Image from "next/image";

import { PageHero } from "@/components/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { team } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Leadership Team",
  description:
    "Meet the leadership team driving Enugu Smart Bus — expertise across transport engineering, digital systems, business management and public service delivery.",
};

export default function TeamPage() {
  const [lead, ...members] = team;

  return (
    <>
      <PageHero
        eyebrow="Our team"
        title="Leadership that drives innovation"
        description="Behind Enugu Smart Bus is a team of professionals dedicated to transforming Enugu's public transport sector through innovation, technology and service excellence."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Our Team" }]}
      />

      <Section className="bg-white">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Leadership"
              title="Experience across mobility, technology and public service"
              description="Our leadership brings together expertise in transport engineering, digital systems, business management and public service delivery — all working in alignment with the Smart Enugu vision."
            />
            <ButtonLink href="/contact" variant="secondary" className="mt-8">
              Work with our team
            </ButtonLink>
          </Reveal>
          <Reveal delay={100}>
            <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-lift">
              <Image
                src={lead.image}
                alt={lead.name}
                width={700}
                height={522}
                className="aspect-[4/5] w-full object-cover"
              />
              <figcaption className="border-t border-navy-100/70 p-6">
                <p className="font-display text-lg font-semibold text-navy-800">
                  {lead.name}
                </p>
                <p className="mt-1 text-sm text-navy-900/60">{lead.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-sand">
        <SectionHeading
          eyebrow="Management"
          title="The people behind every trip"
        />
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member, index) => (
            <Reveal key={member.image} delay={index * 60}>
              <li className="h-full overflow-hidden rounded-2xl bg-white shadow-card transition-transform duration-300 hover:-translate-y-1">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={592}
                  height={508}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="border-t border-navy-100/70 p-5">
                  <p className="font-display text-base font-semibold text-navy-800">
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm text-navy-900/60">{member.role}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  );
}
