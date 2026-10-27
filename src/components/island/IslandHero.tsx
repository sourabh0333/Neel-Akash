"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";

/** 21.6667 → 21°40′ — the readout in the corner. */
const dms = (v: number) => {
  const d = Math.floor(v);
  const m = Math.round((v - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′`;
};

/**
 * The island page opens on the horizon: the photograph splits open from a
 * single line, "Mousuni" rises letter by letter, and on the way out the frame
 * draws in to a card while the name drifts up past it.
 */
export default function IslandHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const split = SplitText.create(".ih-name", { type: "chars", mask: "chars" });

      gsap
        .timeline({ defaults: { ease: "power4.out" } })
        .fromTo(
          ".ih-frame",
          { clipPath: "inset(49.6% 0% 49.6% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }
        )
        .fromTo(".ih-photo", { scale: 1.25 }, { scale: 1, duration: 2.4 }, 0)
        .fromTo(
          split.chars,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.3, stagger: 0.06 },
          0.9
        )
        .fromTo(
          ".ih-fade",
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.08 },
          1.3
        )
        .fromTo(
          ".ih-rule",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: "expo.out" },
          1.2
        );

      // Leaving: the frame draws in to a rounded card, the name lifts away.
      const exit = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".ih-frame", {
        clipPath: "inset(6% 4% 10% 4% round 28px)",
        ease: "none",
        scrollTrigger: exit,
      });
      gsap.to(".ih-photo", { yPercent: 12, ease: "none", scrollTrigger: exit });
      gsap.to(".ih-copy", { yPercent: -40, opacity: 0, ease: "none", scrollTrigger: { ...exit, end: "65% top" } });

      return () => split.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[40rem] w-full overflow-hidden bg-abyss"
    >
      <div className="ih-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
        <div className="ih-photo absolute inset-0">
          <Image
            src="/images/g-1.jpg"
            alt="Waves breaking at dusk on Mousuni's open beach"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-abyss/60 via-abyss/10 to-abyss/90" />
        <div className="absolute inset-0 bg-linear-to-r from-abyss/50 via-transparent to-transparent" />

        {/* The tide line: three slow swells along the foot of the frame. */}
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
              transform={`translate(0 ${i * 10})`}
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
      </div>

      <div className="ih-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20 lg:pb-28">
        <div className="ih-fade t-eyebrow mb-5 flex items-center gap-4 text-sand">
          <span className="h-px w-10 bg-ember-500" />
          The island · {site.location.district}
          <span className="font-bn hidden tracking-[0.08em] normal-case text-sand/70 sm:inline" lang="bn">
            মৌসুনি দ্বীপ
          </span>
        </div>

        <h1 className="ih-name font-display text-[clamp(4.2rem,19vw,19rem)] leading-[0.8] tracking-[-0.04em] text-bone">
          Mousuni
        </h1>

        <div className="ih-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="ih-fade max-w-[40ch] text-base leading-relaxed text-sand md:col-span-5 md:text-lg">
            An island at the edge of the bay, where the Muri Ganga and the
            Chinai let go of the mainland.
          </p>

          <dl className="ih-fade grid grid-cols-3 gap-6 md:col-span-4 md:col-start-7">
            {[
              ["Villages", "4"],
              ["Open beach", "4.5 km"],
              ["From Kolkata", "120 km"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim">{k}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="ih-fade hidden text-right font-sans text-[0.62rem] uppercase leading-loose tracking-[0.24em] text-sand-dim tabular-nums md:col-span-2 md:col-start-11 md:block">
            {dms(site.location.lat)} N
            <br />
            {dms(site.location.lng)} E
          </p>
        </div>
      </div>


      <div className="ih-fade absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex">
        <span className="text-[0.58rem] uppercase tracking-[0.3em] text-sand-dim">Scroll</span>
        <span className="relative h-10 w-px overflow-hidden bg-bone/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[ih-drip_1.8s_ease-in-out_infinite] bg-ember-400" />
        </span>
      </div>
    </section>
  );
}
