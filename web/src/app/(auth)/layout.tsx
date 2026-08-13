import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { site } from "@/lib/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative isolate hidden overflow-hidden bg-navy-950 lg:block">
        <Image
          src="/images/forget-password/background.webp"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950/85 via-navy-950/60 to-navy-950/90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex">
            <Image
              src="/images/brand/logo-full-light.webp"
              alt={site.name}
              width={960}
              height={406}
              className="h-[72px] w-auto"
            />
          </Link>
          <div>
            <h2 className="heading-lg max-w-md">
              Smart. Safe. Seamless mobility for everyone in Enugu.
            </h2>
            <p className="mt-5 max-w-md text-white/70">
              One account gives you wallet top-ups, live bus tracking,
              tap-to-board payments and trip history across the entire ESB
              network.
            </p>
          </div>
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-3 lg:hidden"
          >
            <Image
              src="/images/brand/logo-full.webp"
              alt={site.name}
              width={960}
              height={406}
              className="h-11 w-auto"
            />
          </Link>
          {children}
          <p className="mt-10 text-center text-sm text-navy-900/50">
            <Link href="/" className="hover:text-navy-700">
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
