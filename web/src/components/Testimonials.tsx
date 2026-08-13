"use client";

import Image from "next/image";
import { useState } from "react";

import { ArrowRight, Star } from "@/components/ui/Icons";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
      <div className="card-surface relative overflow-hidden p-8 sm:p-10">
        <div className="flex gap-1 text-grass-500" aria-hidden>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-4 w-4" />
          ))}
        </div>
        <blockquote className="mt-6 font-display text-xl leading-relaxed text-navy-900 sm:text-2xl">
          “{testimonials[active].quote}”
        </blockquote>
        <div className="mt-8 flex items-center gap-4">
          <Image
            src={testimonials[active].image}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-navy-800">
              {testimonials[active].name}
            </p>
            <p className="text-sm text-navy-900/60">
              {testimonials[active].role}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.name}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show testimonial from ${testimonial.name}`}
              aria-current={index === active}
              className={[
                "h-2 rounded-full transition-all",
                index === active
                  ? "w-8 bg-grass-500"
                  : "w-2 bg-navy-200 hover:bg-navy-300",
              ].join(" ")}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setActive((value) => (value + 1) % testimonials.length)
            }
            className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-navy-700 transition hover:text-grass-600"
          >
            Next story
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul className="grid gap-4">
        {testimonials.map((testimonial, index) => (
          <li key={testimonial.name}>
            <button
              type="button"
              onClick={() => setActive(index)}
              className={[
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition",
                index === active
                  ? "border-grass-300 bg-grass-50"
                  : "border-navy-100 bg-white hover:border-navy-200",
              ].join(" ")}
            >
              <Image
                src={testimonial.image}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span>
                <span className="block font-semibold text-navy-800">
                  {testimonial.name}
                </span>
                <span className="block text-sm text-navy-900/60">
                  {testimonial.role}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
