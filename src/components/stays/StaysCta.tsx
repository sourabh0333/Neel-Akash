"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";
import Magnetic from "../ui/Magnetic";

/**
 * The close: a photograph that opens from a slot as you arrive, with the
 * proprietor's number set large across it — booking here is a phone call.
 */
export default function StaysCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const st = { trigger: root.current, start: "top bottom", end: "center center", scrub: true };
      gsap.fromTo(
        ".sx-frame",
        { clipPath: "inset(30% 22% 30% 22% round 32px)" },
        { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none", scrollTrigger: st }
      );
      gsap.fromTo(".sx-img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: st });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss px-4 pb-24 md:px-6 md:pb-32">
      <div className="sx-frame relative overflow-hidden rounded-3xl">
        <div className="sx-img absolute inset-0">
          <Image src="/images/stay-family.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-abyss/65" />

        <div className="relative mx-auto flex min-h-[80svh] max-w-[100rem] flex-col justify-center px-6 py-24 md:px-10">
          <p className="t-eyebrow text-ember-400">Booking is a phone call</p>
          <a
            href={`tel:${site.owner.phoneRaw}`}
            data-cursor="Call"
            className="font-display mt-6 block text-[clamp(2.6rem,9vw,8.5rem)] leading-[0.95] text-bone transition-colors duration-500 hover:text-ember-300"
          >
            {site.owner.phone}
          </a>
          <p className="mt-6 max-w-[48ch] text-sand">
            Ask {site.owner.name} for dates and the boat. Off-season and
            larger-group rates are negotiable &mdash; nothing is paid online.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Magnetic strength={0.3}>
              <a
                href={`https://wa.me/${site.owner.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
              >
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href="/contact"
                data-cursor="Book"
                className="inline-flex items-center gap-3 rounded-full border border-bone/30 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
              >
                Check availability
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
