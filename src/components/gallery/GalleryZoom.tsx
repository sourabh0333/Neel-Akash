"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { gallery, photos } from "@/lib/site";

/**
 * Where each frame sits around the centre one, as % of the stage
 * (left, top, width, height), and how far it zooms. The centre zooms least
 * relative to its size, so it is the one left filling the screen.
 */
const FRAMES: { box: [number, number, number, number]; zoom: number }[] = [
  { box: [37.5, 37.5, 25, 25], zoom: 4 },
  { box: [5, 8, 26, 30], zoom: 5 },
  { box: [69, 10, 25, 24], zoom: 6 },
  { box: [65, 62, 24, 28], zoom: 5 },
  { box: [8, 60, 22, 30], zoom: 6 },
  { box: [41, 4, 18, 26], zoom: 8 },
  { box: [43, 70, 16, 24], zoom: 9 },
];

/**
 * A field of photographs that you scroll *into*: the section pins, and every
 * frame grows from its own centre at its own rate until the middle one fills
 * the screen and its caption arrives.
 */
export default function GalleryZoom() {
  const root = useRef<HTMLElement>(null);

  // The middle frame is the island's first picture; the rest come from the wall.
  const pics = [gallery[0], ...photos.filter((p) => p.src !== gallery[0].src)].slice(0, FRAMES.length);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 0.8,
        },
      });
      gsap.utils.toArray<HTMLElement>(".gz-frame").forEach((f, i) => {
        tl.fromTo(f, { scale: 1 }, { scale: FRAMES[i].zoom, ease: "power1.in", duration: 1 }, 0);
      });
      tl.fromTo(".gz-title", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.3 }, 0.72);
      tl.fromTo(".gz-shade", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7);
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      aria-label="The island, frame by frame"
      className="relative h-[100svh] min-h-[34rem] overflow-hidden bg-abyss"
    >
      {pics.map((p, i) => {
        const [l, t, w, h] = FRAMES[i].box;
        return (
          // Each frame scales around the stage centre, so its wrapper spans the
          // whole stage and the picture sits inside at its own position.
          <div key={p.src} className={`gz-frame absolute inset-0 will-change-transform ${i === 0 ? "z-10" : ""}`}>
            <div
              className="absolute overflow-hidden rounded-xl"
              style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
            >
              {/* The middle frame ends up filling the screen, so it loads full width. */}
              <Image src={p.src} alt={p.alt} fill sizes={i === 0 ? "100vw" : "30vw"} className="object-cover" />
            </div>
          </div>
        );
      })}

      <div className="gz-shade pointer-events-none absolute inset-0 z-20 bg-linear-to-t from-abyss/85 via-abyss/20 to-transparent opacity-0" />

      <div className="gz-title pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto max-w-[100rem] px-6 pb-16 opacity-0 md:px-10 md:pb-24">
        <p className="t-eyebrow text-ember-400">{gallery[0].place}</p>
        <h2 className="font-display t-huge mt-4 text-bone">
          Frame <span className="italic text-neel-300">by frame</span>
        </h2>
        <p className="mt-4 max-w-[40ch] text-sand">{gallery[0].alt}.</p>
      </div>
    </section>
  );
}
