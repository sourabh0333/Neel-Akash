"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, splitWords, prefersReducedMotion } from "@/lib/anim";
import { meals } from "@/lib/site";

const STATEMENT =
  "Pomfret and prawns off the morning's boats, rice and dal at lunch, tea and muri facing the water, luchi the next day. Here the day is served, not ordered.";

/** Every dish, with the meal it belongs to. */
const plates = meals.flatMap((m) => m.dishes.map((d) => ({ ...d, time: m.time, meal: m.label })));

/**
 * A statement that lights up word by word, then every plate on one long
 * rail. On wide screens the section pins and scrolling carries the rail
 * sideways, each photograph counter-drifting in its frame; on phones it is a
 * plain swipeable row.
 */
export default function MenuPlates() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const words = splitWords(root.current!.querySelector(".mp-statement") as HTMLElement);
      gsap.fromTo(
        words.targets,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ".mp-statement", start: "top 80%", end: "bottom 45%", scrub: true },
        }
      );

      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        const t = track.current!;
        const distance = () => t.scrollWidth - window.innerWidth;
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".mp-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".mp-card"),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });
        // The progress bar under the rail.
        gsap.fromTo(
          ".mp-progress",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: pin.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
          }
        );
      });

      return () => {
        mm.revert();
        words.revert();
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss">
      <div className="mx-auto max-w-[100rem] px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-40">
        <div className="grid gap-10 lg:grid-cols-12">
          <p className="t-eyebrow text-ember-500 lg:col-span-3">On the table</p>
          <p className="mp-statement font-display text-[clamp(1.9rem,4.2vw,4rem)] leading-[1.08] text-bone lg:col-span-9">
            {STATEMENT}
          </p>
        </div>
      </div>

      <div ref={pin} className="relative overflow-hidden min-[900px]:h-[100svh]">
        <div className="flex h-full flex-col justify-center">
          <div className="mx-auto mb-8 flex w-full max-w-[100rem] items-end justify-between px-6 md:px-10">
            <h2 className="font-display text-[clamp(2rem,4.4vw,3.6rem)] leading-none text-bone">
              Every plate <span className="italic text-neel-300">of the day</span>
            </h2>
            <span className="hidden text-[0.62rem] uppercase tracking-[0.24em] text-sand-dim md:block">
              {String(plates.length).padStart(2, "0")} dishes
            </span>
          </div>

          <div
            ref={track}
            className="flex gap-5 overflow-x-auto px-6 pb-6 md:px-10 min-[900px]:overflow-visible min-[900px]:pb-0"
          >
            {plates.map((p, i) => (
              <article
                key={p.name}
                className="mp-card group relative h-[58vh] w-[78vw] shrink-0 overflow-hidden rounded-2xl sm:w-[46vw] min-[900px]:h-[62vh] min-[900px]:w-[30vw]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="mp-img relative h-full w-[116%] -ml-[8%]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 900px) 78vw, 30vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/30 to-transparent" />

                <div className="absolute left-6 right-6 top-6 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.22em]">
                  <span className="rounded-full border border-bone/25 bg-abyss/40 px-3 py-1.5 text-bone backdrop-blur-md">
                    {p.time} · {p.meal}
                  </span>
                  <span className="text-bone/60 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <h3 className="font-display text-[clamp(1.8rem,2.6vw,2.6rem)] leading-tight text-bone">{p.name}</h3>
                  <p lang="bn" className="font-bn mt-1 text-sm text-ember-300">
                    {p.bn}
                  </p>
                  <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-sand">{p.note}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 hidden w-full max-w-[100rem] px-10 min-[900px]:block">
            <div className="h-px bg-bone/10">
              <div className="mp-progress h-full origin-left bg-ember-400" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
