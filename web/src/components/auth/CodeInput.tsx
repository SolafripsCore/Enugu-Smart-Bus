"use client";

import {
  useEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

/** Segmented numeric entry used for the SMS code and the 4-digit PIN. */
export function CodeInput({
  id,
  length,
  value,
  onChange,
  onComplete,
  secure = false,
  autoFocus = false,
  disabled = false,
  label,
  invalid = false,
}: {
  id: string;
  length: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  secure?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  label: string;
  invalid?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const commit = (next: string) => {
    const digits = next.replace(/\D/g, "").slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
    return digits;
  };

  const handleInput = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      commit(value.slice(0, index));
      return;
    }
    const next = (
      value.slice(0, index) +
      digits +
      value.slice(index + digits.length)
    ).slice(0, length);
    const committed = commit(next);
    const focus = Math.min(index + digits.length, length - 1);
    if (committed.length > index) refs.current[focus]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      event.preventDefault();
      commit(value.slice(0, index - 1));
      refs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0)
      refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < length - 1)
      refs.current[index + 1]?.focus();
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = commit(event.clipboardData.getData("text"));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-2 sm:gap-3"
      data-testid={id}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          type={secure ? "password" : "text"}
          inputMode="numeric"
          autoComplete={secure ? "off" : "one-time-code"}
          aria-label={`${label} digit ${index + 1}`}
          aria-invalid={invalid}
          maxLength={length}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={[
            "h-14 w-full min-w-0 rounded-xl border bg-white text-center font-display text-xl font-bold text-navy-900 outline-none transition",
            "focus:border-grass-400 focus:ring-2 focus:ring-grass-100 disabled:opacity-60",
            invalid ? "border-red-300" : "border-navy-100",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
