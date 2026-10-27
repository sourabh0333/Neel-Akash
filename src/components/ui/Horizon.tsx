"use client";

import type { RefObject } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";

/**
 * The horizon opening shared by the page heroes (Home, the Island).
 *
 * Mark up the hero with these classes:
 *   .hz-frame  the backdrop: draws in to a rounded card as you scroll away
 *   .hz-open   inside it: splits open from a single horizon line on load
 *   .hz-photo  the picture: settles from a slight zoom, drifts on the way out
 *   .hz-char   each letter of the title (HeroTitle renders them): rises in turn
 *   .hz-rule   a hairline that draws across
 *   .hz-fade   everything else that floats in
 *   .hz-copy   the type block that lifts away on the way out
 *
 * The opening and the scroll-out sit on different elements (.hz-open and
 * .hz-frame) on purpose. A scrubbed tween takes its "from" from wherever the
 * element is when the tween is created — which, on the same element, would be
 * the closed horizon line, and scrolling back to the top would close it again.
 */
export function useHorizon(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = scope.current;
      if (!el || prefersReducedMotion()) return;

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          ".hz-open",
          { clipPath: "inset(49.6% 0% 49.6% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" }
        )
        .fromTo(".hz-photo", { scale: 1.25 }, { scale: 1, duration: 2.4 }, 0)
        .fromTo(".hz-char", { yPercent: 110 }, { yPercent: 0, duration: 1.3, stagger: 0.045 }, 0.9)
        .fromTo(".hz-fade", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, stagger: 0.08 }, 1.3)
        .fromTo(".hz-rule", { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: "expo.out" }, 1.2);

      // Leaving: the frame draws in to a rounded card, the type lifts away.
      // Explicit "from" values, so the top of the page is always the open frame.
      const exit = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.fromTo(
        ".hz-frame",
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(6% 4% 10% 4% round 28px)", ease: "none", scrollTrigger: exit }
      );
      gsap.fromTo(".hz-photo", { yPercent: 0 }, { yPercent: 12, ease: "none", scrollTrigger: exit });
      gsap.fromTo(
        ".hz-copy",
        { yPercent: 0, opacity: 1 },
        { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { ...exit, end: "65% top" } }
      );
    },
    { scope }
  );
}

/** Three slow swells along the foot of a hero. */
export function TideLine() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className="absolute inset-x-0 bottom-0 h-16 w-[200%] opacity-60 md:h-24"
    >
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d="M0 30 Q75 10 150 30 T300 30 T450 30 T600 30 T750 30 T900 30 T1050 30 T1200 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          className="text-bone/40"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            from={`0 ${i * 10}`}
            to={`-300 ${i * 10}`}
            dur={`${9 + i * 4}s`}
            repeatCount="indefinite"
          />
        </path>
      ))}
    </svg>
  );
}

/** A drop of light running down a line — "there is more below". */
export function ScrollCue() {
  return (
    <div className="hz-fade absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
      <span className="text-[0.58rem] uppercase tracking-[0.3em] text-sand-dim">Scroll</span>
      <span className="relative h-10 w-px overflow-hidden bg-bone/15">
        <span className="absolute inset-x-0 top-0 h-1/2 animate-[ih-drip_1.8s_ease-in-out_infinite] bg-ember-400" />
      </span>
    </div>
  );
}

/** 21.6667 → 21°40′ */
export const dms = (v: number) => {
  const d = Math.floor(v);
  const m = Math.round((v - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
};
