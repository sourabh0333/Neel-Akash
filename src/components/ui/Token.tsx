"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * Form controls that sit *inside* a sentence rather than in a stacked list of
 * boxes. Each one measures its own content and resizes to it, so the sentence
 * reflows naturally as the guest fills it in.
 *
 * They are ordinary inputs and selects underneath — labelled, focusable and
 * keyboard-operable — only the chrome is unusual.
 */

const tokenBase =
  "bg-transparent text-ember-300 outline-none border-b border-dashed border-ember-500/50 " +
  "focus:border-ember-300 focus:border-solid transition-colors duration-300 " +
  "hover:border-ember-400 caret-ember-300";

export function TokenInput({
  value,
  onChange,
  label,
  placeholder = "",
  type = "text",
  min,
  max,
  minWidth = 40,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  min?: number;
  max?: number;
  minWidth?: number;
}) {
  const id = useId();
  const ghost = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState(minWidth);

  // Measure the rendered text and match the input to it.
  useEffect(() => {
    const g = ghost.current;
    if (!g) return;
    setW(Math.max(minWidth, g.offsetWidth + 6));
  }, [value, placeholder, minWidth]);

  return (
    <span className="relative inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        ref={ghost}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      >
        {value || placeholder}
      </span>
      <input
        id={id}
        type={type}
        inputMode={type === "number" ? "numeric" : undefined}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: w }}
        className={`${tokenBase} placeholder:text-ember-500/45 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
    </span>
  );
}

export function TokenSelect({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
}) {
  const id = useId();
  const ghost = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState(80);

  useEffect(() => {
    const g = ghost.current;
    if (!g) return;
    // Room for the caret glyph.
    setW(g.offsetWidth + 22);
  }, [value]);

  return (
    <span className="relative inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span
        ref={ghost}
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-0 top-0 whitespace-pre"
      >
        {value}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: w }}
        className={`${tokenBase} cursor-pointer appearance-none pr-5 [&>option]:bg-ink [&>option]:text-bone`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[0.5em] text-ember-500"
      >
        &#9660;
      </span>
    </span>
  );
}

export function TokenDate({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const id = useId();
  return (
    <span className="relative inline-block align-baseline">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${tokenBase} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
      />
    </span>
  );
}

/** Non-interactive connective tissue in the sentence. */
export function Word({ children }: { children: ReactNode }) {
  return <span className="text-bone">{children}</span>;
}
