"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/anim";
import { testimonials } from "@/lib/site";
import Reveal from "./ui/Reveal";

const HOLD = 7200; // ms per quote

/**
 * One voice at a time, at full size — a focused pull rather than a wall of
 * cards. Words of the incoming quote rise in sequence; the guest index at the
 * left carries a marker that slides to the active name, and a hairline timer
 * shows when it will move on. Hovering or focusing anything here pauses it,
 * so nobody loses a sentence they were mid-way through reading.
 */
export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const splitRef = useRef<{ revert: () => void } | null>(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    const n = testimonials.length;
    setI(((next % n) + n) % n);
  }, []);

  /* The timer bar *is* the clock — advancing is its onComplete, so pausing
     freezes the bar where it stands instead of resetting the countdown. */
  const timer = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    timer.current?.[paused ? "pause" : "play"]();
  }, [paused]);

  /* Word-by-word reveal of the active quote. */
  useGSAP(
    () => {
      const el = quoteRef.current;
      if (!el) return;

      splitRef.current?.revert();
      splitRef.current = null;

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: "words,lines",
        linesClass: "line-inner",
        mask: "lines",
      });
      splitRef.current = split;

      gsap.fromTo(
        split.words,
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.022,
        }
      );

      gsap.fromTo(
        ".voice-meta > *",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out", delay: 0.2 }
      );

      return () => {
        splitRef.current?.revert();
        splitRef.current = null;
      };
    },
    { scope: root, dependencies: [i] }
  );

  /* Marker slide + timer bar. */
  useGSAP(
    () => {
      const item = root.current?.querySelector<HTMLElement>(
        `.voice-name[data-i="${i}"]`
      );
      const marker = root.current?.querySelector<HTMLElement>(".voice-marker");
      if (item && marker) {
        gsap.to(marker, {
          y: item.offsetTop,
          height: item.offsetHeight,
          duration: prefersReducedMotion() ? 0 : 0.6,
          ease: "power3.out",
        });
      }

      const bar = root.current?.querySelector<HTMLElement>(".voice-timer");
      if (!bar) return;

      timer.current?.kill();
      timer.current = null;

      // Under reduced motion nothing rotates on its own; the index still works.
      if (prefersReducedMotion()) {
        gsap.set(bar, { scaleX: 0 });
        return;
      }

      timer.current = gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: HOLD / 1000,
          ease: "none",
          paused,
          onComplete: () => go(i + 1),
        }
      );

      return () => {
        timer.current?.kill();
        timer.current = null;
      };
    },
    { scope: root, dependencies: [i] }
  );

  /* Section entrance. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".voice-stage", {
        opacity: 0,
        y: 40,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: ".voice-stage", start: "top 82%" },
      });
    },
    { scope: root }
  );

  const t = testimonials[i];

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-ink py-28 md:py-36"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Oversized Bengali watermark — "guests" */}
      <span
        aria-hidden="true"
        className="font-bn pointer-events-none absolute -right-6 top-10 select-none text-bone/4 [font-size:clamp(6rem,18vw,16rem)] leading-none"
      >
        অতিথি
      </span>

      <div className="relative mx-auto max-w-[100rem] px-6 md:px-10">
        <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
          Guests
        </Reveal>
        <Reveal as="h2" className="font-display t-big mt-5 max-w-[18ch] text-bone">
          What people say
          <span className="italic text-neel-300"> afterwards</span>
        </Reveal>

        <div className="voice-stage mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Index of voices ── */}
          <div className="lg:col-span-4">
            <p className="mb-5 text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">
              Four stays
            </p>

            <div className="relative">
              <span className="absolute left-0 top-0 h-full w-px bg-bone/12" />
              <span className="voice-marker absolute left-0 top-0 w-px bg-ember-400" />

              <ul>
                {testimonials.map((v, n) => (
                  <li key={v.name}>
                    <button
                      type="button"
                      data-i={n}
                      onClick={() => go(n)}
                      aria-current={n === i}
                      className="voice-name group/v flex w-full items-center gap-4 py-3.5 pl-6 text-left"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.6rem] tracking-[0.08em] transition-colors duration-500 ${
                          n === i
                            ? "border-ember-400 bg-ember-500/12 text-ember-300"
                            : "border-bone/20 text-sand-dim group-hover/v:border-bone/45"
                        }`}
                      >
                        {v.initials}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate font-display text-lg transition-colors duration-500 ${
                            n === i ? "text-bone" : "text-sand-dim group-hover/v:text-sand"
                          }`}
                        >
                          {v.name}
                        </span>
                        <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-sand-dim">
                          {v.from}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timer + manual control */}
            <div className="mt-8 flex items-center gap-4 pl-6">
              <span className="relative h-px flex-1 overflow-hidden bg-bone/15">
                <span className="voice-timer absolute inset-0 origin-left scale-x-0 bg-ember-400" />
              </span>
              <button
                onClick={() => go(i + 1)}
                aria-label="Next guest"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors duration-400 hover:border-ember-400 hover:text-ember-300"
              >
                &rarr;
              </button>
            </div>
          </div>

          {/* ── The quote ── */}
          <figure className="lg:col-span-8">
            <span
              aria-hidden="true"
              className="font-display block text-7xl leading-none text-ember-500/40"
            >
              &ldquo;
            </span>

            {/* `key` forces a fresh node per quote. SplitText rewrites this
                element's children, which detaches the text node React holds —
                without a remount the words would never change. */}
            <blockquote
              key={i}
              ref={quoteRef}
              className="font-display mt-2 text-[clamp(1.5rem,3.1vw,2.75rem)] leading-[1.22] text-bone"
            >
              {t.quote}
            </blockquote>

            <figcaption className="voice-meta mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/10 pt-6">
              <span className="font-display text-xl text-bone">{t.name}</span>
              <span className="h-3 w-px bg-bone/20" />
              <span className="text-[0.66rem] uppercase tracking-[0.2em] text-sand-dim">
                {t.stay}
              </span>
              <span className="h-3 w-px bg-bone/20" />
              <span className="text-[0.66rem] uppercase tracking-[0.2em] text-sand-dim">
                {t.when}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
