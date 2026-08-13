import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/ui/Reveal";

const badges = [
  {
    href: "https://play.google.com/store",
    src: "/images/home/google-play-badge.webp",
    alt: "Get it on Google Play",
    width: 134,
    height: 40,
  },
  {
    href: "https://www.apple.com/app-store/",
    src: "/images/home/app-store-badge.webp",
    alt: "Download on the App Store",
    width: 119,
    height: 40,
  },
];

export function AppCta() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 py-16 sm:py-20">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid-navy opacity-60 [background-size:56px_56px]"
      />
      <div
        aria-hidden
        className="absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-grass-500/20 blur-3xl"
      />
      <div className="container relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-grass-200">
            Mobile app
          </p>
          <h2 className="heading-lg mt-5 text-white">
            Your whole journey, in one app
          </h2>
          <p className="mt-4 max-w-xl text-white/70">
            Register, fund your wallet, track buses in real time and pay with a
            tap. The Enugu Smart Bus app is your all-in-one platform for smart,
            safe and cashless travel.
          </p>
          <ul className="mt-7 grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            {[
              "Live bus tracking and ETAs",
              "Instant wallet top-ups",
              "QR and smart card boarding",
              "Trip history and receipts",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-grass-500/20 text-grass-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {badges.map((badge) => (
              <Link
                key={badge.alt}
                href={badge.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:opacity-80"
              >
                <Image
                  src={badge.src}
                  alt={badge.alt}
                  width={badge.width}
                  height={badge.height}
                  className="h-11 w-auto"
                />
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto max-w-sm">
          <div className="absolute inset-x-8 bottom-6 top-10 rounded-[2.5rem] bg-grass-500/25 blur-2xl" />
          <Image
            src="/images/download-our-app/phones-hero.webp"
            alt="Enugu Smart Bus mobile app screens"
            width={408}
            height={612}
            className="relative w-full drop-shadow-2xl"
          />
        </Reveal>
      </div>
    </section>
  );
}
