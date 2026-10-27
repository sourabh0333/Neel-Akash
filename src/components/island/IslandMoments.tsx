"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";

const MOMENTS = [
  {
    src: "/images/g-2.jpg",
    alt: "Empty shoreline at low tide",
    title: "Low tide",
    time: "Twice a day",
    text: "The bay pulls back and leaves the beach wide, wet and mirrored. You can walk out further than seems sensible.",
  },
  {
    src: "/images/g-3.jpg",
    alt: "Fishing boat drawn up on the sand",
    title: "The boats",
    time: "First light",
    text: "The river side wakes first. Fishing boats push off in the half-light while the island is still the colour of ash and rose.",
  },
  {
    src: "/images/g-4.jpg",
    alt: "Sunset over the Bay of Bengal",
    title: "The sun going down",
    time: "Evening",
    text: "No buildings in the way, just the bay. Most evenings everyone on the beach simply stops and watches.",
  },
  {
    src: "/images/g-6.jpg",
    alt: "Night sky above the camp",
    title: "The dark",
    time: "After the bonfire",
    text: "No town glow for miles. Once the fire has burned down, the stars come out properly.",
  },
];

/**
 * A day on the island as a deck of cards: each one sticks, and the next
 * slides up over it while the one beneath sinks back and dims.
 */
export default function IslandMoments() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const cards = gsap.utils.toArray<HTMLElement>(".im-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (next) {
          gsap.to(card.querySelector(".im-card-body"), {
            scale: 0.9,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: { trigger: next, start: "top bottom", end: "top 18%", scrub: true },
          });
        }
        gsap.fromTo(
          card.querySelector(".im-card-img"),
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "top 18%", scrub: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss pb-24 pt-28 md:pb-40 md:pt-40">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-16 grid gap-6 md:mb-24 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-eyebrow text-ember-500">A day here</p>
            <h2 className="font-display t-huge mt-5 text-bone">
              The island keeps <span className="italic text-neel-300">its own time</span>
            </h2>
          </div>
          <p className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9">
            The tide, the boats and the light set the hours on Mousuni. Four of
            the moments the day turns on.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {MOMENTS.map((m, i) => (
            <article
              key={m.title}
              className="im-card sticky"
              style={{ top: `calc(6rem + ${i * 1.25}rem)` }}
            >
              <div className="im-card-body grid origin-top overflow-hidden rounded-3xl border border-bone/10 bg-ink-2 md:h-[72vh] md:grid-cols-12">
                <div className="relative h-[42vh] overflow-hidden md:col-span-7 md:h-auto">
                  <div className="im-card-img absolute inset-0">
                    <Image src={m.src} alt={m.alt} fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-abyss/60 to-transparent md:bg-linear-to-r md:from-transparent md:to-ink-2/40" />
                </div>
                <div className="flex flex-col justify-between gap-10 p-7 md:col-span-5 md:p-12">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.62rem] uppercase tracking-[0.26em] text-ember-400">{m.time}</span>
                    <span className="font-display text-5xl text-bone/15 tabular-nums md:text-7xl">0{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-display t-big text-bone">{m.title}</h3>
                    <p className="mt-4 max-w-[36ch] leading-relaxed text-sand">{m.text}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
