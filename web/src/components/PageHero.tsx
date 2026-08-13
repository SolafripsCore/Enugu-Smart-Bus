import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Section";

export function PageHero({
  eyebrow,
  title,
  description,
  image = "/images/about/hero-banner.webp",
  breadcrumb,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-900/85 to-navy-900/40" />
      <div className="container relative py-16 sm:py-20 lg:py-28">
        <div className="max-w-3xl">
          {breadcrumb ? (
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                {breadcrumb.map((crumb, index) => (
                  <li key={crumb.label} className="flex items-center gap-2">
                    {crumb.href ? (
                      <Link
                        href={crumb.href}
                        className="inline-flex min-h-9 items-center hover:text-white"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-white/80">{crumb.label}</span>
                    )}
                    {index < breadcrumb.length - 1 ? <span>/</span> : null}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {eyebrow ? <Eyebrow tone="dark">{eyebrow}</Eyebrow> : null}
          <h1 className="heading-xl mt-5 text-white">{title}</h1>
          {description ? (
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              {description}
            </p>
          ) : null}
          {actions ? (
            <div className="mt-8 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
