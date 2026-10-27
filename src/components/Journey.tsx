"use client";

import { useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { drivingRoute, journey, site } from "@/lib/site";
import Reveal from "./ui/Reveal";

/**
 * Getting here, as a journey board.
 *
 * Laid out the way transit planners present a trip, in four rows:
 *   1. the headline numbers (total time, legs, the ferry, the pickup);
 *   2. the whole trip as one bar, split by leg in proportion to its time;
 *   3. a route map beside the step-by-step list;
 *   4. the practical cards — by road, the tide, where to find us.
 *
 * One "active leg" ties the board together. A marker loops along the map,
 * and whichever leg it is on lights up in the map, the bar and the steps at
 * once (that step opens to show its detail). Pointing at a step pauses the
 * loop and shows that leg. Under reduced motion nothing loops: the route is
 * drawn in full and the steps still respond to the pointer.
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

/** How each leg is drawn: the line style says how you travel. */
const LEG_STYLE = [
  { label: "Rail", dash: undefined, ties: true, width: 2.4 },
  { label: "Road", dash: undefined, ties: false, width: 2.4 },
  { label: "Ferry", dash: "7 6", ties: false, width: 2.4 },
  { label: "Toto", dash: "0.1 7", ties: false, width: 3 },
];

const RIVER =
  "M0 386C60 376 110 392 170 384S280 372 340 384S470 396 530 386S610 376 640 382V418C600 424 560 410 500 418S380 432 320 420S200 408 140 418S40 430 0 420Z";
const SEA = "M0 530C70 518 130 538 210 528S350 514 430 528S570 540 640 524V580H0Z";

const totalMinutes = journey.reduce((n, j) => n + j.minutes, 0);
const fmt = (min: number) => {
  const m = Math.round(min);
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};
const modeName = (mode: string) => (mode === "Arrival" ? "Toto" : mode);

/**
 * Bar widths follow each leg's share of the time, with a floor so the short
 * legs (10 and 15 minutes) still have room for their icon and label.
 */
const barWeights = (() => {
  const raw = journey.map((j) => Math.max(j.minutes / totalMinutes, 0.13));
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => w / sum);
})();

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
  const markerRef = useRef<SVGGElement>(null);
  const guideRefs = useRef<Array<SVGPathElement | null>>([]);
  const loop = useRef<gsap.core.Timeline | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  // Mask ids must be unique in the document and safe inside url(#…).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  const select = (i: number) => {
    if (activeRef.current === i) return;
    activeRef.current = i;
    setActive(i);
  };

  /** Put the marker part-way along a leg (0 = its start, 1 = its end). */
  const placeMarker = (leg: number, f: number) => {
    const path = guideRefs.current[leg];
    if (!path || !markerRef.current) return;
    const pt = path.getPointAtLength(path.getTotalLength() * f);
    markerRef.current.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
  };

  /* Pointing at a step pauses the loop on that leg; leaving resumes it. */
  const focusLeg = (i: number) => {
    loop.current?.pause();
    select(i);
    placeMarker(i, 0.5);
  };
  const releaseLeg = () => loop.current?.resume();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const reveals = gsap.utils.toArray<SVGPathElement>(".leg-reveal", el);
      const lens = reveals.map((p) => p.getTotalLength());
      const clock = el.querySelector<HTMLElement>(".total-clock");

      if (prefersReducedMotion()) {
        // No loop: the route is drawn in full and the marker sits on the
        // highlighted leg, moving only when a step is pointed at.
        placeMarker(0, 0.5);
        return;
      }

      reveals.forEach((p, i) => gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i] }));
      gsap.set(".bar-seg", { scaleX: 0 });
      gsap.set(".board-in", { opacity: 0, y: 28 });
      placeMarker(0, 0);

      // The loop: the marker travels each leg in turn, then holds at the camp.
      const state = { t: 0 };
      const n = journey.length;
      const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.2 });
      tl.to(state, {
        t: n,
        duration: n * 2.6,
        ease: "none",
        onUpdate: () => {
          const at = Math.min(n - 1e-6, state.t);
          const leg = Math.floor(at);
          placeMarker(leg, at - leg);
          select(leg);
        },
      });
      loop.current = tl;

      // Arrival on screen: the board settles in, the bar grows leg by leg,
      // the route draws on, the clock counts up — then the loop starts.
      const intro = gsap.timeline({ paused: true, onComplete: () => tl.play(0) });
      intro
        .to(".board-in", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" })
        .to(".bar-seg", { scaleX: 1, duration: 0.7, stagger: 0.18, ease: "power3.inOut" }, 0.2);
      reveals.forEach((p, i) => {
        intro.to(p, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, 0.35 + i * 0.55);
      });
      const count = { m: 0 };
      intro.to(
        count,
        {
          m: totalMinutes,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            if (clock) clock.textContent = fmt(count.m);
          },
        },
        0.2
      );

      const trigger = gsap.timeline({
        scrollTrigger: {
          trigger: el.querySelector(".journey-board"),
          start: "top 75%",
          once: true,
          onEnter: () => intro.play(),
        },
      });

      return () => {
        tl.kill();
        intro.kill();
        trigger.kill();
        loop.current = null;
      };
    },
    { scope: root }
  );

  const activeLeg = journey[active];
  const from = STATIONS[active];
  const to = STATIONS[active + 1];

  return (
    <section
      ref={root}
      id="journey"
      className={`relative bg-abyss ${standalone ? "pb-28 md:pb-36" : "py-28 md:py-36"}`}
    >
      <style>{`
        @keyframes route-flow { to { stroke-dashoffset: -60; } }
        @keyframes route-ping {
          0% { transform: scale(1); opacity: .6; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        .route-flow { animation: route-flow 6s linear infinite; }
        .stn-ring { transform-box: fill-box; transform-origin: center; opacity: 0; }
        .stn[data-on="true"] .stn-ring { animation: route-ping 2.2s ease-out infinite; }
        .stn .stn-dot, .stn .stn-label { transition: fill .4s, stroke .4s; }
        .stn[data-on="true"] .stn-dot { fill: var(--color-ember-400); stroke: var(--color-ember-300); }
        .stn[data-on="true"] .stn-label { fill: var(--color-bone); }
        .leg-line { transition: opacity .45s; }
        @media (prefers-reduced-motion: reduce) {
          .route-flow, .stn[data-on="true"] .stn-ring { animation: none; }
        }
      `}</style>

      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        {!standalone && (
          <div className="mb-14 grid gap-8 lg:grid-cols-12">
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

        <div className="journey-board grid grid-cols-1 gap-4 md:gap-5">
          {/* ── 1. The numbers ── */}
          <dl className="board-in grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-bone/10 bg-bone/10 lg:grid-cols-4">
            {[
              {
                k: "Travel time",
                v: <span className="total-clock">{fmt(totalMinutes)}</span>,
                s: `From ${journey[0].from}, approx.`,
              },
              { k: "Legs", v: String(journey.length), s: journey.map((j) => modeName(j.mode)).join(" · ") },
              { k: "Ferry", v: "1", s: "Across the Chinai, with the tide" },
              { k: "Pickup", v: "Ghat", s: "We meet you, if you let us know" },
            ].map((t) => (
              <div key={t.k} className="bg-abyss p-5 md:p-7">
                <dt className="text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">{t.k}</dt>
                <dd className="mt-3 font-display text-4xl leading-none text-bone tabular-nums md:text-5xl">
                  {t.v}
                </dd>
                <dd className="mt-2 text-xs text-sand-dim">{t.s}</dd>
              </div>
            ))}
          </dl>

          {/* ── 2. The whole trip as one bar ── */}
          <div className="board-in rounded-2xl border border-bone/10 bg-ink p-5 md:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">The whole trip</p>
              <p className="text-xs text-sand-dim">Bar lengths follow time on the move</p>
            </div>
            <div className="mt-5 flex gap-1.5">
              {journey.map((j, i) => (
                <button
                  key={j.step}
                  type="button"
                  onPointerEnter={() => focusLeg(i)}
                  onPointerLeave={releaseLeg}
                  onFocus={() => focusLeg(i)}
                  onBlur={releaseLeg}
                  aria-label={`Leg ${j.step}: ${j.from} to ${j.to}, ${j.duration}`}
                  className="group min-w-0 text-left"
                  style={{ flexBasis: `${barWeights[i] * 100}%` }}
                >
                  <span
                    className={`bar-seg flex h-12 origin-left items-center gap-2 overflow-hidden rounded-lg px-3 transition-colors duration-500 md:h-14 ${
                      i === active
                        ? "bg-ember-400 text-abyss"
                        : "bg-ember-500/12 text-ember-300 group-hover:bg-ember-500/25"
                    }`}
                  >
                    <Icon mode={j.mode} className="h-4 w-4 shrink-0" />
                    <span className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.14em] tabular-nums">
                      {j.duration.replace("≈ ", "")}
                    </span>
                  </span>
                  <span
                    className={`mt-2 hidden truncate text-[0.6rem] uppercase tracking-[0.18em] transition-colors duration-500 sm:block ${
                      i === active ? "text-bone" : "text-sand-dim"
                    }`}
                  >
                    {modeName(j.mode)}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 flex justify-between font-display text-sm text-sand md:text-base">
              <span>{journey[0].from}</span>
              <span>{journey[journey.length - 1].to}</span>
            </div>
          </div>

          {/* ── 3. Map beside the steps ── */}
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
            <figure className="board-in relative flex flex-col overflow-hidden rounded-2xl border border-bone/10 bg-ink p-4 md:p-6 lg:col-span-7">
              <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-1">
                <span className="text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">Route map</span>
                <span className="font-display text-base text-bone">
                  {from.label} <span className="text-ember-400">&rarr;</span> {to.label}
                </span>
              </figcaption>

              <svg viewBox="0 0 640 580" className="my-auto block h-auto w-full py-3" aria-hidden="true" fill="none">
                <defs>
                  <pattern id={`${uid}-grid`} width="32" height="32" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="1" fill="rgba(244,239,230,0.07)" />
                  </pattern>
                  <radialGradient id={`${uid}-glow`}>
                    <stop offset="0" stopColor="var(--color-ember-400)" stopOpacity="0.5" />
                    <stop offset="1" stopColor="var(--color-ember-400)" stopOpacity="0" />
                  </radialGradient>
                  {/* Legs draw on through masks traced along their paths,
                      so dashed and dotted legs draw as cleanly as solid ones. */}
                  {LEGS.map((d, i) => (
                    <mask
                      key={i}
                      id={`${uid}-leg${i}`}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="640"
                      height="580"
                    >
                      <path className="leg-reveal" d={d} stroke="white" strokeWidth="16" strokeLinecap="round" />
                    </mask>
                  ))}
                </defs>

                <rect width="640" height="580" fill={`url(#${uid}-grid)`} />

                <path d={RIVER} fill="var(--color-neel-900)" />
                <path d={RIVER} stroke="var(--color-neel-500)" strokeOpacity="0.35" />
                {[396, 404, 411].map((y, i) => (
                  <path
                    key={y}
                    className="route-flow"
                    d={`M0 ${y}q40 -6 80 0t80 0 80 0 80 0 80 0 80 0 80 0 80 0`}
                    stroke="var(--color-neel-300)"
                    strokeOpacity="0.35"
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
                    strokeDasharray="20 40"
                    style={{ animationDelay: `${-i * 2.3}s` }}
                  />
                ))}
                <text x="320" y="573" textAnchor="middle" className="fill-neel-300/70 text-[10px] tracking-[0.45em]">
                  BAY OF BENGAL
                </text>

                <g transform="translate(596 52)">
                  <circle r="18" stroke="var(--color-sand-dim)" strokeOpacity="0.4" />
                  <path d="M0 -12 4 0 0 12 -4 0Z" fill="var(--color-sand-dim)" fillOpacity="0.5" />
                  <path d="M0 -12 4 0H-4Z" fill="var(--color-ember-400)" />
                  <text y="-24" textAnchor="middle" className="fill-sand-dim text-[9px] tracking-[0.2em]">
                    N
                  </text>
                </g>

                {/* Faint guide for the whole route; also what the marker follows */}
                {LEGS.map((d, i) => (
                  <path
                    key={i}
                    ref={(p) => {
                      guideRefs.current[i] = p;
                    }}
                    d={d}
                    stroke="rgba(244,239,230,0.16)"
                    strokeWidth="1.5"
                    strokeDasharray="3 6"
                  />
                ))}

                {/* Each leg in its own style; the active one at full strength */}
                {LEGS.map((d, i) => {
                  const st = LEG_STYLE[i];
                  return (
                    <g key={i} className="leg-line" mask={`url(#${uid}-leg${i})`} opacity={i === active ? 1 : 0.4}>
                      {st.ties && (
                        <path
                          d={d}
                          stroke="var(--color-ember-500)"
                          strokeOpacity="0.6"
                          strokeWidth="10"
                          strokeDasharray="1.6 7"
                        />
                      )}
                      <path
                        d={d}
                        stroke="var(--color-ember-400)"
                        strokeWidth={i === active ? st.width + 0.8 : st.width}
                        strokeDasharray={st.dash}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {STATIONS.map((s, k) => {
                  const last = k === STATIONS.length - 1;
                  const on = k === active || k === active + 1;
                  return (
                    <g key={s.label} className="stn" data-on={on ? "true" : "false"}>
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

                {/* The traveller, carrying the active leg's vehicle */}
                <g ref={markerRef} transform={`translate(${STATIONS[0].x} ${STATIONS[0].y})`}>
                  <circle r="32" fill={`url(#${uid}-glow)`} />
                  <circle r="14" fill="var(--color-ember-400)" />
                  <g
                    transform="translate(-9 -9) scale(0.75)"
                    fill="none"
                    stroke="var(--color-abyss)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {icons[activeLeg.mode]}
                  </g>
                </g>
              </svg>

              {/* Legend: the four line styles */}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-bone/10 px-1 pt-4">
                {LEG_STYLE.map((st, i) => (
                  <span
                    key={st.label}
                    className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim"
                  >
                    <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden="true">
                      {st.ties && (
                        <path
                          d="M1 5h32"
                          stroke="var(--color-ember-500)"
                          strokeOpacity="0.6"
                          strokeWidth="8"
                          strokeDasharray="1.6 5"
                        />
                      )}
                      <path
                        d="M1 5h32"
                        stroke="var(--color-ember-400)"
                        strokeWidth={st.width}
                        strokeDasharray={st.dash}
                        strokeLinecap="round"
                      />
                    </svg>
                    {st.label} · {journey[i].duration.replace("≈ ", "")}
                  </span>
                ))}
              </div>
            </figure>

            <div className="board-in flex flex-col gap-2 lg:col-span-5">
              <ol className="flex flex-col gap-2">
                {journey.map((j, i) => {
                  const on = i === active;
                  return (
                    <li key={j.step}>
                      <button
                        type="button"
                        onPointerEnter={() => focusLeg(i)}
                        onPointerLeave={releaseLeg}
                        onFocus={() => focusLeg(i)}
                        onBlur={releaseLeg}
                        aria-expanded={on}
                        className={`flex w-full gap-4 rounded-2xl border p-5 text-left transition-colors duration-500 md:p-6 ${
                          on ? "border-ember-400/60 bg-ember-500/[0.07]" : "border-bone/10 bg-ink hover:border-bone/25"
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-500 ${
                            on ? "border-ember-400 bg-ember-400 text-abyss" : "border-bone/20 text-sand-dim"
                          }`}
                        >
                          <Icon mode={j.mode} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-3 text-[0.6rem] uppercase tracking-[0.24em] tabular-nums">
                            <span className={on ? "text-ember-400" : "text-sand-dim"}>
                              {j.step} · {modeName(j.mode)}
                            </span>
                            <span className="text-sand-dim">{j.duration}</span>
                          </span>
                          <span className="mt-1.5 block font-display text-xl leading-snug text-bone md:text-2xl">
                            {j.from} <span className="text-ember-400">&rarr;</span> {j.to}
                          </span>
                          {/* The active step opens; the others stay one line */}
                          <span
                            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${
                              on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            }`}
                          >
                            <span className="overflow-hidden">
                              <span className="block pt-2 text-sm leading-relaxed text-sand">{j.detail}</span>
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              {/* Arrival: where the steps end, and what to do next */}
              <div className="flex flex-1 flex-col justify-between gap-6 rounded-2xl border border-bone/10 bg-linear-to-br from-ember-500/[0.12] to-transparent p-6 md:p-7">
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.28em] text-ember-500">Arrive</p>
                  <p className="mt-3 font-display text-3xl leading-tight text-bone md:text-4xl">
                    {journey[journey.length - 1].to}
                  </p>
                  <p className="mt-2 text-sm text-sand">
                    &asymp; {fmt(totalMinutes)} on the move from {journey[0].from}.
                  </p>
                </div>
                <a
                  href="/contact"
                  data-cursor="Book"
                  className="inline-flex w-fit items-center gap-3 rounded-full bg-bone px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors hover:bg-ember-300"
                >
                  Plan your stay <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── 4. The practical cards ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <div className="board-in rounded-2xl border border-bone/10 bg-ink p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-ember-500">
                <Icon mode="Road" className="h-4 w-4" /> Coming by road
              </p>
              <ol className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2 font-display text-lg text-bone">
                {drivingRoute.map((place, i) => (
                  <li key={place} className="flex items-center gap-2">
                    {i > 0 && <span className="text-ember-400">&rarr;</span>}
                    {place}
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm leading-relaxed text-sand-dim">
                Then take the ferry across, the same as everyone else.
              </p>
            </div>

            <div className="board-in rounded-2xl border border-bone/10 bg-ink p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-ember-500">
                <Icon mode="River" className="h-4 w-4" /> Mind the tide
              </p>
              <p className="mt-5 font-display text-lg leading-snug text-bone">
                Boats run with the tide. Tell us your train and we will time the crossing for you.
              </p>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                data-cursor="Call"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-bone/20 px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
              >
                Call {site.owner.phone}
              </a>
            </div>

            <div className="board-in rounded-2xl border border-bone/10 bg-ink p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-ember-500">
                <Icon mode="Arrival" className="h-4 w-4" /> Find us
              </p>
              <p className="mt-5 text-sm leading-relaxed text-sand">{site.location.full}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="Map"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-bone px-5 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-ember-300"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>
        </div>

        {!standalone && (
          <div className="mt-8 flex justify-end">
            <a href="/getting-here" className="link-draw text-sm text-ember-300">
              The full route &rarr;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
