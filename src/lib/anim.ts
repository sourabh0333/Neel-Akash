"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * GSAP is registered once, on the client only.
 * Every plugin here is free for commercial use (GSAP 3.13+, Webflow).
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // A slightly slower baseline than GSAP's default — luxury reads as unhurried.
  gsap.defaults({ ease: "power3.out", duration: 1.1 });
}

export { gsap, ScrollTrigger, SplitText };

/** ~25% of macOS/iOS users have this on. Respect it. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Coarse pointer / small screen — skip the expensive parallax work. */
export const isTouchOrSmall = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(max-width: 900px)").matches ||
    window.matchMedia("(hover: none)").matches);

/**
 * Split an element into masked lines and return the inner line elements.
 * Falls back to the element itself if SplitText can't run.
 */
export function splitLines(el: HTMLElement): {
  targets: Element[];
  revert: () => void;
} {
  try {
    const split = new SplitText(el, {
      type: "lines",
      linesClass: "line-inner",
      mask: "lines",
    });
    return { targets: split.lines, revert: () => split.revert() };
  } catch {
    return { targets: [el], revert: () => {} };
  }
}

/** Split into words — used for the scroll-scrubbed statement blocks. */
export function splitWords(el: HTMLElement): {
  targets: Element[];
  revert: () => void;
} {
  try {
    const split = new SplitText(el, { type: "words", wordsClass: "word" });
    return { targets: split.words, revert: () => split.revert() };
  } catch {
    return { targets: [el], revert: () => {} };
  }
}
