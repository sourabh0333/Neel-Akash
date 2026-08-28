"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { gallery } from "@/lib/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import Reveal from "./ui/Reveal";

/**
 * Expanding panels rather than anything that scrolls.
 *
 * The whole roll is on screen at once as a row of tall shutters; whichever one
 * you point at opens and the rest give way, so the section never moves under
 * the reader and never has an offscreen part they have to go hunting for.
 * One panel is always open, so the row reads as a composition rather than a
 * flat set of equal tiles.
 *
 * Below `md` there is no hover to drive it, so the same pictures are laid out
 * as an editorial mosaic instead.
 */

const OPEN = 3.6; // flex-grow of the open panel; the others stay at 1

export default function Gallery() {
  const root = useRef<HTMLElement>(null);
  const panels = useRef<Array<HTMLButtonElement | null>>([]);
  const tiles = useRef<Array<HTMLButtonElement | null>>([]);

  const overlayRef = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  const animating = useRef(false);

  /* ── Open / close the shutters ─────────────────────────────── */
  useGSAP(
    () => {
      const els = panels.current.filter(Boolean) as HTMLElement[];
      if (!els.length) return;

      const reduced = prefersReducedMotion();

      els.forEach((el, i) => {
        const isOn = i === active;
        gsap.to(el, {
          flexGrow: isOn ? OPEN : 1,
          duration: reduced ? 0 : 0.95,
          ease: "power4.out",
          overwrite: "auto",
        });
        gsap.to(el.querySelector(".panel-img"), {
          scale: isOn ? 1 : 1.14,
          filter: isOn ? "brightness(1)" : "brightness(0.55)",
          duration: reduced ? 0 : 1.1,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(el.querySelector(".panel-open"), {
          autoAlpha: isOn ? 1 : 0,
          y: isOn ? 0 : 12,
          duration: reduced ? 0 : 0.6,
          delay: isOn && !reduced ? 0.25 : 0,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(el.querySelector(".panel-shut"), {
          autoAlpha: isOn ? 0 : 1,
          duration: reduced ? 0 : 0.4,
          overwrite: "auto",
        });
      });
    },
    { scope: root, dependencies: [active] }
  );

  /* Entrance — shutters drop in from the top edge. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from(".panel", {
        clipPath: "inset(100% 0% 0% 0%)",
        duration: 1.25,
        stagger: 0.07,
        ease: "power4.out",
        scrollTrigger: { trigger: ".panel-row", start: "top 85%" },
      });
      gsap.from(".mosaic-tile", {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: ".mosaic", start: "top 88%" },
      });
    },
    { scope: root }
  );

  /* ── Expand to the viewer (measured FLIP) ──────────────────── */
  const frameEl = (i: number) => {
    const p = panels.current[i];
    // offsetParent is null for whichever layout is currently display:none.
    if (p && p.offsetParent !== null) return p;
    const t = tiles.current[i];
    if (t && t.offsetParent !== null) return t;
    return null;
  };

  const targetBox = () => {
    const pad = window.innerWidth < 768 ? 16 : 56;
    const w = Math.min(window.innerWidth - pad * 2, 1120);
    const h = Math.min(window.innerHeight - pad * 2 - 72, 740);
    return {
      width: w,
      height: h,
      x: (window.innerWidth - w) / 2,
      y: (window.innerHeight - h) / 2 - 20,
    };
  };

  const openAt = useCallback((i: number) => {
    const el = frameEl(i);
    const ov = overlayRef.current;
    if (!el || !ov || animating.current) return;

    animating.current = true;
    openRef.current = i;
    setOpen(i);

    const r = el.getBoundingClientRect();
    const t = targetBox();

    gsap.set(ov, {
      display: "block",
      x: r.left,
      y: r.top,
      width: r.width,
      height: r.height,
    });
    gsap.set(backdrop.current, { display: "block", opacity: 0 });
    gsap.set(chrome.current, { opacity: 0, y: 12 });

    gsap
      .timeline({ onComplete: () => (animating.current = false) })
      .to(backdrop.current, { opacity: 1, duration: 0.5 }, 0)
      .to(ov, { ...t, duration: 0.85, ease: "power4.inOut" }, 0)
      .to(chrome.current, { opacity: 1, y: 0, duration: 0.5 }, 0.45);
  }, []);

  const close = useCallback(() => {
    const i = openRef.current;
    const ov = overlayRef.current;
    if (i === null || !ov || animating.current) return;

    animating.current = true;
    const r = frameEl(i)?.getBoundingClientRect();

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(ov, { display: "none" });
          gsap.set(backdrop.current, { display: "none" });
          animating.current = false;
          openRef.current = null;
          setOpen(null);
        },
      })
      .to(chrome.current, { opacity: 0, y: 10, duration: 0.25 }, 0)
      .to(backdrop.current, { opacity: 0, duration: 0.6 }, 0.1)
      .to(
        ov,
        r
          ? {
              x: r.left,
              y: r.top,
              width: r.width,
              height: r.height,
              duration: 0.7,
              ease: "power4.inOut",
            }
          : { opacity: 0, duration: 0.4 },
        0
      );
  }, []);

  const step = useCallback((dir: number) => {
    const i = openRef.current;
    if (i === null || animating.current) return;
    const next = (i + dir + gallery.length) % gallery.length;
    openRef.current = next;
    setActive(next); // keep the row behind the viewer in sync

    const imgs = overlayRef.current?.querySelectorAll<HTMLElement>(".ov-img");
    if (!imgs) return;
    gsap.to(imgs[i], { autoAlpha: 0, duration: 0.4 });
    gsap.fromTo(
      imgs[next],
      { autoAlpha: 0, scale: 1.05 },
      { autoAlpha: 1, scale: 1, duration: 0.65, ease: "power3.out" }
    );
    setOpen(next);
  }, []);

  const isOpen = open !== null;

  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close, step]);

  return (
    <section ref={root} className="relative bg-ink py-24 md:py-28">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <Reveal as="h2" className="font-display t-big text-bone">
            Sea, sand,
            <span className="italic text-neel-300"> and very little else</span>
          </Reveal>
          <Reveal
            as="p"
            mode="fade"
            className="flex items-center gap-3 text-[0.64rem] uppercase tracking-[0.24em] text-sand-dim"
          >
            <span className="hidden h-px w-8 bg-ember-500 sm:block" />
            {String(active + 1).padStart(2, "0")} &nbsp;/&nbsp;{" "}
            {String(gallery.length).padStart(2, "0")}
          </Reveal>
        </div>

        {/* ── Shutters (md and up) ── */}
        <div
          className="panel-row hidden h-[clamp(24rem,58vh,34rem)] gap-2 md:flex"
          onPointerLeave={() => setActive(0)}
        >
          {gallery.map((g, i) => (
            <button
              key={g.src}
              ref={(el) => {
                panels.current[i] = el;
              }}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => openAt(i)}
              data-cursor="Open"
              aria-label={`Enlarge: ${g.alt}`}
              className="panel group/p relative min-w-0 basis-0 overflow-hidden rounded-sm bg-abyss"
              style={{ flexGrow: i === 0 ? OPEN : 1 }}
            >
              <span className="panel-img absolute inset-0 block">
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </span>

              <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-abyss/90 via-abyss/10 to-transparent" />

              {/* Closed: the place name, set vertically along the panel */}
              <span className="panel-shut pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
                <span className="font-display whitespace-nowrap text-lg text-bone [writing-mode:vertical-rl] [text-orientation:mixed]">
                  {g.place}
                </span>
              </span>

              {/* Open: the full caption */}
              <span className="panel-open pointer-events-none absolute inset-x-0 bottom-0 p-7 text-left">
                <span className="block text-[0.56rem] uppercase tracking-[0.3em] text-ember-400 tabular-nums">
                  Frame {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-2 block font-display text-3xl text-bone">
                  {g.place}
                </span>
                <span className="mt-2 block max-w-[34ch] text-sm leading-snug text-sand">
                  {g.alt}
                </span>
              </span>

              <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-bone/35" />
            </button>
          ))}
        </div>

        {/* ── Editorial mosaic (below md) ── */}
        <div className="mosaic grid grid-cols-2 gap-3 md:hidden">
          {gallery.map((g, i) => (
            <button
              key={g.src}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              onClick={() => openAt(i)}
              aria-label={`Enlarge: ${g.alt}`}
              className={`mosaic-tile relative overflow-hidden rounded-sm bg-abyss ${
                i === 0 || i === 5 ? "col-span-2 aspect-16/10" : "aspect-3/4"
              }`}
            >
              <Image
                src={g.src}
                alt={g.alt}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <span className="absolute inset-0 bg-linear-to-t from-abyss/85 to-transparent" />
              <span className="absolute inset-x-3 bottom-3 text-left">
                <span className="block font-display text-base text-bone">
                  {g.place}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Expanded viewer ── */}
      <div
        ref={backdrop}
        onClick={close}
        aria-hidden={!isOpen}
        className="fixed inset-0 z-[97] hidden bg-abyss/94 backdrop-blur-xl"
      />
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Photograph viewer"
        className="fixed left-0 top-0 z-[98] hidden overflow-hidden rounded-sm will-change-transform"
      >
        {gallery.map((g, i) => (
          <div
            key={g.src}
            className="ov-img absolute inset-0"
            style={{
              opacity: i === open ? 1 : 0,
              visibility: i === open ? "visible" : "hidden",
            }}
          >
            <Image src={g.src} alt={g.alt} fill sizes="100vw" className="object-cover" />
          </div>
        ))}
      </div>

      <div
        ref={chrome}
        className={`pointer-events-none fixed inset-x-0 bottom-0 z-[99] px-6 pb-6 md:px-10 ${
          isOpen ? "" : "hidden"
        }`}
      >
        <div className="mx-auto flex max-w-[70rem] items-end justify-between gap-6">
          <p className="max-w-[40ch] text-sm leading-snug text-sand">
            {open !== null && (
              <>
                <span className="text-bone">{gallery[open].place}</span> &mdash;{" "}
                {gallery[open].alt}
              </>
            )}
          </p>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => step(-1)}
              aria-label="Previous frame"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
            >
              &larr;
            </button>
            <span className="px-2 text-[0.64rem] tracking-[0.2em] text-sand-dim tabular-nums">
              {open !== null ? String(open + 1).padStart(2, "0") : "00"} /{" "}
              {String(gallery.length).padStart(2, "0")}
            </span>
            <button
              onClick={() => step(1)}
              aria-label="Next frame"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
            >
              &rarr;
            </button>
            <button
              onClick={close}
              aria-label="Close viewer"
              className="ml-2 flex h-11 w-11 items-center justify-center rounded-full border border-bone/25 text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
            >
              &#10005;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
