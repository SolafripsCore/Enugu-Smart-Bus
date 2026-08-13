import Link from "next/link";

import { ArrowRight, Bus, Check, Route } from "@/components/ui/Icons";

const milestones = [
  { label: "Fleet and depot preparation", done: true },
  { label: "Route planning across Enugu metro", done: true },
  { label: "Smart card, app and wallet rollout", done: false },
];

const completed = milestones.filter((milestone) => milestone.done).length;
const progress = Math.round((completed / milestones.length) * 100);

export function LaunchStatusCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-white/70 bg-white/95 p-5 shadow-lift backdrop-blur",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-grass-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-grass-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grass-500/70 motion-reduce:hidden" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-grass-500" />
          </span>
          Launching soon
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-navy-900/50">
          <Route className="h-4 w-4" />
          Enugu State
        </span>
      </div>

      <p className="mt-3 font-display text-base font-bold leading-snug text-navy-900">
        Getting ready to move Enugu — smarter, safer, cashless
      </p>

      <ul className="mt-4 space-y-2">
        {milestones.map((milestone) => (
          <li
            key={milestone.label}
            className="flex items-center gap-2.5 text-xs text-navy-900/70"
          >
            <span
              className={[
                "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                milestone.done
                  ? "bg-grass-500 text-white"
                  : "bg-navy-50 text-navy-900/40 ring-1 ring-inset ring-navy-100",
              ].join(" ")}
            >
              {milestone.done ? (
                <Check className="h-3 w-3" />
              ) : (
                <Bus className="h-3 w-3" />
              )}
            </span>
            {milestone.label}
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-navy-50"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Launch readiness"
        >
          <span
            className="block h-full rounded-full bg-gradient-to-r from-navy-700 to-grass-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-navy-900/50">
          <span>Launch readiness</span>
          <span className="font-semibold text-navy-800">{progress}%</span>
        </div>
      </div>

      <Link
        href="/signup"
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-navy-800 transition-colors hover:text-grass-600"
      >
        Register to ride first
        <ArrowRight className="h-4 w-4" />
      </Link>

      <p className="mt-3 border-t border-navy-50 pt-3 text-[11px] text-navy-900/50">
        Operated by Blue Noble Motors Limited
      </p>
    </div>
  );
}
