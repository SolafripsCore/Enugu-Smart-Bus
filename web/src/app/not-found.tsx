import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-950 px-5 text-center text-white">
      <p className="font-display text-6xl font-bold text-grass-400">404</p>
      <h1 className="heading-lg mt-4">This stop isn&apos;t on our route</h1>
      <p className="mt-4 max-w-md text-white/70">
        The page you are looking for may have moved. Head back to the homepage
        or explore how Enugu Smart Bus works.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("primary", "lg")}>
          Back to home
        </Link>
        <Link href="/how-it-works" className={buttonClass("white", "lg")}>
          How it works
        </Link>
      </div>
    </div>
  );
}
