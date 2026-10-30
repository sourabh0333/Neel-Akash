"use client";

import { useEffect, useState } from "react";
import { ghat } from "@/lib/site";

const KEY = "pbc-arrive-chip-closed";
const parking = ghat.facilities.find((f) => f.id === "parking")!;

/**
 * A small floating reminder for anyone driving down: parking at the ghat and
 * the camp's booking counter, linking to the full section on Getting Here.
 *
 * It waits until the visitor has scrolled past the opening screen, steps
 * aside while that section itself is on screen, and once closed stays closed
 * (remembered in this browser only).
 */
export default function ArriveChip() {
  const [closed, setClosed] = useState(true);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let wasClosed = false;
    try {
      wasClosed = localStorage.getItem(KEY) === "1";
    } catch {
      // Storage blocked: just show it.
    }
    setClosed(wasClosed);
    if (wasClosed) return;

    let raf = 0;
    const check = () => {
      raf = 0;
      const section = document.getElementById("arrive");
      const r = section?.getBoundingClientRect();
      const onScreen = !!r && r.top < window.innerHeight && r.bottom > 0;
      setShown(window.scrollY > window.innerHeight * 0.8 && !onScreen);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (closed) return null;

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // Storage blocked: it stays closed for this visit.
    }
  };

  return (
    <aside
      aria-label="Parking and booking at the ghat"
      className={`fixed bottom-4 left-4 right-4 z-[60] flex items-center gap-1 rounded-full border border-bone/15 bg-abyss/85 p-1.5 shadow-2xl shadow-abyss backdrop-blur-xl transition-all duration-500 sm:right-auto md:bottom-6 md:left-6 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <a
        href="/getting-here#arrive"
        tabIndex={shown ? 0 : -1}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-bone/5"
      >
        <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-neel-500 font-display text-base text-bone ring-2 ring-abyss">
            P
          </span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-ember-400 text-abyss ring-2 ring-abyss">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 4 3 19h18L12 4Zm0 7 3.6 6H8.4L12 11Z" />
            </svg>
          </span>
        </span>
        <span className="min-w-0 text-[0.72rem] leading-tight text-sand">
          <span className="block truncate text-bone">
            Driving? Parking {parking.price}/night at the ghat
          </span>
          <span className="block truncate text-sand-dim">
            Our booking counter is at {ghat.name}{" "}
            <span className="text-ember-300 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              &rarr;
            </span>
          </span>
        </span>
      </a>
      <button
        type="button"
        onClick={close}
        tabIndex={shown ? 0 : -1}
        aria-label="Close this reminder"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sand-dim transition-colors hover:bg-bone/10 hover:text-bone"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </aside>
  );
}
