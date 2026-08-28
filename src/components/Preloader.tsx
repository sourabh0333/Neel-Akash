"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { markIntroDone } from "@/lib/intro";
import { lockScroll, resetScrollLock } from "@/lib/scroll";
import { site } from "@/lib/site";
import { LogoMark } from "./brand/Logo";

/**
 * The opening title card. Counter climbs, the Bengali wordmark resolves,
 * then the whole card lifts away in two staggered panels to reveal the hero.
 *
 * Dispatches `na:intro-done` so the hero knows when to start its own
 * entrance — the two must not play at the same time.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const finish = () => {
      resetScrollLock();
      markIntroDone();
    };

    if (prefersReducedMotion()) {
      gsap.set(el, { display: "none" });
      finish();
      return;
    }

    // Hold the page still for the duration of the title card.
    lockScroll();

    const ctx = gsap.context(() => {
      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: finish });

      // The matra is struck first, left to right, the way it is written —
      // then the island is sewn beneath it, one running stitch at a time.
      tl.from(
        ".logo-matra",
        { scaleX: 0, transformOrigin: "left center", duration: 0.85, ease: "power3.inOut" },
        0
      ).from(
        ".logo-stitch",
        {
          opacity: 0,
          scaleX: 0,
          transformOrigin: "center center",
          duration: 0.28,
          stagger: 0.019,
          ease: "power2.out",
        },
        0.55
      );

      tl.to(counter, {
        v: 100,
        duration: 2.1,
        ease: "power2.inOut",
        onUpdate: () => setCount(Math.round(counter.v)),
      }, 0)
        .from(
          ".pl-mark",
          { yPercent: 110, duration: 1.3, ease: "power4.out" },
          0.15
        )
        .from(".pl-sub", { opacity: 0, y: 14, duration: 0.9 }, 0.8)
        .to(".pl-bar-fill", { scaleX: 1, duration: 2.1, ease: "power2.inOut" }, 0)
        // Everything inside leaves before the panels do.
        .to(
          [".pl-mark", ".pl-sub", ".pl-meta"],
          { opacity: 0, y: -22, duration: 0.6, ease: "power2.in", stagger: 0.04 },
          "+=0.15"
        )
        .to(
          ".pl-panel",
          {
            scaleY: 0,
            transformOrigin: "top center",
            duration: 1.15,
            ease: "power4.inOut",
            stagger: 0.09,
          },
          "-=0.25"
        )
        .set(el, { display: "none" });
    }, el);

    return () => {
      ctx.revert();
      resetScrollLock();
    };
  }, []);

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-hidden="true"
    >
      {/* Two panels that peel upward independently */}
      <div className="absolute inset-0 flex">
        <div className="pl-panel h-full w-1/2 bg-abyss" />
        <div className="pl-panel h-full w-1/2 bg-abyss" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <LogoMark
          animated
          className="pl-logo mb-8 h-24 w-24 text-bone md:h-28 md:w-28"
        />

        <div className="overflow-hidden">
          <h1 className="pl-mark font-bn t-huge text-bone">{site.nameBn}</h1>
        </div>
        <p className="pl-sub t-eyebrow mt-6 text-sand-dim">
          {site.name} &nbsp;·&nbsp; {site.location.island}
        </p>

        <div className="pl-meta mt-12 w-[min(78vw,22rem)]">
          <div className="rule relative overflow-hidden">
            <div className="pl-bar-fill absolute inset-0 origin-left scale-x-0 bg-ember-500" />
          </div>
          <div className="mt-3 flex justify-between font-sans text-[0.68rem] tracking-[0.2em] text-sand-dim tabular-nums">
            <span>LOADING</span>
            <span>{String(count).padStart(3, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
