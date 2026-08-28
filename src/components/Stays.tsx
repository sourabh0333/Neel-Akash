"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, isTouchOrSmall } from "@/lib/anim";
import { stays } from "@/lib/site";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";
import { site } from "@/lib/site";

/**
 * An index list of rooms. Hovering a row floats its photograph next to the
 * cursor — the editorial pattern that keeps the list itself clean.
 * On touch, every row simply carries its own inline image instead.
 */
export default function Stays() {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useGSAP(
    () => {
      const p = preview.current;
      if (!p || prefersReducedMotion() || isTouchOrSmall()) return;

      gsap.set(p, { xPercent: -50, yPercent: -50, opacity: 0, scale: 0.9 });
      const x = gsap.quickTo(p, "x", { duration: 0.85, ease: "power3" });
      const y = gsap.quickTo(p, "y", { duration: 0.85, ease: "power3" });

      const onMove = (e: PointerEvent) => {
        x(e.clientX);
        y(e.clientY);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root }
  );

  useGSAP(
    () => {
      const p = preview.current;
      if (!p || prefersReducedMotion() || isTouchOrSmall()) return;
      gsap.to(p, {
        opacity: active === null ? 0 : 1,
        scale: active === null ? 0.9 : 1,
        duration: 0.5,
        ease: "power3.out",
      });
    },
    { dependencies: [active] }
  );

  return (
    <section ref={root} id="stays" className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Where you sleep
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Twelve doors,
              <br />
              <span className="italic text-neel-300">all facing water</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.15}
            className="max-w-[36ch] text-sm leading-relaxed text-sand"
          >
            Every tariff below is per person, per night, and includes breakfast,
            lunch, evening tea and dinner. There is no hidden second menu.
          </Reveal>
        </div>

        <div className="rule" />

        {stays.map((s, i) => (
          <div key={s.id}>
            <article
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              className="group grid grid-cols-1 items-center gap-6 py-9 md:grid-cols-12 md:gap-8 md:py-11"
            >
              {/* Mobile / touch image */}
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm md:hidden">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-abyss/25" />
              </div>

              <p className="col-span-12 text-[0.66rem] uppercase tracking-[0.26em] text-ember-500 md:col-span-3">
                {s.kicker}
              </p>

              <h3 className="col-span-12 font-display text-[clamp(1.9rem,4vw,3.2rem)] leading-none text-bone transition-all duration-600 ease-[cubic-bezier(.16,1,.3,1)] md:col-span-4 md:group-hover:translate-x-3 md:group-hover:text-ember-300">
                {s.name}
              </h3>

              <p className="col-span-12 max-w-[42ch] text-sm leading-relaxed text-sand md:col-span-3">
                {s.blurb}
              </p>

              <div className="col-span-12 md:col-span-2 md:text-right">
                <p className="font-display text-2xl text-bone md:text-3xl">
                  &#8377;{s.price.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[0.64rem] uppercase tracking-[0.14em] text-sand-dim">
                  {s.capacity}
                </p>
              </div>

              <ul className="col-span-12 flex flex-wrap gap-x-5 gap-y-2 md:col-span-9 md:col-start-4">
                {s.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[0.7rem] tracking-wide text-sand-dim"
                  >
                    <span className="h-1 w-1 rounded-full bg-ember-500/70" />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
            <div className="rule" />
          </div>
        ))}

        <div className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[46ch] text-sm text-sand-dim">
            Group and off-season rates are negotiable &mdash; speak to{" "}
            {site.owner.name} directly.
          </p>
          <Magnetic strength={0.28}>
            <a
              href="#contact"
              data-cursor="Book"
              className="group/b relative inline-flex items-center gap-4 overflow-hidden rounded-full border border-bone/25 px-8 py-4"
            >
              <span className="absolute inset-0 origin-bottom scale-y-0 bg-bone transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover/b:scale-y-100" />
              <span className="relative text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-400 group-hover/b:text-abyss">
                Check availability
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      {/* Cursor-following preview (desktop) */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-[19rem] w-[14rem] overflow-hidden rounded-sm opacity-0 shadow-2xl shadow-abyss lg:block"
      >
        {stays.map((s, i) => (
          <Image
            key={s.id}
            src={s.image}
            alt=""
            fill
            sizes="14rem"
            className="object-cover transition-opacity duration-500"
            style={{ opacity: active === i ? 1 : 0 }}
          />
        ))}
      </div>
    </section>
  );
}
