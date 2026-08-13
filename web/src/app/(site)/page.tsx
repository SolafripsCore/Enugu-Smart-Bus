import Image from "next/image";
import Link from "next/link";

import { AppCta } from "@/components/AppCta";
import { LaunchStatusCard } from "@/components/LaunchStatusCard";
import { Testimonials } from "@/components/Testimonials";
import { ButtonLink } from "@/components/ui/Button";
import {
  ArrowRight,
  Bus,
  CreditCard,
  Leaf,
  Shield,
} from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { Section, SectionHeading } from "@/components/ui/Section";
import { formatDate, posts, rideSteps, stats } from "@/lib/site";

const highlights = [
  {
    icon: Bus,
    title: "Modern fleet",
    body: "Comfortable CNG and hybrid buses with trained, professional drivers.",
  },
  {
    icon: CreditCard,
    title: "Cashless fares",
    body: "Tap your ESB Smart Card or scan the app QR — no cash, no change.",
  },
  {
    icon: Shield,
    title: "Safety built in",
    body: "CCTV-enabled buses, monitored routes and 24/7 emergency support.",
  },
  {
    icon: Leaf,
    title: "Cleaner mobility",
    body: "Lower emissions and smarter routing for a greener Enugu State.",
  },
];

export default function HomePage() {
  const latest = posts.slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950">
        <Image
          src="/images/about/hero-banner.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/35" />
        <div className="container relative grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-grass-200 ring-1 ring-inset ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-grass-400" />A Smart
              Enugu Initiative
            </span>
            <h1 className="heading-xl mt-6 text-white">
              Smart, safe and seamless mobility across Enugu State
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Enugu Smart Bus combines eco-friendly buses, contactless fares,
              live tracking and AI-driven operations to move the city forward —
              one reliable trip at a time.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/signup" size="lg">
                Create your account
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="white" size="lg">
                See how it works
              </ButtonLink>
            </div>
            <LaunchStatusCard className="mt-10 max-w-md lg:hidden" />
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-white/60">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[2rem] bg-grass-500/15 blur-2xl" />
            <Image
              src="/images/home/hero-page-image-2.webp"
              alt="Passengers boarding an Enugu Smart Bus"
              width={610}
              height={407}
              priority
              className="relative w-full rounded-3xl border border-white/15 object-cover shadow-lift"
            />
            <LaunchStatusCard className="relative z-10 -mt-12 ml-6 mr-12" />
          </div>
        </div>
      </section>

      <Section className="bg-white">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => (
            <Reveal key={item.title} delay={index * 80}>
              <div className="card-surface h-full p-6 transition-transform duration-300 hover:-translate-y-1">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-grass-50 text-grass-600">
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-sand">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal className="relative">
            <Image
              src="/images/home/how-it-works-image.webp"
              alt="Enugu Smart Bus passenger tapping a smart card"
              width={464}
              height={570}
              className="w-full rounded-3xl object-cover shadow-card"
            />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading
              align="left"
              eyebrow="About Enugu Smart Bus"
              title="A modern transport system built for everyday life"
              description="Enugu Smart Bus combines comfort, safety and technology to transform the way people move across Enugu State. Our eco-friendly CNG and hybrid buses come with real-time GPS tracking, AI-powered route optimisation, onboard Wi-Fi, digital ticketing and intelligent safety systems."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Real-time bus tracking",
                "Smart card & wallet payments",
                "Onboard Wi-Fi & USB charging",
                "Accessible, inclusive design",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-medium text-navy-800 shadow-card"
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-grass-100 text-grass-700">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <ButtonLink href="/about" variant="secondary" className="mt-8">
              Read more about ESB
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow="How it works"
          title="Ride smart in a few simple steps"
          description="From sign-up to boarding, every step is designed to be quick, cashless and predictable."
        />
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rideSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70}>
              <li className="card-surface group relative h-full overflow-hidden p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-bold text-navy-50 transition group-hover:text-grass-100">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Image
                  src={step.icon}
                  alt=""
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                />
                <h3 className="mt-5 font-display text-lg font-semibold text-navy-800">
                  {step.title}
                </h3>
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
        <div className="mt-12 flex justify-center">
          <ButtonLink href="/how-it-works" variant="ghost">
            Full step-by-step guide
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Section>

      <AppCta />

      <Section className="bg-sand">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            align="left"
            eyebrow="News & updates"
            title="The latest from Enugu Smart Bus"
          />
          <ButtonLink href="/blog" variant="ghost" className="shrink-0">
            View all posts
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {latest.map((post, index) => (
            <Reveal key={post.slug} delay={index * 80}>
              <article className="card-surface group flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={post.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-grass-600">
                    {post.category} · {post.readingTime}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-navy-800">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-900/70">
                    {post.excerpt}
                  </p>
                  <p className="mt-5 text-xs text-navy-900/50">
                    {formatDate(post.date)}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-white">
        <SectionHeading
          eyebrow="Testimonials"
          title="What people across Enugu are saying"
          description="Riders, students and businesses on what smarter public transport means for them."
        />
        <div className="mt-14">
          <Testimonials />
        </div>
      </Section>
    </>
  );
}
