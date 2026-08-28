"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/anim";

/**
 * Desktop-only cursor: a small dot that tracks exactly, plus a lagging ring
 * that swells and labels itself over anything interactive.
 * Touch devices never mount it (and keep their native cursor via CSS).
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;

    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    if (!d || !r || !l) return;

    document.documentElement.classList.add("cursor-host");
    gsap.set([d, r], { xPercent: -50, yPercent: -50, opacity: 0 });

    const xD = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const yD = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
    const xR = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const yR = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });

    let shown = false;
    const onMove = (e: PointerEvent) => {
      if (!shown) {
        shown = true;
        gsap.to([d, r], { opacity: 1, duration: 0.35 });
      }
      xD(e.clientX);
      yD(e.clientY);
      xR(e.clientX);
      yR(e.clientY);
    };

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor]"
      ) as HTMLElement | null;

      if (t) {
        const text = t.dataset.cursor ?? "";
        l.textContent = text;
        gsap.to(r, {
          scale: text ? 2.6 : 1.9,
          borderColor: "rgba(243,156,74,0.9)",
          backgroundColor: "rgba(243,156,74,0.08)",
          duration: 0.45,
          ease: "power3.out",
        });
        gsap.to(d, { scale: 0, duration: 0.3 });
        gsap.to(l, { opacity: 1, duration: 0.3 });
      } else {
        gsap.to(r, {
          scale: 1,
          borderColor: "rgba(244,239,230,0.4)",
          backgroundColor: "rgba(0,0,0,0)",
          duration: 0.45,
          ease: "power3.out",
        });
        gsap.to(d, { scale: 1, duration: 0.3 });
        gsap.to(l, { opacity: 0, duration: 0.2 });
      }
    };

    const onLeave = () => {
      shown = false;
      gsap.to([d, r], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      document.documentElement.classList.remove("cursor-host");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95]">
      <div
        ref={dot}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-ember-400"
      />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-bone/40"
      >
        <span
          ref={label}
          className="select-none text-[0.42rem] font-medium uppercase tracking-[0.18em] text-ember-300 opacity-0"
        />
      </div>
    </div>
  );
}
