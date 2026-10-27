"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { meals } from "@/lib/site";
import Reveal from "../ui/Reveal";

/**
 * What a tent or cottage night includes, as one day's line: it draws itself
 * across as you scroll, and each meal lights up as the line reaches it.
 */
export default function StaysIncluded() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const stops = gsap.utils.toArray<HTMLElement>(".si-stop");
      // The line runs across on wide screens and down on narrow ones.
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" }, (ctx) => {
        const prop = ctx.conditions?.wide ? "scaleX" : "scaleY";
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".si-line-wrap", start: "top 80%", end: "bottom 45%", scrub: 0.6 },
        });
        tl.fromTo(".si-line", { [prop]: 0 }, { [prop]: 1, ease: "none", duration: stops.length });
        stops.forEach((stop, i) => {
          tl.fromTo(
            stop,
            { opacity: 0.25, y: 16 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
            i
          ).fromTo(
            stop.querySelector(".si-dot"),
            { scale: 0.4, backgroundColor: "#8d8577" },
            { scale: 1, backgroundColor: "#f39c4a", duration: 0.4 },
            i
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative border-y border-bone/10 bg-ink py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              In the price
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Every meal, <span className="italic text-ember-300">cooked here</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            A tent or cottage night runs from a welcome drink to the next
            morning&rsquo;s breakfast, cooked by the family.
          </Reveal>
        </div>

        <div className="si-line-wrap relative mt-20 md:mt-28">
          {/* The day's line: across on wide screens, down on narrow ones. */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-bone/10 lg:left-0 lg:right-0 lg:top-[7px] lg:bottom-auto lg:h-px lg:w-auto">
            <div className="si-line h-full w-full origin-top bg-ember-400 lg:origin-left" />
          </div>

          <ol className="relative grid gap-12 lg:grid-cols-5 lg:gap-8">
            {meals.map((m) => (
              <li key={m.label} className="si-stop relative pl-10 lg:pl-0 lg:pt-12">
                <span className="si-dot absolute left-0 top-0 h-[15px] w-[15px] rounded-full bg-ember-400 ring-4 ring-ink" />
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ember-400 tabular-nums">
                  {m.time}
                </p>
                <h3 className="font-display mt-3 text-3xl text-bone">{m.label}</h3>
                <p lang="bn" className="font-bn mt-1 text-sm text-sand-dim">
                  {m.bn}
                </p>
                <p className="mt-4 max-w-[30ch] text-sm leading-relaxed text-sand">
                  {m.dishes.map((d) => d.name).join(" · ")}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <a
          href="/menu"
          className="link-draw mt-16 inline-flex items-center gap-2 text-sm text-ember-300"
        >
          See the full menu <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </section>
  );
}
