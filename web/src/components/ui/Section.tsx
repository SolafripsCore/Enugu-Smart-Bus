import type { ReactNode } from "react";

export function Eyebrow({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
        tone === "light"
          ? "bg-grass-50 text-grass-700"
          : "bg-white/10 text-grass-200 ring-1 ring-inset ring-white/15",
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-grass-500" />
      {children}
    </span>
  );
}

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={[
        "flex flex-col gap-4",
        align === "center"
          ? "mx-auto max-w-3xl items-center text-center"
          : "items-start",
      ].join(" ")}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`heading-lg ${tone === "dark" ? "text-white" : "text-navy-900"}`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={
            tone === "dark"
              ? "text-base leading-relaxed text-white/70 sm:text-lg"
              : "body-lg"
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
