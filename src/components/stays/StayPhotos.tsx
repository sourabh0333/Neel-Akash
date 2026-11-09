"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import type { Stay } from "@/lib/site";
import Reveal from "../ui/Reveal";

/**
 * Inside the stay, from its own photographs: a grid read row by row (upright
 * pictures take two rows) where each
 * picture opens out from a smaller rounded window as it arrives, and any
 * picture opens large in a viewer (arrow keys step, Esc closes).
 *
 * Only shown for stays that have a `photos` set.
 */
export default function StayPhotos({ stay }: { stay: Stay }) {
  const root = useRef<HTMLElement>(null);
  const photos = stay.photos ?? [];
  const [open, setOpen] = useState<number | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".sp-tile").forEach((t, i) => {
        gsap
          .timeline({ scrollTrigger: { trigger: t, start: "top 90%", once: true }, delay: (i % 3) * 0.08 })
          .fromTo(
            t,
            { opacity: 0, y: 50, clipPath: "inset(8% 6% 8% 6% round 24px)" },
            { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 18px)", duration: 1.1, ease: "power3.out" }
          )
          .fromTo(t.querySelector(".sp-img"), { scale: 1.18 }, { scale: 1, duration: 1.5, ease: "power3.out" }, 0);
      });
    },
    { scope: root }
  );

  // The viewer: hold the page still, step with the arrow keys, close on Esc.
  useEffect(() => {
    if (open === null) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open, photos.length]);

  if (!photos.length) return null;
  const current = open === null ? null : photos[open];
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  return (
    <section ref={root} id="stay-photos" aria-label={`Photographs of the ${stay.name.toLowerCase()}`} className="border-t border-bone/10 bg-ink py-24 md:py-32">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Inside the {stay.name.toLowerCase()}
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              See it <span className="italic text-ember-300">before you come</span>
            </Reveal>
          </div>
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-sand-dim">
            <span className="font-display text-3xl normal-case tracking-normal text-bone tabular-nums">
              {String(photos.length).padStart(2, "0")}
            </span>{" "}
            photographs · tap to enlarge
          </p>
        </div>

        <ul className="grid grid-flow-row-dense auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-3 lg:gap-5">
          {photos.map((p, i) => (
            <li key={p.src} className={p.tall ? "row-span-2" : ""}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                data-cursor="View"
                aria-label={`Enlarge: ${p.alt}`}
                className="sp-tile group relative block h-full w-full overflow-hidden rounded-[18px] bg-abyss"
              >
                <span className="sp-img absolute inset-0 block">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
                  />
                </span>
                <span className="absolute inset-0 bg-linear-to-t from-abyss/75 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute left-4 top-4 rounded-full bg-abyss/60 px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-bone backdrop-blur-md tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="absolute inset-x-4 bottom-4 translate-y-2 text-left text-sm leading-snug text-bone opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.alt}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── The viewer ── */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-[97] flex flex-col bg-abyss/95 backdrop-blur-xl"
          onClick={() => setOpen(null)}
        >
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <span className="text-[0.62rem] uppercase tracking-[0.24em] text-sand tabular-nums">
              {stay.name} · {String(open! + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 text-bone transition-colors hover:border-ember-400"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image key={current.src} src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain px-4 md:px-20" />
            {[-1, 1].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => step(d)}
                aria-label={d < 0 ? "Previous photo" : "Next photo"}
                className={`absolute top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/20 bg-abyss/60 text-bone backdrop-blur-md transition-colors hover:border-ember-400 ${
                  d < 0 ? "left-3 md:left-6" : "right-3 md:right-6"
                }`}
              >
                <span aria-hidden="true">{d < 0 ? "←" : "→"}</span>
              </button>
            ))}
          </div>
          <p className="px-5 py-5 text-center text-sm text-sand md:px-8">{current.alt}</p>
        </div>
      )}
    </section>
  );
}
