"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, splitWords, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";

const STATEMENT =
  "Two hours past the last railhead, the road gives up and a boat takes over. What is on the other side is an island of four villages, a great deal of sky, and a beach that most of West Bengal has still not heard about.";

const MARQUEE = [
  "Sea-facing tents",
  "Bonfire nights",
  "Home kitchen",
  "Boat rides",
  "Bird island",
  "No crowds",
];

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current?.querySelector<HTMLElement>(".statement");
      if (!el) return;

      if (prefersReducedMotion()) {
        gsap.set(el, { color: "var(--color-bone)" });
        return;
      }

      const { targets } = splitWords(el);

      // Words warm from dim sand to bone as the section crosses the viewport —
      // reading pace is driven by the scrollbar, not a fixed duration.
      gsap.fromTo(
        targets,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.55,
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: root }
  );

  return (
    <section className="relative bg-abyss py-28 md:py-40" ref={root}>
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <p className="t-eyebrow text-ember-500">The place</p>
            <p className="font-bn mt-4 text-2xl text-sand-dim">{site.nameBn}</p>
            <p className="mt-2 text-sm text-sand-dim">{site.name}</p>
          </div>

          <div className="lg:col-span-9">
            <p className="statement font-display text-[clamp(1.6rem,3.4vw,3rem)] leading-[1.18] text-bone">
              {STATEMENT}
            </p>
          </div>
        </div>
      </div>

      {/* Infinite marquee — the "living presence" pattern, kept slow */}
      <div className="relative mt-24 overflow-hidden border-y border-bone/10 py-6">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0" aria-hidden={dup === 1}>
              {MARQUEE.map((m) => (
                <span
                  key={m}
                  className="flex items-center gap-8 whitespace-nowrap px-8 font-display text-2xl text-sand-dim md:text-3xl"
                >
                  {m}
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-ember-500" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
