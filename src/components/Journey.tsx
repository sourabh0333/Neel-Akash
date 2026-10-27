"use client";

import { useId, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { journey, site } from "@/lib/site";
import Reveal from "./ui/Reveal";

/**
 * Getting here, as a live route tracker.
 *
 * Desktop: the section pins and scrolling *is* the trip. A marker carrying
 * the current vehicle travels a route map of the delta — railway, road,
 * ferry across the Chinai, toto to the camp — each leg drawn in its own
 * line style as it is covered. Stations light up on arrival, the leg card
 * swaps, and a trip clock counts the travel time up as you go.
 *
 * Everything is driven from one progress value written straight to the DOM
 * (no React state on scroll), so the pin stays smooth.
 *
 * Phones, and anyone who prefers reduced motion, get the same route as a
 * stack of boarding-pass tickets instead.
 */

/* ── Route map geometry (viewBox 640 × 580) ─────────────────── */

/**
 * Each station: the dot, then where its name (and optional small caption)
 * sits — placed by hand so nothing lands on a line or in the water.
 */
const STATIONS = [
  { x: 70, y: 70, label: "Sealdah", lx: 90, ly: 52, anchor: "start" as const, sub: "Kolkata", sx: 90, sy: 34 },
  { x: 400, y: 270, label: "Namkhana", lx: 418, ly: 275, anchor: "start" as const, sub: "", sx: 0, sy: 0 },
  { x: 300, y: 360, label: "Bagdanga Ghat", lx: 282, ly: 365, anchor: "end" as const, sub: "", sx: 0, sy: 0 },
  { x: 330, y: 438, label: "Mousuni Island", lx: 312, ly: 452, anchor: "end" as const, sub: "", sx: 0, sy: 0 },
  { x: 500, y: 470, label: site.name, lx: 500, ly: 503, anchor: "middle" as const, sub: "You are here", sx: 500, sy: 451 },
];

/** One path per leg, in journey order: rail, road, ferry, toto. */
const LEGS = [
  "M70 70C200 70 330 120 400 270",
  "M400 270C395 320 350 350 300 360",
  "M300 360C300 395 325 410 330 438",
  "M330 438C390 445 440 480 500 470",
];

/** How each leg looks once covered: the line style says how you travel. */
const LEG_STYLE = [
  // Rail: a rule with sleepers across it.
  { stroke: 2.4, dash: undefined, ties: true },
  // Road: one solid line.
  { stroke: 2.4, dash: undefined, ties: false },
  // Ferry: a dashed crossing over the water.
  { stroke: 2.4, dash: "7 6", ties: false },
  // Toto: a dotted lane.
  { stroke: 3, dash: "0.1 7", ties: false },
];

/** The Chinai, as a wavy band the ferry crosses. */
const RIVER =
  "M0 386C60 376 110 392 170 384S280 372 340 384S470 396 530 386S610 376 640 382V418C600 424 560 410 500 418S380 432 320 420S200 408 140 418S40 430 0 420Z";
const SEA = "M0 530C70 518 130 538 210 528S350 514 430 528S570 540 640 524V580H0Z";

const totalMinutes = journey.reduce((n, j) => n + j.minutes, 0);
const fmt = (min: number) => {
  const m = Math.round(min);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

const icons: Record<string, React.ReactNode> = {
  Rail: (
    <>
      <path d="M9 3.5v17M15 3.5v17" />
      <path d="M6 7h12M6 12h12M6 17h12" />
    </>
  ),
  Road: (
    <>
      <path d="M2.5 15.5V9h10.5v6.5" />
      <path d="M13 11h3.6l3 3.2v1.3H13" />
      <circle cx="7" cy="16.6" r="1.7" />
      <circle cx="16.4" cy="16.6" r="1.7" />
    </>
  ),
  River: (
    <>
      <path d="M3 9.5q3-3 6 0t6 0t6 0" />
      <path d="M3 14.5q3-3 6 0t6 0t6 0" />
      <path d="M3 19q3-3 6 0t6 0t6 0" />
    </>
  ),
  // The last leg is a toto: an e-rickshaw with its canopy and cabin.
  Arrival: (
    <>
      <path d="M3.5 15.5V8.5a2.5 2.5 0 0 1 2.5-2.5h8.5l4.5 5.5v4" />
      <path d="M3.5 15.5h16" />
      <path d="M10.5 6v5.5h-7" />
      <circle cx="7" cy="17.4" r="1.8" />
      <circle cx="16.5" cy="17.4" r="1.8" />
    </>
  ),
};

function Icon({ mode, className = "" }: { mode: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[mode]}
    </svg>
  );
}

export default function Journey({
  standalone = false,
}: {
  /** On the /getting-here page: no section heading, no link to itself. */
  standalone?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  // Mask ids must be unique in the document and safe inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const mm = gsap.matchMedia();

      /* ── Desktop: the pinned tracker ─────────────────────────── */
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const stage = el.querySelector<HTMLElement>(".route-stage");
        if (!stage) return;

        const reveals = gsap.utils.toArray<SVGPathElement>(".leg-reveal", el);
        const lens = reveals.map((p) => p.getTotalLength());
        reveals.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));

        const guides = gsap.utils.toArray<SVGPathElement>(".leg-guide", el);
        const marker = el.querySelector<SVGGElement>(".marker");
        const markerIcons = gsap.utils.toArray<SVGGElement>(".marker-icon", el);
        const stations = gsap.utils.toArray<SVGGElement>(".stn", el);
        const cards = gsap.utils.toArray<HTMLElement>(".leg-card", el);
        const bars = gsap.utils.toArray<HTMLElement>(".leg-bar", el);
        const chips = gsap.utils.toArray<HTMLElement>(".leg-chip", el);
        const clock = el.querySelector<HTMLElement>(".trip-clock");

        gsap.set(cards, { autoAlpha: 0, y: 30 });
        gsap.set(cards[0], { autoAlpha: 1, y: 0 });

        let shown = 0;
        const showCard = (i: number) => {
          if (i === shown) return;
          const down = i > shown;
          gsap.to(cards[shown], { autoAlpha: 0, y: down ? -30 : 30, duration: 0.45, ease: "power2.in", overwrite: true });
          gsap.fromTo(
            cards[i],
            { autoAlpha: 0, y: down ? 30 : -30 },
            { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.15, ease: "power3.out", overwrite: true }
          );
          markerIcons.forEach((g, n) => gsap.to(g, { opacity: n === i ? 1 : 0, duration: 0.3 }));
          shown = i;
        };

        const n = journey.length;
        const render = (p: number) => {
          const at = Math.min(n - 1e-6, Math.max(0, p * n));
          const leg = Math.floor(at);
          const local = at - leg;

          let minutes = 0;
          reveals.forEach((path, i) => {
            const f = i < leg ? 1 : i === leg ? local : 0;
            path.style.strokeDashoffset = String(lens[i] * (1 - f));
            bars[i].style.transform = `scaleX(${f})`;
            chips[i].dataset.on = String(f > 0);
            minutes += journey[i].minutes * f;
          });
          // At the very end, the last leg is complete.
          if (p >= 0.999) {
            reveals[n - 1].style.strokeDashoffset = "0";
            bars[n - 1].style.transform = "scaleX(1)";
            minutes = totalMinutes;
          }
          if (clock) clock.textContent = fmt(minutes);

          stations.forEach((s, k) => (s.dataset.on = String(k === 0 || at >= k || p >= 0.999)));

          const guide = guides[leg];
          const pt = guide.getPointAtLength(guide.getTotalLength() * (p >= 0.999 ? 1 : local));
          marker?.setAttribute("transform", `translate(${pt.x} ${pt.y})`);

          showCard(leg);
        };

        const state = { p: 0 };
        render(0);
        const tween = gsap.to(state, {
          p: 1,
          ease: "none",
          onUpdate: () => render(state.p),
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${window.innerHeight * 3.2}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        return () => tween.scrollTrigger?.kill();
      });

      /* ── Phones / reduced motion: tickets stamp in ──────────── */
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        if (prefersReducedMotion()) return;
        gsap.utils.toArray<HTMLElement>(".ticket", el).forEach((t) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: t, start: "top 85%" } });
          tl.from(t, { y: 70, rotate: -2.5, opacity: 0, duration: 0.9, ease: "power3.out" }).from(
            t.querySelector(".ticket-stamp"),
            { scale: 1.8, rotate: -24, opacity: 0, duration: 0.5, ease: "back.out(2.2)" },
            "-=0.35"
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="journey"
      className={`relative bg-abyss ${standalone ? "pb-28 md:pb-36" : "pt-28 pb-28 md:pt-36 md:pb-36"}`}
    >
      <style>{`
        @keyframes route-flow { to { stroke-dashoffset: -60; } }
        @keyframes route-ping {
          0% { transform: scale(1); opacity: .55; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .route-flow { animation: route-flow 6s linear infinite; }
        .stn .stn-dot { transition: fill .5s, stroke .5s, r .5s; }
        .stn .stn-label { transition: fill .5s, opacity .5s; }
        .stn[data-on="true"] .stn-dot { fill: var(--color-ember-400); stroke: var(--color-ember-300); }
        .stn[data-on="true"] .stn-label { fill: var(--color-bone); }
        .stn-ring { transform-box: fill-box; transform-origin: center; opacity: 0; }
        .stn[data-on="true"] .stn-ring { animation: route-ping 2.4s ease-out infinite; }
        .leg-chip[data-on="true"] { color: var(--color-bone); }
        @media (prefers-reduced-motion: reduce) {
          .route-flow, .stn[data-on="true"] .stn-ring { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        {!standalone && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
                Getting here
              </Reveal>
              <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
                A train, a van,
                <br />
                <span className="italic text-neel-300">and a boat</span>
              </Reveal>
            </div>
            <Reveal
              as="p"
              mode="fade"
              delay={0.12}
              className="self-end text-sm leading-relaxed text-sand lg:col-span-5"
            >
              Roughly four and a half hours door to door from central Kolkata.
              The last leg is a ferry, so the tide matters &mdash; call ahead and
              we will tell you which train to take.
            </Reveal>
          </div>
        )}
      </div>

      {/* ── Desktop: the pinned route tracker ── */}
      <div className="route-stage hidden h-[100svh] lg:motion-safe:block">
        <div className="mx-auto grid h-full max-w-[100rem] grid-cols-12 items-center gap-10 px-10 pt-20 pb-10">
          {/* Left: clock, progress, the current leg */}
          <div className="col-span-5">
            <div className="flex items-end justify-between border-b border-bone/12 pb-5">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-sand-dim">Trip clock</p>
                <p className="trip-clock mt-2 font-display text-6xl leading-none text-bone tabular-nums">
                  {fmt(0)}
                </p>
              </div>
              <p className="pb-1 text-right text-[0.62rem] uppercase tracking-[0.2em] text-sand-dim">
                of &asymp; {fmt(totalMinutes)}
                <br />
                from {journey[0].from}
              </p>
            </div>

            {/* Four-part progress: one bar per leg, labelled by mode */}
            <div className="mt-5 grid grid-cols-4 gap-2">
              {journey.map((j) => (
                <div key={j.step}>
                  <div className="h-[3px] overflow-hidden rounded-full bg-bone/10">
                    <div className="leg-bar h-full origin-left scale-x-0 bg-ember-400" />
                  </div>
                  <p className="leg-chip mt-2 flex items-center gap-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-sand-dim transition-colors duration-500">
                    <Icon mode={j.mode} className="h-3.5 w-3.5" />
                    {j.mode === "Arrival" ? "Toto" : j.mode}
                  </p>
                </div>
              ))}
            </div>

            {/* The leg cards share one grid cell and swap in place */}
            <div className="mt-12 grid">
              {journey.map((j) => (
                <article key={j.step} className="leg-card [grid-area:1/1]">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ember-400/60 bg-ember-500/10 text-ember-300">
                      <Icon mode={j.mode} className="h-5 w-5" />
                    </span>
                    <span className="text-[0.62rem] uppercase tracking-[0.28em] text-ember-500 tabular-nums">
                      Leg {j.step} / {String(journey.length).padStart(2, "0")}
                    </span>
                    <span className="ml-auto rounded-full border border-bone/15 px-3 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-sand tabular-nums">
                      {j.duration}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-[clamp(2rem,3.2vw,3rem)] leading-[1.05] text-bone">
                    {j.title}
                  </h3>
                  <p className="mt-4 max-w-[46ch] leading-relaxed text-sand">{j.detail}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Right: the route map */}
          <div className="col-span-7 h-full max-h-[78vh]">
            <svg
              viewBox="0 0 640 580"
              className="h-full w-full overflow-visible"
              aria-hidden="true"
              fill="none"
            >
              <defs>
                <pattern id={`${uid}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="rgba(244,239,230,0.07)" />
                </pattern>
                <radialGradient id={`${uid}-glow`}>
                  <stop offset="0" stopColor="var(--color-ember-400)" stopOpacity="0.55" />
                  <stop offset="1" stopColor="var(--color-ember-400)" stopOpacity="0" />
                </radialGradient>
                {/* Each leg is revealed through a mask drawn along its path,
                    so dashed and dotted legs draw on as cleanly as solid ones. */}
                {LEGS.map((d, i) => (
                  <mask key={i} id={`${uid}-leg${i}`} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="580">
                    <path className="leg-reveal" d={d} stroke="white" strokeWidth="16" strokeLinecap="round" />
                  </mask>
                ))}
              </defs>

              <rect width="640" height="580" fill={`url(#${uid}-grid)`} />

              {/* Water: the Chinai and the bay, with a slow current */}
              <path d={RIVER} fill="var(--color-neel-900)" />
              <path d={RIVER} fill="none" stroke="var(--color-neel-500)" strokeOpacity="0.35" />
              {[396, 404, 411].map((y, i) => (
                <path
                  key={y}
                  className="route-flow"
                  d={`M0 ${y}q40 -6 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0`}
                  stroke="var(--color-neel-300)"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  strokeDasharray="14 46"
                  style={{ animationDelay: `${-i * 1.7}s` }}
                />
              ))}
              <text x="600" y="404" textAnchor="end" className="fill-neel-300/70 text-[10px] tracking-[0.35em]">
                CHINAI
              </text>

              <path d={SEA} fill="var(--color-neel-900)" />
              {[547, 559].map((y, i) => (
                <path
                  key={y}
                  className="route-flow"
                  d={`M0 ${y}q40 -6 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0`}
                  stroke="var(--color-neel-300)"
                  strokeOpacity="0.3"
                  strokeWidth="1"
                  strokeDasharray="20 40"
                  style={{ animationDelay: `${-i * 2.3}s` }}
                />
              ))}
              <text x="320" y="573" textAnchor="middle" className="fill-neel-300/70 text-[10px] tracking-[0.45em]">
                BAY OF BENGAL
              </text>

              {/* Compass and scale note */}
              <g transform="translate(596 52)" className="text-sand-dim">
                <circle r="18" stroke="currentColor" strokeOpacity="0.35" />
                <path d="M0 -12 4 0 0 12 -4 0Z" fill="currentColor" fillOpacity="0.5" />
                <path d="M0 -12 4 0H-4Z" fill="var(--color-ember-400)" />
                <text y="-24" textAnchor="middle" className="fill-sand-dim text-[9px] tracking-[0.2em]">
                  N
                </text>
              </g>
              <text x="596" y="96" textAnchor="middle" className="fill-sand-dim/70 text-[8px] tracking-[0.25em]">
                NOT TO SCALE
              </text>

              {/* The whole route, faint, so you can see where you are going */}
              {LEGS.map((d, i) => (
                <path
                  key={i}
                  className="leg-guide"
                  d={d}
                  stroke="rgba(244,239,230,0.16)"
                  strokeWidth="1.5"
                  strokeDasharray="3 6"
                />
              ))}

              {/* Covered legs, each in its own line style */}
              {LEGS.map((d, i) => {
                const st = LEG_STYLE[i];
                return (
                  <g key={i} mask={`url(#${uid}-leg${i})`}>
                    {st.ties && (
                      <path
                        d={d}
                        stroke="var(--color-ember-500)"
                        strokeOpacity="0.55"
                        strokeWidth="10"
                        strokeDasharray="1.6 7"
                      />
                    )}
                    <path
                      d={d}
                      stroke="var(--color-ember-400)"
                      strokeWidth={st.stroke}
                      strokeDasharray={st.dash}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Stations */}
              {STATIONS.map((s, k) => {
                const last = k === STATIONS.length - 1;
                return (
                  <g key={s.label} className="stn" data-on={k === 0 ? "true" : "false"}>
                    <circle className="stn-ring" cx={s.x} cy={s.y} r={last ? 9 : 7} stroke="var(--color-ember-400)" />
                    <circle
                      className="stn-dot"
                      cx={s.x}
                      cy={s.y}
                      r={last ? 8 : 6}
                      fill="var(--color-ink)"
                      stroke="rgba(244,239,230,0.45)"
                      strokeWidth="1.5"
                    />
                    <text
                      className="stn-label fill-sand-dim font-display"
                      x={s.lx}
                      y={s.ly}
                      textAnchor={s.anchor}
                      fontSize={last ? 20 : 17}
                    >
                      {s.label}
                    </text>
                    {s.sub && (
                      <text
                        className="fill-sand-dim/70"
                        x={s.sx}
                        y={s.sy}
                        textAnchor={s.anchor}
                        fontSize="8.5"
                        letterSpacing="2.5"
                      >
                        {s.sub.toUpperCase()}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* The traveller: a glowing marker carrying the current vehicle */}
              <g className="marker" transform={`translate(${STATIONS[0].x} ${STATIONS[0].y})`}>
                <circle r="34" fill={`url(#${uid}-glow)`} />
                <circle r="15" fill="var(--color-ember-400)" />
                {journey.map((j, i) => (
                  <g
                    key={j.step}
                    className="marker-icon text-abyss"
                    opacity={i === 0 ? 1 : 0}
                    transform="translate(-9 -9) scale(0.75)"
                  >
                    {/* The 24-unit icon, scaled to 18 and centred on the marker */}
                    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {icons[j.mode]}
                    </g>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* ── Phones / reduced motion: boarding-pass tickets ── */}
      <div className="mx-auto max-w-[100rem] px-6 md:px-10 lg:motion-safe:hidden">
        <ol className="mt-14 grid gap-5 md:grid-cols-2">
          {journey.map((j) => (
            <li
              key={j.step}
              className="ticket relative overflow-hidden rounded-xl border border-bone/12 bg-ink"
            >
              <div className="flex items-center justify-between px-6 pt-5">
                <span className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-ember-500 tabular-nums">
                  <Icon mode={j.mode} className="h-4 w-4" />
                  Leg {j.step} · {j.mode === "Arrival" ? "Toto" : j.mode}
                </span>
                <span className="ticket-stamp rotate-[-8deg] rounded-md border border-ember-400/70 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ember-300 tabular-nums">
                  {j.duration}
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 pt-5 pb-6">
                <div>
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-sand-dim">From</p>
                  <p className="mt-1 font-display text-2xl leading-tight text-bone">{j.from}</p>
                </div>
                <span className="flex items-center gap-1.5 text-ember-400">
                  <span className="h-px w-5 bg-ember-400/50" />
                  <Icon mode={j.mode} className="h-5 w-5" />
                  <span className="h-px w-5 bg-ember-400/50" />
                </span>
                <div className="text-right">
                  <p className="text-[0.55rem] uppercase tracking-[0.3em] text-sand-dim">To</p>
                  <p className="mt-1 font-display text-2xl leading-tight text-bone">{j.to}</p>
                </div>
              </div>

              {/* Perforation: a dashed tear line with a notch at each edge */}
              <div className="relative h-px">
                <span className="absolute inset-x-6 top-0 border-t border-dashed border-bone/20" />
                <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-bone/12 bg-abyss" />
                <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-bone/12 bg-abyss" />
              </div>

              <p className="px-6 pt-5 pb-6 text-sm leading-relaxed text-sand">{j.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[0.66rem] uppercase tracking-[0.22em] text-sand-dim">
          &asymp; {fmt(totalMinutes)} on the move from {journey[0].from}
        </p>
      </div>

      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/12 pt-8">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="Map"
            className="link-draw text-sm text-bone"
          >
            Open {site.location.island} in Google Maps ↗
          </a>
          <span className="hidden h-4 w-px bg-bone/20 sm:block" />
          <p className="text-sm text-sand-dim">{site.location.full}</p>
          {!standalone && (
            <a href="/getting-here" className="link-draw text-sm text-ember-300 sm:ml-auto">
              The full route &rarr;
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
