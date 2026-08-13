"use client";

import { useState } from "react";

import { Minus, Plus } from "@/components/ui/Icons";

export function Accordion({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="divide-y divide-navy-100 overflow-hidden rounded-2xl border border-navy-100 bg-white">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <li key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : index)}
                aria-expanded={expanded}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              >
                <span className="font-medium text-navy-800">
                  {item.question}
                </span>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-navy-700">
                  {expanded ? (
                    <Minus className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </span>
              </button>
            </h3>
            <div
              className={[
                "grid transition-all duration-300",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ].join(" ")}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-sm leading-relaxed text-navy-900/70">
                  {item.answer}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
