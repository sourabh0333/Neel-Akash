"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { gallery } from "@/lib/site";

const PANELS = [
  {
    n: "01",
    title: "Baliara",
    text: "The seaward edge. Open beach, casuarina, and the wind that never quite stops.",
  },
  {
    n: "02",
    title: "Kusumtala",
    text: "Paddy, betel groves and brick paths. The island's quiet middle, where we are.",
  },
  {
    n: "03",
    title: "Bagdanga",
    text: "The landing. Ferries come in with the tide and the whole village knows before you do.",
  },
  {
    n: "04",
    title: "Kakramarir Chor",
    text: "A sandbar an hour out by boat, populated entirely by birds.",
  },
];

/**
 * Vertical scroll is translated into horizontal travel while the section
 * is pinned — the 2026 "unexpected axis" pattern. Below 900px it degrades
 * into an ordinary swipeable rail, which is both cheaper and better on touch.
 */
export default function Island() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px)", () => {
        const t = track.current;
        const r = root.current;
        if (!t || !r) return;

        const distance = () => t.scrollWidth - window.innerWidth;

        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: r,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Each panel's image counter-moves inside its frame for depth.
        gsap.utils.toArray<HTMLElement>(".island-img").forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: img.closest(".island-panel"),
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="island"
      className="relative overflow-hidden bg-ink lg:h-[100svh]"
    >
      <div
        ref={track}
        className="flex gap-5 overflow-x-auto px-6 py-24 md:px-10 lg:h-full lg:items-center lg:overflow-visible lg:py-0"
      >
        {/* Opening card sits inside the rail so it scrolls away with it */}
        <div className="w-[78vw] shrink-0 sm:w-[52vw] lg:w-[36vw] lg:pr-10">
          <p className="t-eyebrow text-ember-500">The island</p>
          <h2 className="font-display t-huge mt-5 text-bone">
            Four villages,
            <br />
            <span className="italic text-neel-300">one long beach</span>
          </h2>
          <p className="mt-6 max-w-[38ch] leading-relaxed text-sand">
            Mousuni sits where the Muri Ganga and the Chinai let go of the
            mainland. It is nine square kilometres of silt, salt and paddy,
            and it empties straight into the Bay of Bengal.
          </p>
          <p className="mt-8 hidden items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-sand-dim lg:flex">
            <span className="h-px w-8 bg-ember-500" />
            Scroll to travel across
          </p>
        </div>

        {PANELS.map((p) => (
          <article
            key={p.n}
            className="island-panel group relative h-[62vh] w-[78vw] shrink-0 overflow-hidden rounded-sm sm:w-[52vw] lg:h-[68vh] lg:w-[38vw]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="island-img relative h-full w-[118%]">
                <Image
                  src={gallery[Number(p.n) - 1]?.src ?? gallery[0].src}
                  alt={p.title}
                  fill
                  sizes="(max-width: 900px) 78vw, 38vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                />
              </div>
            </div>

            <div className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/25 to-transparent" />

            <div className="relative flex h-full flex-col justify-end p-7 md:p-9">
              <span className="font-sans text-[0.62rem] tracking-[0.3em] text-ember-400">
                {p.n}
              </span>
              <h3 className="font-display t-big mt-3 text-bone">{p.title}</h3>
              <p className="mt-3 max-w-[30ch] text-sm leading-relaxed text-sand">
                {p.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
