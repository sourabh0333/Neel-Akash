"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { journey, site } from "@/lib/site";

/**
 * The route drawn as an actual route.
 *
 * The line is built from per-step segments inside each row's rail column, so
 * it is anchored to the nodes by construction and cannot drift away from them.
 * (The previous version was one stretched SVG curve laid beside the list: it
 * wandered ±29px while the dots stayed put, so it never joined them up.)
 *
 * Each segment fills as you scroll past it and hands over to the next, and a
 * station lights up the moment the line reaches it — so the page is travelled
 * rather than merely read.
 */

/** Half the node's height — where the line meets it. */
const NODE_MID = "1.375rem";

const icons: Record<string, React.ReactNode> = {
  Rail: (
    <>
      <path d="M9 3.5v17M15 3.5v17" />
      <path d="M6 7h12M6 12h12M6 17h12" />
    </>
  ),
  Road: (
    <>
      <path d="M2.5 15.5V9h10.5v6.5" />
      <path d="M13 11h3.6l3 3.2v1.3H13" />
      <circle cx="7" cy="16.6" r="1.7" />
      <circle cx="16.4" cy="16.6" r="1.7" />
    </>
  ),
  River: (
    <>
      <path d="M3 9.5q3-3 6 0t6 0t6 0" />
      <path d="M3 14.5q3-3 6 0t6 0t6 0" />
      <path d="M3 19q3-3 6 0t6 0t6 0" />
    </>
  ),
  Arrival: (
    <>
      <path d="M12 4.5 4 19.5h16L12 4.5Z" />
      <path d="M12 19.5v-8" />
    </>
  ),
};

export default function Journey() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".step");
      if (!steps.length) return;

      const reduced = prefersReducedMotion();

      steps.forEach((step, i) => {
        const fill = step.querySelector<HTMLElement>(".seg-fill");
        const node = step.querySelector<HTMLElement>(".node");
        const glow = step.querySelector<HTMLElement>(".node-glow");

        // Content arrives.
        gsap.from(step.querySelectorAll(".step-in"), {
          opacity: 0,
          y: 22,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: { trigger: step, start: "top 82%" },
        });

        // The line draws through this row, scrubbed by scroll position.
        if (fill && !reduced) {
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: step,
                start: "top 72%",
                end: "bottom 62%",
                scrub: 0.5,
              },
            }
          );
        } else if (fill) {
          gsap.set(fill, { scaleY: 1 });
        }

        // The station lights up as the line reaches it.
        const light = (on: boolean) => {
          gsap.to(node, {
            borderColor: on ? "var(--color-ember-400)" : "rgba(244,239,230,0.18)",
            color: on ? "var(--color-ember-300)" : "var(--color-sand-dim)",
            duration: reduced ? 0 : 0.45,
            ease: "power2.out",
          });
          gsap.to(glow, {
            opacity: on ? 1 : 0,
            scale: on ? 1 : 0.6,
            duration: reduced ? 0 : 0.6,
            ease: "power3.out",
          });
        };

        ScrollTrigger.create({
          trigger: step,
          start: "top 70%",
          onEnter: () => light(true),
          onLeaveBack: () => light(i === 0),
        });
      });
    },
    { scope: root }
  );

  const last = journey.length - 1;

  return (
    <section
      ref={root}
      id="journey"
      className="relative bg-abyss pb-28 md:pb-36"
    >
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <ol className="relative">
          {journey.map((j, i) => (
            <li
              key={j.step}
              className="step grid grid-cols-[3rem_1fr] gap-5 md:grid-cols-[4.5rem_1fr] md:gap-9"
            >
              {/* ── Rail column: track, fill and station ── */}
              <div className="relative flex justify-center">
                {/* Track — starts at the first node, stops at the last */}
                <span
                  aria-hidden="true"
                  className="absolute w-px bg-bone/12"
                  style={{
                    top: i === 0 ? NODE_MID : 0,
                    bottom: i === last ? `calc(100% - ${NODE_MID})` : 0,
                  }}
                />
                {/* Fill — identical geometry, so it can never drift */}
                <span
                  aria-hidden="true"
                  className="seg-fill absolute w-px origin-top bg-linear-to-b from-ember-500 to-ember-400"
                  style={{
                    top: i === 0 ? NODE_MID : 0,
                    bottom: i === last ? `calc(100% - ${NODE_MID})` : 0,
                  }}
                />

                <span className="absolute top-0 flex h-11 w-11 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="node-glow absolute inset-0 scale-[0.6] rounded-full bg-ember-500/18 opacity-0 blur-[6px]"
                  />
                  <span className="node relative flex h-11 w-11 items-center justify-center rounded-full border border-bone/18 bg-ink text-sand-dim">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-[1.15rem] w-[1.15rem]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {icons[j.mode]}
                    </svg>
                  </span>
                </span>
              </div>

              {/* ── Content ── */}
              <div className="pb-12 md:pb-14">
                <div className="step-in flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="font-sans text-[0.6rem] tracking-[0.3em] text-ember-500 tabular-nums">
                    {j.step}
                  </span>
                  <span className="text-[0.6rem] uppercase tracking-[0.26em] text-sand-dim">
                    {j.mode}
                  </span>
                  <span className="ml-auto text-[0.68rem] uppercase tracking-[0.14em] text-sand-dim tabular-nums">
                    {j.duration}
                  </span>
                </div>

                <h3 className="step-in mt-2 font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-tight text-bone">
                  {j.title}
                </h3>

                <p className="step-in mt-3 max-w-[52ch] text-sm leading-relaxed text-sand">
                  {j.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/12 pt-8">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Map"
            className="link-draw text-sm text-bone"
          >
            Open {site.location.island} in Google Maps ↗
          </a>
          <span className="hidden h-4 w-px bg-bone/20 sm:block" />
          <p className="text-sm text-sand-dim">{site.location.full}</p>
        </div>
      </div>
    </section>
  );
}
