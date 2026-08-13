"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronDown, Close, Menu, Phone } from "@/components/ui/Icons";
import { navigation, site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenGroup(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (item: (typeof navigation)[number]) => {
    if (item.href === "/") return pathname === "/";
    if (pathname.startsWith(item.href)) return true;
    return Boolean(item.children?.some((child) => pathname === child.href));
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-navy-900 text-white/80 lg:block">
        <div className="container flex h-10 items-center justify-between text-xs">
          <p>Smart. Safe. Seamless mobility for everyone in Enugu State.</p>
          <div className="flex items-center gap-6">
            <a
              className="inline-flex items-center gap-2 transition hover:text-white"
              href={site.phoneHref}
            >
              <Phone className="h-4 w-4" />
              {site.phone}
            </a>
            <a
              className="transition hover:text-white"
              href={`mailto:${site.emails.support}`}
            >
              {site.emails.support}
            </a>
          </div>
        </div>
      </div>

      <div
        className={[
          "border-b transition-all duration-300",
          scrolled
            ? "border-navy-100 bg-white/90 shadow-[0_10px_30px_-24px_rgba(10,16,48,0.6)] backdrop-blur-md"
            : "border-transparent bg-white",
        ].join(" ")}
      >
        <div className="container flex h-[72px] items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label={`${site.name} home`}
          >
            <Image
              src="/images/brand/logo-mark.webp"
              alt=""
              width={512}
              height={476}
              priority
              className="h-12 w-auto"
            />
            <span className="hidden font-display text-lg font-bold leading-none text-navy-700 sm:block">
              Enugu
              <span className="mt-1 block text-[15px] font-bold leading-none text-grass-600">
                Smart Bus
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navigation.map((item) => (
                <li key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    aria-current={isActive(item) ? "page" : undefined}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition",
                      isActive(item)
                        ? "bg-navy-50 text-navy-700"
                        : "text-navy-900/70 hover:bg-navy-50 hover:text-navy-700",
                    ].join(" ")}
                  >
                    {item.label}
                    {item.children ? (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" />
                    ) : null}
                  </Link>

                  {item.children ? (
                    <div className="invisible absolute left-0 top-full w-[280px] translate-y-2 pt-3 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <ul className="card-surface overflow-hidden p-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block rounded-xl px-3 py-2.5 transition hover:bg-navy-50"
                            >
                              <span className="block text-sm font-semibold text-navy-700">
                                {child.label}
                              </span>
                              {child.description ? (
                                <span className="mt-0.5 block text-xs text-navy-900/60">
                                  {child.description}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <ButtonLink href="/account" size="sm">
                My account
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/login" variant="ghost" size="sm">
                  Log in
                </ButtonLink>
                <ButtonLink href="/signup" size="sm">
                  Register
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-100 text-navy-700 lg:hidden"
          >
            {open ? (
              <Close className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={[
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 bg-navy-950/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <div
          className={[
            "absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-lift transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
            <span className="font-display font-semibold text-navy-700">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 text-navy-700"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setOpenGroup((value) =>
                            value === item.label ? null : item.label,
                          )
                        }
                        aria-expanded={openGroup === item.label}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-base font-medium text-navy-800"
                      >
                        {item.label}
                        <ChevronDown
                          className={[
                            "h-4 w-4 transition-transform",
                            openGroup === item.label ? "rotate-180" : "",
                          ].join(" ")}
                        />
                      </button>
                      {openGroup === item.label ? (
                        <ul className="ml-3 border-l border-navy-100 pl-3">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                className="block rounded-lg px-3 py-2.5 text-sm text-navy-900/70"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className="block rounded-xl px-3 py-3 text-base font-medium text-navy-800"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-navy-100 px-5 py-5">
            {user ? (
              <ButtonLink href="/account" className="w-full">
                My account
              </ButtonLink>
            ) : (
              <ButtonLink href="/signup" className="w-full">
                Register / Sign up
              </ButtonLink>
            )}
            <ButtonLink href="/download" variant="ghost" className="w-full">
              Download our app
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
