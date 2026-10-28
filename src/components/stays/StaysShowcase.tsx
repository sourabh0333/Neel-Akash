"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { stays } from "@/lib/site";
import PriceTag from "../ui/PriceTag";
import Reveal from "../ui/Reveal";
import Magnetic from "../ui/Magnetic";

/**
 * One full chapter per stay. As each arrives its photograph opens out from a
 * smaller rounded window and drifts inside it, the big index numeral slides
 * the other way, and the details follow in order.
 */
export default function StaysShowcase() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".ss-panel").forEach((panel) => {
        const enter = { trigger: panel, start: "top bottom", end: "top 25%", scrub: true };
        const through = { trigger: panel, start: "top bottom", end: "bottom top", scrub: true };

        gsap.fromTo(
          panel.querySelector(".ss-media"),
          { clipPath: "inset(14% 12% 14% 12% round 28px)" },
          { clipPath: "inset(0% 0% 0% 0% round 20px)", ease: "none", scrollTrigger: enter }
        );
        gsap.fromTo(
          panel.querySelector(".ss-img"),
          { yPercent: -8, scale: 1.18 },
          { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: through }
        );
        gsap.fromTo(
          panel.querySelector(".ss-num"),
          { yPercent: 30 },
          { yPercent: -30, ease: "none", scrollTrigger: through }
        );
        gsap.fromTo(
          panel.querySelectorAll(".ss-item"),
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.07,
            scrollTrigger: { trigger: panel.querySelector(".ss-copy"), start: "top 80%", once: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="stays" className="relative bg-abyss pb-16 pt-28 md:pt-40">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-20 grid gap-6 md:mb-28 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Three ways to stay
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              All of them <span className="italic text-neel-300">facing water</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[42ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            Tent and cottage tariffs are per person, per night, and include a
            welcome drink, lunch, evening snacks, dinner and the next
            morning&rsquo;s breakfast. The group special is one price for the
            whole group.
          </Reveal>
        </div>

        <div className="flex flex-col gap-28 md:gap-40">
          {stays.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <article
                key={s.id}
                className="ss-panel grid items-center gap-10 lg:grid-cols-12 lg:gap-16"
              >
                <a
                  href={`/stays/${s.id}`}
                  data-cursor="View"
                  className={`ss-media group relative block aspect-4/5 overflow-hidden rounded-[20px] sm:aspect-16/11 lg:col-span-7 lg:aspect-auto lg:h-[78vh] ${
                    flip ? "lg:order-2 lg:col-start-6" : ""
                  }`}
                >
                  <div className="ss-img absolute inset-0">
                    <Image
                      src={s.image}
                      alt={s.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      className="object-cover transition-[filter] duration-700 group-hover:brightness-110"
                      style={{ objectPosition: s.focus }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-abyss/70 via-transparent to-abyss/20" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-5 md:p-7">
                    <span className="rounded-full border border-bone/25 bg-abyss/50 px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.16em] text-bone backdrop-blur-md">
                      {s.capacity}
                    </span>
                    {s.mealsIncluded && (
                      <span className="rounded-full bg-ember-400/90 px-3.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-abyss">
                        All meals included
                      </span>
                    )}
                  </div>
                </a>

                <div className={`ss-copy relative lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  <span
                    aria-hidden="true"
                    className="ss-num font-display pointer-events-none absolute -top-16 right-0 select-none text-[clamp(7rem,16vw,15rem)] leading-none text-transparent [-webkit-text-stroke:1px_rgba(244,239,230,0.12)] md:-top-28"
                  >
                    0{i + 1}
                  </span>

                  <p className="ss-item relative text-[0.66rem] uppercase tracking-[0.26em] text-ember-500">
                    {s.kicker}
                  </p>
                  <h3 className="ss-item font-display relative mt-5 text-[clamp(2.6rem,5.5vw,5rem)] leading-[0.95] text-bone">
                    {s.name}
                  </h3>
                  <p className="ss-item relative mt-6 max-w-[44ch] leading-relaxed text-sand">
                    {s.blurb}
                  </p>

                  <ul className="relative mt-8 border-t border-bone/10">
                    {s.features.map((f) => (
                      <li
                        key={f}
                        className="ss-item flex items-center gap-3 border-b border-bone/10 py-3.5 text-sm text-sand"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="ss-item relative mt-9 flex flex-wrap items-end justify-between gap-8">
                    <PriceTag stay={s} />
                    <div className="flex flex-wrap gap-3">
                      <Magnetic strength={0.25}>
                        <a
                          href={`/contact?stay=${s.id}`}
                          data-cursor="Book"
                          className="inline-flex items-center gap-3 rounded-full bg-bone px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
                        >
                          Book <span aria-hidden="true">&rarr;</span>
                        </a>
                      </Magnetic>
                      <a
                        href={`/stays/${s.id}`}
                        className="inline-flex items-center rounded-full border border-bone/25 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
