"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { navLinks, pages, site } from "@/lib/site";
import Magnetic from "./ui/Magnetic";

/** One line for each page in the menu, so the way back reads as a choice. */
const ABOUT: Record<string, string> = {
  "/island": "Four villages and one long beach",
  "/stays": "Tents, cottages and the group special",
  "/menu": "Every meal of the day, cooked here",
  "/gallery": "The island in pictures",
  "/days-here": "Sunrise to bonfire, hour by hour",
  "/getting-here": "A train, a van and a boat",
  "/contact": "Book with one WhatsApp message",
};

/** Edit distance, for "did you mean" on a mistyped address. */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
  }
  return row[b.length];
}

/**
 * The 404. A giant "404" with the bay inside it — a dusk sky in the top half
 * of the digits, the sea rolling through the bottom half with its waterline
 * gently rising and falling — that leans toward the pointer. Under it, the
 * address that wasn't found, the nearest real page if the address looks like
 * a typo, and every page in the menu as a way back.
 */
export default function NotFound() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [guess, setGuess] = useState<{ href: string; label: string } | null>(null);

  // Suggest the closest real page, but only when it's plausibly a typo.
  useEffect(() => {
    const tried = pathname.toLowerCase().replace(/\/+$/, "");
    let best: { href: string; label: string; d: number } | null = null;
    for (const p of pages) {
      const d = distance(tried, p.href);
      if (!best || d < best.d) best = { ...p, d };
    }
    if (best && best.d > 0 && best.d <= Math.max(3, Math.floor(best.href.length / 3))) {
      setGuess({ href: best.href, label: best.label });
    }
  }, [pathname]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(".nf-digits", { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.4 })
        .fromTo(".nf-in", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0.5)
        .fromTo(".nf-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.05 }, 0.8);

      // The waterline rises and falls.
      gsap.to(".nf-sea", { y: -14, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });

      // The digits lean toward the pointer (desktop only).
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const rx = gsap.quickTo(stage.current, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(stage.current, "rotationY", { duration: 0.8, ease: "power3" });
      const onMove = (e: PointerEvent) => {
        rx((e.clientY / window.innerHeight - 0.5) * -10);
        ry((e.clientX / window.innerWidth - 0.5) * 14);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden bg-abyss pb-24 pt-32 md:pt-36">
      {/* A faint chart grid behind everything: this is, after all, off the map. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(var(--color-neel-300)_1px,transparent_1px),linear-gradient(90deg,var(--color-neel-300)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
      />

      <div className="relative mx-auto max-w-[100rem] px-6 md:px-10">
        <p className="nf-in flex items-center justify-center gap-3 text-[0.64rem] uppercase tracking-[0.3em] text-ember-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember-400" />
          Error 404 · Page not found
        </p>

        {/* ── The digits ── */}
        <div className="mx-auto mt-6 max-w-xl [perspective:1200px]">
          <div ref={stage} className="nf-digits will-change-transform [transform-style:preserve-3d]">
            {/* Cropped to the digits themselves, so they fill the width. */}
            <svg viewBox="255 20 490 340" className="w-full" role="img" aria-label="404">
              <defs>
                <clipPath id="nf-clip">
                  <text
                    x="500"
                    y="330"
                    textAnchor="middle"
                    fontSize="400"
                    letterSpacing="-10"
                    className="font-display"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    404
                  </text>
                </clipPath>
                <linearGradient id="nf-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#1d1b3f" />
                  <stop offset="0.55" stopColor="#7a3f4a" />
                  <stop offset="0.9" stopColor="#f39c4a" />
                </linearGradient>
                <linearGradient id="nf-water" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2d63ad" />
                  <stop offset="1" stopColor="#0a1730" />
                </linearGradient>
              </defs>

              <g clipPath="url(#nf-clip)">
                <rect width="1000" height="380" fill="url(#nf-sky)" />
                {/* The sun, half sunk, behind the waves. */}
                <circle cx="500" cy="215" r="70" fill="#ffc27a" opacity="0.9" />
                <g className="nf-sea">
                  {[
                    { y: 200, fill: "#6fa3e0", o: 0.35, dur: 9 },
                    { y: 214, fill: "url(#nf-water)", o: 1, dur: 6 },
                    { y: 232, fill: "#0a1730", o: 0.8, dur: 4.5 },
                  ].map((w, i) => (
                    <path
                      key={i}
                      d={`M0 ${w.y} Q 125 ${w.y - 22} 250 ${w.y} T 500 ${w.y} T 750 ${w.y} T 1000 ${w.y} T 1250 ${w.y} T 1500 ${w.y} T 1750 ${w.y} T 2000 ${w.y} V 400 H 0 Z`}
                      fill={w.fill}
                      opacity={w.o}
                    >
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from={i % 2 ? "-1000 0" : "0 0"}
                        to={i % 2 ? "0 0" : "-1000 0"}
                        dur={`${w.dur}s`}
                        repeatCount="indefinite"
                      />
                    </path>
                  ))}
                </g>
              </g>

              {/* The digits' outline, drawn over the scene inside them. */}
              <text
                x="500"
                y="330"
                textAnchor="middle"
                fontSize="400"
                letterSpacing="-10"
                fill="none"
                stroke="#f4efe6"
                strokeOpacity="0.35"
                strokeWidth="1.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                404
              </text>
            </svg>
          </div>
        </div>

        {/* ── The message ── */}
        <div className="mx-auto mt-4 max-w-2xl text-center">
          <h1 className="nf-in font-display text-[clamp(2.2rem,5vw,4rem)] leading-tight text-bone">
            This page drifted <span className="italic text-ember-300">off the map</span>
          </h1>
          <p className="nf-in mt-5 text-sand">
            There is nothing at{" "}
            <code className="rounded-md border border-bone/15 bg-ink-2 px-2 py-0.5 font-mono text-sm text-bone">
              {pathname}
            </code>
            . It may have moved, or the link was mistyped.
          </p>

          {guess && (
            <p className="nf-in mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-ember-400/40 bg-ember-500/10 px-5 py-2.5 text-sm text-sand">
              Did you mean
              <a href={guess.href} className="link-draw font-medium text-ember-300">
                {guess.label} <span className="font-mono text-xs text-sand-dim">{guess.href}</span>
              </a>
              ?
            </p>
          )}

          <div className="nf-in mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic strength={0.3}>
              <a
                href="/"
                className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
              >
                <span aria-hidden="true">&larr;</span> Back home
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-3 rounded-full border border-bone/25 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
            >
              Go back
            </button>
            <a
              href={`tel:${site.owner.phoneRaw}`}
              className="inline-flex items-center gap-3 rounded-full border border-bone/25 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
            >
              Call {site.owner.phone}
            </a>
          </div>
        </div>

        {/* ── Every way back ── */}
        <nav aria-label="Pages on this site" className="mx-auto mt-20 max-w-6xl">
          <p className="nf-in text-center text-[0.62rem] uppercase tracking-[0.26em] text-sand-dim">
            Or head somewhere that exists
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {navLinks.map((l, i) => (
              <li key={l.href} className="nf-card">
                <a
                  href={l.href}
                  className="group flex h-full items-start justify-between gap-4 rounded-2xl border border-bone/10 bg-ink-2/80 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-ember-400/50 hover:bg-ink-3"
                >
                  <span>
                    <span className="block text-[0.58rem] tracking-[0.24em] text-ember-500 tabular-nums">
                      0{i + 1}
                    </span>
                    <span className="font-display mt-2 block text-2xl text-bone transition-colors duration-300 group-hover:text-ember-300">
                      {l.label}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-sand-dim">{ABOUT[l.href]}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 text-sand-dim transition-all duration-500 group-hover:translate-x-1 group-hover:text-ember-300"
                  >
                    &rarr;
                  </span>
                </a>
              </li>
            ))}
            <li className="nf-card">
              <a
                href={`https://wa.me/${site.owner.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col justify-between rounded-2xl border border-ember-400/40 bg-ember-500/10 p-5 transition-colors duration-500 hover:bg-ember-500/20"
              >
                <span className="block text-[0.58rem] uppercase tracking-[0.24em] text-ember-400">Still lost?</span>
                <span className="font-display mt-2 block text-2xl text-bone">Ask {site.owner.name.split(" ")[0]} ↗</span>
                <span className="mt-1 block text-xs text-sand">WhatsApp {site.owner.phone}</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
