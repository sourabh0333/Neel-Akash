"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, splitWords, prefersReducedMotion } from "@/lib/anim";

const STATEMENT =
  "Nine square kilometres of silt, salt and paddy. Two rivers let go of the mainland here, and what is left of them runs straight into the Bay of Bengal.";

const STATS = [
  { value: 9, unit: "km²", label: "of island", decimals: 0 },
  { value: 4, unit: "", label: "villages", decimals: 0 },
  { value: 4.5, unit: "km", label: "of open beach", decimals: 1 },
  { value: 2, unit: "", label: "rivers, one bay", decimals: 0 },
];

/**
 * A statement that lights up word by word as it scrolls past, then the
 * island in four numbers, each counting up as it arrives.
 */
export default function IslandGlance() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || prefersReducedMotion()) return;

      const words = splitWords(el.querySelector(".ig-statement") as HTMLElement);
      gsap.fromTo(
        words.targets,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".ig-statement",
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".ig-num").forEach((n, i) => {
        const s = STATS[i];
        const o = { v: 0 };
        gsap.to(o, {
          v: s.value,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: n, start: "top 88%", once: true },
          onUpdate: () => (n.textContent = o.v.toFixed(s.decimals)),
        });
      });

      gsap.fromTo(
        ".ig-stat",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          scrollTrigger: { trigger: ".ig-stats", start: "top 88%", once: true },
        }
      );

      return () => words.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss py-28 md:py-40">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="t-eyebrow text-ember-500 lg:col-span-3">At a glance</p>
          <p className="ig-statement font-display text-[clamp(1.9rem,4.2vw,4rem)] leading-[1.08] text-bone lg:col-span-9">
            {STATEMENT}
          </p>
        </div>

        <dl className="ig-stats mt-20 grid grid-cols-2 border-t border-bone/10 md:mt-28 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="ig-stat flex flex-col-reverse border-b border-bone/10 py-8 pr-4 lg:border-b-0 lg:border-r lg:py-10 lg:pl-8 lg:first:pl-0 lg:last:border-r-0"
            >
              <dt className="mt-4 text-[0.68rem] uppercase tracking-[0.2em] text-sand-dim">
                <span className="mr-3 text-ember-500 tabular-nums">0{i + 1}</span>
                {s.label}
              </dt>
              <dd className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-none text-bone">
                <span className="ig-num tabular-nums">{s.value.toFixed(s.decimals)}</span>
                <span className="ml-1 text-[0.4em] text-ember-400">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
