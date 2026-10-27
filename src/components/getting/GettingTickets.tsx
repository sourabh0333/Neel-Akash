"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { journey } from "@/lib/site";
import { Icon } from "../Journey";

const modeName = (mode: string) => (mode === "Arrival" ? "Toto" : mode === "River" ? "Ferry" : mode);

/**
 * The trip as a hand of tickets, one per leg. The section pins; each ticket
 * slides up over the last, which sinks back into the deck, and is stamped as
 * it lands. Without motion (or before the script runs) the tickets simply
 * stack down the page.
 */
export default function GettingTickets() {
  const root = useRef<HTMLElement>(null);
  const [deck, setDeck] = useState(false);

  // Switch to the stacked deck only when it will be animated.
  useGSAP(() => {
    if (!prefersReducedMotion()) setDeck(true);
  });

  useGSAP(
    () => {
      if (!deck) return;
      const tickets = gsap.utils.toArray<HTMLElement>(".gt-ticket");
      const stamps = gsap.utils.toArray<HTMLElement>(".gt-stamp");
      const counter = root.current!.querySelector<HTMLElement>(".gt-count")!;

      // The deck is centred (yPercent -50); waiting tickets sit solid just
      // below the screen and slide up from there.
      gsap.set(tickets, { yPercent: -50 });
      gsap.set(tickets.slice(1), { y: () => window.innerHeight, rotate: 4 });
      gsap.set(stamps, { scale: 2.4, opacity: 0, rotate: -24 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: `+=${tickets.length * 80}%`,
          invalidateOnRefresh: true,
          pin: true,
          scrub: 0.8,
          onUpdate: (self) => {
            const i = Math.min(tickets.length - 1, Math.floor(self.progress * tickets.length));
            counter.textContent = String(i + 1).padStart(2, "0");
          },
        },
      });

      tickets.forEach((t, i) => {
        const at = i * 1.2;
        if (i > 0) {
          // The tickets already played sink back into the deck and dim.
          tl.to(
            tickets.slice(0, i),
            {
              y: (k) => -22 * (i - k),
              scale: (k) => 1 - 0.05 * (i - k),
              filter: (k) => `brightness(${1 - 0.18 * (i - k)})`,
              opacity: (k) => (i - k > 2 ? 0 : 1),
              duration: 0.8,
            },
            at
          );
          tl.to(t, { y: 0, rotate: i % 2 ? -1.2 : 1.2, duration: 0.8 }, at);
        }
        tl.to(stamps[i], { scale: 1, opacity: 1, rotate: -12, duration: 0.35, ease: "back.out(2.5)" }, at + 0.6);
      });
      tl.to({}, { duration: 0.6 });
    },
    { scope: root, dependencies: [deck] }
  );

  return (
    <section
      ref={root}
      aria-label="The trip, leg by leg"
      className={`relative overflow-hidden bg-abyss ${deck ? "h-[100svh] min-h-[38rem]" : "py-24"}`}
    >
      <div className={`mx-auto flex max-w-[100rem] flex-col px-6 md:px-10 ${deck ? "h-full pb-10 pt-28" : ""}`}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="t-eyebrow text-ember-500">Leg by leg</p>
            <h2 className="font-display mt-4 text-[clamp(2.2rem,5vw,4.4rem)] leading-none text-bone">
              Four tickets, <span className="italic text-neel-300">one trip</span>
            </h2>
          </div>
          {deck && (
            <p className="font-display text-3xl text-bone tabular-nums md:text-5xl">
              <span className="gt-count">01</span>
              <span className="text-sand-dim"> / {String(journey.length).padStart(2, "0")}</span>
            </p>
          )}
        </div>

        <div className={`relative ${deck ? "mt-10 flex-1" : "mt-12 flex flex-col gap-6"}`}>
          {journey.map((j, i) => (
            <article
              key={j.step}
              className={`gt-ticket mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-bone text-abyss shadow-2xl shadow-abyss/60 md:flex-row ${
                deck ? "absolute inset-x-0 top-1/2" : "relative"
              }`}
              style={deck ? { zIndex: i + 1 } : undefined}
            >
              {/* Main part */}
              <div className="relative flex-1 p-7 pb-20 md:p-12">
                <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-abyss/60">
                  <span>Leg {j.step}</span>
                  <span className="flex items-center gap-2">
                    <Icon mode={j.mode} className="h-5 w-5 text-ember-600" />
                    {modeName(j.mode)}
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-end gap-4">
                  <div>
                    <p className="text-[0.58rem] uppercase tracking-[0.22em] text-abyss/50">From</p>
                    <p className="font-display mt-1 text-[clamp(1.5rem,3.6vw,3.2rem)] leading-tight">{j.from}</p>
                  </div>
                  <span aria-hidden="true" className="mb-3 flex items-center gap-1 text-ember-600">
                    <span className="h-px w-6 bg-current md:w-12" />
                    &rarr;
                  </span>
                  <div className="text-right">
                    <p className="text-[0.58rem] uppercase tracking-[0.22em] text-abyss/50">To</p>
                    <p className="font-display mt-1 text-[clamp(1.5rem,3.6vw,3.2rem)] leading-tight">{j.to}</p>
                  </div>
                </div>

                <p className="mt-7 max-w-[52ch] text-sm md:pr-28 leading-relaxed text-abyss/75 md:text-base">{j.detail}</p>

                <span
                  aria-hidden="true"
                  className="gt-stamp pointer-events-none absolute bottom-6 right-8 rounded-lg border-[3px] border-ember-600/80 px-3 py-1 font-sans text-sm font-bold uppercase tracking-[0.2em] text-ember-600/80 md:bottom-8"
                >
                  {i === journey.length - 1 ? "Arrived" : "Boarded"}
                </span>
              </div>

              {/* Perforation: a dashed tear line with a notch at each end. */}
              <div aria-hidden="true" className="relative h-px md:h-auto md:w-px">
                <span className="absolute inset-0 border-t-2 border-dashed border-abyss/20 md:border-l-2 md:border-t-0" />
                <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-abyss md:-left-3 md:-top-3" />
                <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-abyss md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
              </div>

              {/* Stub */}
              <div className="flex items-center justify-between gap-6 bg-ember-300/40 p-7 md:w-60 md:flex-col md:items-start md:justify-center md:p-8">
                <div>
                  <p className="text-[0.58rem] uppercase tracking-[0.22em] text-abyss/50">Takes</p>
                  <p className="font-display mt-1 text-4xl md:text-5xl">{j.duration.replace("≈ ", "")}</p>
                </div>
                <div className="md:mt-6">
                  <p className="text-[0.58rem] uppercase tracking-[0.22em] text-abyss/50">Step</p>
                  <p className="font-display mt-1 text-4xl tabular-nums">{j.step}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
