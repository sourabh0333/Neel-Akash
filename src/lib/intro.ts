"use client";

/**
 * A latched hand-off between the title card and the hero.
 *
 * A plain CustomEvent is racy: anything that subscribes after the event has
 * already fired waits forever, and in dev React mounts effects twice. This
 * latches instead — subscribe late and your callback runs immediately.
 *
 * There is also a hard safety net: if the title card never reports finishing
 * (an animation error, a killed timeline), the signal fires anyway so the
 * hero content can never be stranded invisible.
 */

let done = false;
let waiters: Array<() => void> = [];
let safety: ReturnType<typeof setTimeout> | null = null;

const SAFETY_MS = 6000;

export function markIntroDone() {
  if (done) return;
  done = true;
  if (safety) {
    clearTimeout(safety);
    safety = null;
  }
  const queue = waiters;
  waiters = [];
  queue.forEach((fn) => fn());
}

export function onIntroDone(cb: () => void): () => void {
  if (done) {
    cb();
    return () => {};
  }
  waiters.push(cb);

  if (safety === null && typeof window !== "undefined") {
    safety = setTimeout(markIntroDone, SAFETY_MS);
  }

  return () => {
    waiters = waiters.filter((fn) => fn !== cb);
  };
}

/** Test/HMR escape hatch — lets a fresh mount replay the sequence. */
export function resetIntro() {
  done = false;
  waiters = [];
  if (safety) {
    clearTimeout(safety);
    safety = null;
  }
}
