"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { registerLenis } from "@/lib/scroll";

/**
 * Lenis mounted at the root, driven by GSAP's ticker so scroll-linked
 * animations and smooth scrolling share one rAF loop (no scroll-jank,
 * no double-rAF drift).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.15,
      // Long, soft ease-out — the "expensive" feel.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native inertia on touch beats an emulated one.
      syncTouch: false,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Same-page anchor links ("#part", or "/page#part" while already on that
    // page) must go through Lenis or they teleport.
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest?.(
        "a[href]"
      ) as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.href);
      if (
        !url.hash ||
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname
      )
        return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      e.preventDefault();
      history.replaceState(null, "", url.hash);
      // force: the mobile menu stops Lenis while open, and closes on this click.
      lenis.scrollTo(target, { offset: 0, duration: 1.6, force: true });
    };
    document.addEventListener("click", onClick);

    // Trigger positions drift after fonts and images land.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    // Arriving from another page on "/page#part": the browser jumps to the
    // target early, then pinned sections above it gain their spacing and
    // push it down, and each ScrollTrigger refresh can move the page again.
    // So for the first few seconds, re-aim after every refresh — unless the
    // visitor has started scrolling, who must never be dragged back.
    const hashTarget = () =>
      window.location.hash
        ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
        : null;
    const aim = () => {
      const target = hashTarget();
      if (target) lenis.scrollTo(target, { offset: 0, immediate: true, force: true });
    };
    const intents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    const stopAiming = () => {
      ScrollTrigger.removeEventListener("refresh", aim);
      intents.forEach((t) => window.removeEventListener(t, stopAiming));
    };
    if (hashTarget()) {
      ScrollTrigger.addEventListener("refresh", aim);
      intents.forEach((t) => window.addEventListener(t, stopAiming, { passive: true }));
    }
    const settle = window.setTimeout(stopAiming, 4000);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("load", refresh);
      window.clearTimeout(settle);
      stopAiming();
      gsap.ticker.remove(raf);
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
