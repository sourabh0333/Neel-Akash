"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";
import Magnetic from "../ui/Magnetic";

/**
 * The close: evening tea, opening out from a slot as you arrive, and the
 * reminder that all of it comes with a tent or cottage night.
 */
export default function MenuCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top bottom", end: "center center", scrub: true };
      gsap.fromTo(
        ".mc-frame",
        { clipPath: "inset(30% 22% 30% 22% round 32px)" },
        { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: st }
      );
      gsap.fromTo(".mc-img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: st });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss px-4 pb-24 md:px-6 md:pb-32">
      <div className="mc-frame relative overflow-hidden rounded-3xl">
        <div className="mc-img absolute inset-0">
          <Image src="/images/dish-telebhaja.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-abyss/65" />

        <div className="relative mx-auto flex min-h-[80svh] max-w-[100rem] flex-col justify-center px-6 py-24 md:px-10">
          <p className="t-eyebrow text-ember-400">All of it, in the price</p>
          <h2 className="font-display t-huge mt-6 max-w-[14ch] text-bone">
            Come hungry, <span className="italic text-ember-300">leave slowly</span>
          </h2>
          <p className="mt-6 max-w-[48ch] text-sand">
            Every meal on this page comes with a tent or cottage night. Tell{" "}
            {site.owner.name} what you eat when you book.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Magnetic strength={0.3}>
              <a
                href="/stays"
                data-cursor="Stay"
                className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
              >
                Find a stay <span aria-hidden="true">&rarr;</span>
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                data-cursor="Call"
                className="inline-flex items-center gap-3 rounded-full border border-bone/30 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
              >
                Call {site.owner.phone}
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
