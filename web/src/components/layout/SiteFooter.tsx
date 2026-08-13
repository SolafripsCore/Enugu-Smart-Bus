import Image from "next/image";
import Link from "next/link";

import { NewsletterForm } from "@/components/Newsletter";
import { Clock, Mail, MapPin, Phone } from "@/components/ui/Icons";
import { footerLinks, site, socials } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="container">
        <div className="grid gap-10 border-b border-white/10 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="heading-md text-white">
              Subscribe for news, tips and route updates
            </h2>
            <p className="mt-3 max-w-lg text-white/70">
              Be the first to hear about new routes, fare offers and service
              announcements across Enugu State.
            </p>
          </div>
          <div className="lg:justify-self-end">
            <NewsletterForm />
          </div>
        </div>

        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Image
              src="/images/brand/logo-full-light.webp"
              alt={site.name}
              width={960}
              height={406}
              className="h-14 w-auto"
            />
            <p className="mt-5 text-sm leading-relaxed text-white/70">
              {site.name} is an innovative public transport company under{" "}
              {site.operator}, delivering safe, cashless and smart mobility
              solutions across Enugu State — driving the Smart Enugu vision
              forward.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-grass-300">
              Quick links
            </h3>
            <ul className="mt-5 space-y-2.5 text-sm text-white/70">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-grass-300">
              Support & contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-grass-300" />
                <span>{site.address}</span>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-grass-300" />
                <a
                  className="transition hover:text-white"
                  href={site.phoneHref}
                >
                  {site.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-grass-300" />
                <span className="flex flex-col">
                  <a
                    className="transition hover:text-white"
                    href={`mailto:${site.emails.info}`}
                  >
                    {site.emails.info}
                  </a>
                  <a
                    className="transition hover:text-white"
                    href={`mailto:${site.emails.support}`}
                  >
                    {site.emails.support}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-grass-300" />
                <span>{site.hours}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-grass-300">
              Connect with us
            </h3>
            <p className="mt-5 text-sm text-white/70">
              Follow us for updates, route news and community highlights.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-white/70">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 transition hover:text-white"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                      <Image
                        src={social.icon}
                        alt=""
                        width={18}
                        height={18}
                        className="h-4 w-4 object-contain"
                      />
                    </span>
                    {social.handle}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-sm text-white/60 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            Powered by
            <Image
              src="/images/home/blue-noble-icon.webp"
              alt={site.operator}
              width={110}
              height={53}
              className="h-7 w-auto rounded bg-white/90 px-1.5 py-0.5"
            />
          </p>
        </div>
      </div>
    </footer>
  );
}
