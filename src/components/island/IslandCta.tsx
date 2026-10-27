"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import Magnetic from "../ui/Magnetic";

const WORDS = ["Silt", "Salt", "Paddy", "Tide", "Casuarina", "Wind", "Boats", "Birds"];

/**
 * A band of the island's words that runs with the scroll — faster and
 * leaning when you scroll fast — then the way on: a place to stay, and how
 * to get here.
 */
export default function IslandCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>(".ic-row");
      // Each row holds the words twice, so a half-width shift loops seamlessly;
      // alternate rows run the other way.
      const loops = rows.map((row, i) =>
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -50 : 0 },
          { xPercent: i % 2 ? 0 : -50, ease: "none", duration: 40, repeat: -1 }
        )
      );
      // Scroll velocity speeds the loops up and leans the type, then both ease back.
      const skew = gsap.quickTo(rows, "skewX", { duration: 0.5, ease: "power3" });
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const boost = 1 + Math.min(6, Math.abs(v) / 300);
          loops.forEach((l) => gsap.to(l, { timeScale: boost * (v < 0 ? -1 : 1), duration: 0.2, overwrite: true }));
          skew(gsap.utils.clamp(-10, 10, v / -200));
        },
        onLeave: () => loops.forEach((l) => l.pause()),
        onEnterBack: () => loops.forEach((l) => l.resume()),
        onLeaveBack: () => loops.forEach((l) => l.pause()),
        onEnter: () => loops.forEach((l) => l.resume()),
      });
      const settle = () => {
        loops.forEach((l) => gsap.to(l, { timeScale: Math.sign(l.timeScale()) || 1, duration: 1 }));
        skew(0);
      };
      ScrollTrigger.addEventListener("scrollEnd", settle);
      return () => {
        ScrollTrigger.removeEventListener("scrollEnd", settle);
        st.kill();
      };
    },
    { scope: root }
  );

  const row = (k: number) => (
    <div className="ic-row flex w-max shrink-0 will-change-transform">
      {[0, 1].map((rep) => (
        <span key={rep} className="flex shrink-0 items-center" aria-hidden={rep === 1 || undefined}>
          {WORDS.map((w, i) => (
            <span key={w} className="flex items-center">
              <span
                className={`font-display px-6 text-[clamp(3.5rem,10vw,9rem)] leading-none md:px-10 ${
                  (i + k) % 2 ? "italic text-transparent [-webkit-text-stroke:1px_var(--color-sand-dim)]" : "text-bone"
                }`}
              >
                {w}
              </span>
              <span className="h-3 w-3 rounded-full bg-ember-500" />
            </span>
          ))}
        </span>
      ))}
    </div>
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink py-24 md:py-36">
      <div aria-label="Silt, salt, paddy, tide, casuarina, wind, boats, birds" className="flex flex-col gap-4 md:gap-6">
        {row(0)}
        {row(1)}
      </div>

      <div className="mx-auto mt-24 grid max-w-[100rem] gap-10 px-6 md:mt-32 md:px-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="t-eyebrow text-ember-500">Come and see it</p>
          <h2 className="font-display t-huge mt-5 text-bone">
            A night or two <span className="italic text-ember-300">on the edge of the bay</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
          <Magnetic strength={0.3}>
            <a
              href="/stays"
              data-cursor="Stay"
              className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
            >
              Find a stay <span aria-hidden="true">&rarr;</span>
            </a>
          </Magnetic>
          <Magnetic strength={0.3}>
            <a
              href="/getting-here"
              className="inline-flex items-center gap-3 rounded-full border border-bone/25 px-8 py-4 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
            >
              Getting here
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
