"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { experiences } from "@/lib/site";

/**
 * The set-piece. The section pins and a single frame cross-dissolves through
 * four scenes as you scroll, with the copy swapping in step and a progress
 * rail tracking position — scroll used the way an editor uses a timeline.
 *
 * Below 900px the pin is dropped entirely and the scenes stack normally.
 */
export default function Experiences() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px)", () => {
        const r = root.current;
        if (!r) return;

        const scenes = gsap.utils.toArray<HTMLElement>(".xp-scene");
        const copies = gsap.utils.toArray<HTMLElement>(".xp-copy");
        const n = scenes.length;

        gsap.set(scenes.slice(1), { autoAlpha: 0, scale: 1.12 });
        gsap.set(copies.slice(1), { autoAlpha: 0, yPercent: 40 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: r,
            start: "top top",
            end: () => `+=${window.innerHeight * n * 0.9}`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        for (let i = 1; i < n; i++) {
          const at = i - 1;
          tl.to(scenes[i - 1], { autoAlpha: 0, scale: 0.94, duration: 1 }, at)
            .to(
              scenes[i],
              { autoAlpha: 1, scale: 1, duration: 1 },
              at
            )
            .to(
              copies[i - 1],
              { autoAlpha: 0, yPercent: -40, duration: 0.7 },
              at
            )
            .to(
              copies[i],
              { autoAlpha: 1, yPercent: 0, duration: 0.7 },
              at + 0.3
            );
        }

        // Progress rail
        gsap.to(".xp-rail-fill", {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: r,
            start: "top top",
            end: () => `+=${window.innerHeight * n * 0.9}`,
            scrub: true,
          },
        });

        // Slow push-in on whichever frame is showing.
        gsap.to(".xp-scene img", {
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: r,
            start: "top top",
            end: () => `+=${window.innerHeight * n * 0.9}`,
            scrub: true,
          },
        });

        return () => tl.scrollTrigger?.kill();
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="experiences"
      className="relative bg-ink lg:h-[100svh] lg:overflow-hidden"
    >
      {/* ── Desktop: pinned cross-dissolve ── */}
      <div className="relative hidden h-full lg:block">
        <div className="absolute inset-0">
          {experiences.map((x) => (
            <div key={x.index} className="xp-scene absolute inset-0">
              <Image
                src={x.image}
                alt={x.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-r from-abyss via-abyss/60 to-abyss/10" />
              <div className="absolute inset-0 bg-linear-to-t from-abyss/90 via-transparent to-abyss/60" />
            </div>
          ))}
        </div>

        <div className="relative mx-auto flex h-full max-w-[100rem] items-center px-10">
          {/* Progress rail */}
          <div className="absolute left-10 top-1/2 h-40 w-px -translate-y-1/2 bg-bone/15">
            <div className="xp-rail-fill h-full w-full origin-top scale-y-0 bg-ember-400" />
          </div>

          <div className="relative ml-16 h-[26rem] w-full max-w-[46rem]">
            {experiences.map((x) => (
              <div
                key={x.index}
                className="xp-copy absolute inset-0 flex flex-col justify-center"
              >
                <div className="flex items-center gap-5">
                  <span className="font-display text-4xl text-ember-400">
                    {x.index}
                  </span>
                  <span className="h-px w-14 bg-ember-500/60" />
                  <span className="font-sans text-[0.7rem] tracking-[0.3em] text-sand-dim tabular-nums">
                    {x.time}
                  </span>
                </div>

                <h3 className="font-display t-huge mt-6 text-bone">{x.title}</h3>

                <p className="mt-7 max-w-[44ch] text-lg leading-relaxed text-sand">
                  {x.copy}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-8 right-10 text-[0.6rem] uppercase tracking-[0.3em] text-sand-dim">
          A day here
        </p>
      </div>

      {/* ── Mobile: honest vertical stack ── */}
      <div className="lg:hidden">
        <div className="px-6 pt-24">
          <p className="t-eyebrow text-ember-500">A day here</p>
        </div>
        {experiences.map((x) => (
          <article key={x.index} className="relative px-6 py-10">
            <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm">
              <Image
                src={x.image}
                alt={x.title}
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl text-ember-400">
                    {x.index}
                  </span>
                  <span className="h-px w-8 bg-ember-500/60" />
                  <span className="text-[0.62rem] tracking-[0.24em] text-sand-dim tabular-nums">
                    {x.time}
                  </span>
                </div>
                <h3 className="font-display t-big mt-3 text-bone">{x.title}</h3>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-sand">{x.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
