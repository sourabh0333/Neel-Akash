"use client";

import type Lenis from "lenis";

/**
 * Lenis drives scrolling from its own wheel/touch handlers, so
 * `body { overflow: hidden }` alone does not stop the page moving behind an
 * open overlay — Lenis has to be told to stop as well.
 *
 * Locks are counted, because more than one thing can want the page held
 * still at once (the title card and an open menu, say); the page only starts
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

/** For unmount paths that cannot guarantee a matching unlock. */
export function resetScrollLock() {
  locks = 0;
  lenis?.start();
  document.body.style.removeProperty("overflow");
}
