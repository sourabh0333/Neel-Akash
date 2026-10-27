"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";
import HeroCanvas from "./HeroCanvas";
import Magnetic from "./ui/Magnetic";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      if (prefersReducedMotion()) return;

      /* ── Exit: the whole frame sinks and dims as you leave ── */
      gsap.to(".hero-parallax", {
        yPercent: 22,
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      gsap.to(".hero-copy", {
        yPercent: -55,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "70% top",
          scrub: true,
        },
      });

    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative h-[100svh] min-h-[38rem] w-full overflow-hidden"
    >
      {/* Layer 1 — animated WebGL sky/sea */}
      <div className="hero-parallax absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-neel-900 via-ink to-abyss" />
        <HeroCanvas />

        {/* Layer 2 — a graded photograph, blended into the field.
            `overlay` keeps the field's own light and dark while lending the
            frame real photographic texture; `soft-light` over this dark a
            base just collapses to black.
            `isolate` matters: the old entrance left `filter: blur(0px)` on
            this layer, which isolated the blend, and that is the look the
            site shipped with. Without it the photo greys out into the field. */}
        <div className="absolute inset-0 isolate">
          <Image
            src="/images/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60 mix-blend-overlay"
          />
        </div>

        {/* Grade: hold the sky, sink the foot of the frame so type stays legible */}
        <div className="absolute inset-0 bg-linear-to-b from-abyss/45 via-abyss/5 to-abyss" />
        <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-transparent" />
      </div>

      {/* Layer 3 — type */}
      <div className="hero-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-16 md:px-10 md:pb-20">
        <div className="t-eyebrow mb-6 flex items-center gap-4 text-sand">
          <span className="h-px w-10 bg-ember-500" />
          <span>
            {site.location.island} · {site.location.state}
          </span>
        </div>

        <h1 className="font-display t-mega whitespace-nowrap text-bone">
          Penguin <span className="italic text-ember-300">Beach Camp</span>
        </h1>

        <div className="mt-8 flex flex-col gap-10 border-t border-bone/12 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="line-mask max-w-[34ch]">
            <p className="text-lg leading-snug text-sand md:text-xl">
              {site.tagline}.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4 lg:gap-x-14">
            {site.stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl text-bone md:text-4xl">
                  {s.value}
                  <span className="text-lg text-ember-400">{s.unit}</span>
                </p>
                <p className="mt-1 text-[0.68rem] uppercase tracking-[0.16em] text-sand-dim">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <Magnetic strength={0.3}>
            <a
              href="/contact"
              data-cursor="Book"
              className="group/cta relative inline-flex items-center gap-4 overflow-hidden rounded-full bg-bone px-8 py-4 text-abyss"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-ember-400 transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover/cta:scale-x-100" />
              <span className="relative text-[0.76rem] font-semibold uppercase tracking-[0.18em]">
                Reserve a night
              </span>
              <span className="relative transition-transform duration-500 group-hover/cta:translate-x-1">
                &rarr;
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[0.58rem] uppercase tracking-[0.3em] text-sand-dim">
          Scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-bone/20">
          <span className="absolute inset-x-0 top-0 h-1/3 animate-[scrollcue_2.2s_ease-in-out_infinite] bg-ember-400" />
        </span>
      </div>

      <style>{`
        @keyframes scrollcue {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  );
}
