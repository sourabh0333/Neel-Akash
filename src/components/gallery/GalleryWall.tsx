"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, Flip, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { photos, type Photo } from "@/lib/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import Reveal from "../ui/Reveal";

const FILTERS = ["All", "Island", "Stays", "Days"] as const;
type Filter = (typeof FILTERS)[number];

/** A rhythm of shapes so the wall reads as a contact sheet, not a grid. */
const SHAPES = ["aspect-4/5", "aspect-4/3", "aspect-3/4", "aspect-1/1", "aspect-16/11", "aspect-3/4"];

/**
 * Every photograph on the site on one wall. The filters re-flow it with Flip:
 * frames that stay glide to their new places, the rest shrink away and the
 * newcomers grow in. Frames wipe up into view as you reach them. Clicking one
 * opens a full-screen viewer that steps through whatever is showing.
 */
export default function GalleryWall() {
  const root = useRef<HTMLElement>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<number | null>(null);
  const swipe = useRef<number | null>(null);
  const reveals = useRef<ScrollTrigger[]>([]);

  const shown: Photo[] = filter === "All" ? photos : photos.filter((p) => p.group === filter);

  /* Frames wipe up as they arrive. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      reveals.current = ScrollTrigger.batch(".gw-tile", {
        start: "top 92%",
        once: true,
        onEnter: (els) =>
          gsap.fromTo(
            els,
            { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.1, stagger: 0.08, ease: "power4.out", clearProps: "clipPath" }
          ),
      });
    },
    { scope: root }
  );

  const choose = (f: Filter) => {
    if (f === filter) return;
    const tiles = gsap.utils.toArray<HTMLElement>(".gw-tile", root.current);
    if (prefersReducedMotion()) {
      setFilter(f);
      return;
    }
    // Once the wall is being filtered, every frame simply shows: retire the
    // scroll reveals so none of them wipes a frame in late, mid-layout.
    reveals.current.forEach((t) => t.kill());
    reveals.current = [];
    gsap.set(tiles, { clearProps: "clipPath,transform" });
    const state = Flip.getState(tiles);
    // Show and hide directly so Flip can measure the new layout this frame;
    // React state follows for everything else that reads the filter.
    tiles.forEach((t) => {
      t.style.display = f === "All" || t.dataset.group === f ? "" : "none";
    });
    Flip.from(state, {
      duration: 0.8,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.5 }),
      // The page got shorter or taller; re-measure everything below.
      onComplete: () => ScrollTrigger.refresh(),
    });
    setFilter(f);
  };

  /* ── Viewer ── */
  const step = useCallback(
    (dir: number) => setOpen((i) => (i === null ? i : (i + dir + shown.length) % shown.length)),
    [shown.length]
  );

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  useGSAP(
    () => {
      if (open === null || prefersReducedMotion()) return;
      gsap.fromTo(
        ".gv-img",
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", overwrite: true }
      );
    },
    { scope: viewer, dependencies: [open] }
  );

  const current = open === null ? null : shown[open];

  return (
    <section ref={root} className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-12 flex flex-col gap-8 md:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              The wall
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Everything, <span className="italic text-neel-300">on one wall</span>
            </Reveal>
          </div>

          <div role="group" aria-label="Show photographs of" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const n = f === "All" ? photos.length : photos.filter((p) => p.group === f).length;
              const on = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => choose(f)}
                  className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.68rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    on
                      ? "border-ember-400 bg-ember-400 text-abyss"
                      : "border-bone/20 text-sand hover:border-ember-400 hover:text-bone"
                  }`}
                >
                  {f}
                  <span className={`tabular-nums ${on ? "text-abyss/60" : "text-sand-dim"}`}>{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="gw-grid columns-1 gap-4 sm:columns-2 lg:columns-3 lg:gap-5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              data-group={p.group}
              data-cursor="Open"
              style={{ display: filter === "All" || p.group === filter ? undefined : "none" }}
              onClick={() => setOpen(shown.findIndex((s) => s.src === p.src))}
              aria-label={`Enlarge: ${p.alt}`}
              className={`gw-tile group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl bg-ink lg:mb-5 ${SHAPES[i % SHAPES.length]}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-linear-to-t from-abyss/80 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute left-4 top-4 rounded-full border border-bone/25 bg-abyss/40 px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-bone backdrop-blur-md">
                {p.group}
              </span>
              <span className="absolute inset-x-5 bottom-5 translate-y-2 text-left transition-transform duration-500 group-hover:translate-y-0">
                <span className="block font-display text-2xl text-bone">{p.title}</span>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.2em] text-sand-dim opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  Click to enlarge
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Viewer ── */}
      {current && (
        <div
          ref={viewer}
          role="dialog"
          aria-modal="true"
          aria-label="Photograph viewer"
          className="fixed inset-0 z-[97] flex flex-col bg-abyss/95 backdrop-blur-xl"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onPointerDown={(e) => (swipe.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = swipe.current === null ? 0 : e.clientX - swipe.current;
            swipe.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <div className="pointer-events-none relative mx-4 mt-20 flex-1 md:mx-14 md:mt-14">
            <Image
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="100vw"
              className="gv-img object-contain"
            />
          </div>

          <div className="mx-auto flex w-full max-w-[70rem] items-end justify-between gap-6 px-6 py-6 md:px-10">
            <p className="max-w-[44ch] text-sm leading-snug text-sand">
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-ember-400">{current.group}</span>
              <br />
              <span className="font-display text-xl text-bone md:text-2xl">{current.title}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => step(-1)}
                aria-label="Previous photograph"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
              >
                &larr;
              </button>
              <span className="whitespace-nowrap px-1 text-[0.64rem] tracking-[0.2em] text-sand-dim tabular-nums md:px-2">
                {String((open ?? 0) + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => step(1)}
                aria-label="Next photograph"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
              >
                &rarr;
              </button>
              <button
                onClick={() => setOpen(null)}
                aria-label="Close viewer"
                className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
              >
                &#10005;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
