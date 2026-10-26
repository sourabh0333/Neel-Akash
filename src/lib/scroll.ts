"use client";

import type Lenis from "lenis";

/**
 * Lenis drives scrolling from its own wheel/touch handlers, so
 * `body { overflow: hidden }` alone does not stop the page moving behind an
 * open overlay — Lenis has to be told to stop as well.
 *
 * Locks are counted, because more than one thing can want the page held
 * still at once (an open menu and the photo viewer, say); the page only starts
 * moving again when the last of them releases.
 */

let lenis: Lenis | null = null;
let locks = 0;

export function registerLenis(instance: Lenis | null) {
  lenis = instance;
}

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  lenis?.stop();
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks > 0) return;
  lenis?.start();
  document.body.style.removeProperty("overflow");
}
