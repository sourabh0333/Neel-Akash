"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { drivingRoute, journey, site } from "@/lib/site";
import Reveal from "./ui/Reveal";
import RouteMap from "./route/RouteMap";

/**
 * Getting here, as a journey board.
 *
 * Laid out the way transit planners present a trip, in five rows:
 *   1. the headline numbers (total time, legs, the ferry, the pickup);
 *   2. the whole trip as one bar, split by leg in proportion to its time;
 *   3. the route map, full width;
 *   4. the steps, one column per leg;
 *   5. the practical cards — by road, the tide, where to find us, arrival.
 *
 * One "active leg" ties the board together. The route map (./route/
 * RouteMap) plays the trip like a navigation app, and whichever leg it is
 * on lights up in the bar and the steps (that step opens to show its
 * detail). Pointing at a step or bar segment hands that leg to the map,
 * which frames it and holds until the pointer leaves.
 */

/** How each leg is drawn: the line style says how you travel. */
const LEG_STYLE = [
  { label: "Rail", dash: undefined, ties: true, width: 2.4 },
  { label: "Road", dash: undefined, ties: false, width: 2.4 },
  { label: "Ferry", dash: "7 6", ties: false, width: 2.4 },
  { label: "Toto", dash: "0.1 7", ties: false, width: 3 },
];

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

export function Icon({ mode, className = "" }: { mode: string; className?: string }) {
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
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);

  const select = (i: number) => {
    if (activeRef.current === i) return;
    activeRef.current = i;
    setActive(i);
  };

  /* Pointing at a step hands that leg to the map; leaving lets it play on. */
  const focusLeg = (i: number) => {
    setFocus(i);
    select(i);
  };
  const releaseLeg = () => setFocus(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const clock = el.querySelector<HTMLElement>(".total-clock");

      if (prefersReducedMotion()) return;

      gsap.set(".bar-seg", { scaleX: 0 });
      gsap.set(".board-in", { opacity: 0, y: 28 });

      // Arrival on screen: the board settles in, the bar grows leg by leg
      // and the clock counts up. The map runs itself.
      const intro = gsap.timeline({ paused: true });
      intro
        .to(".board-in", { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" })
        .to(".bar-seg", { scaleX: 1, duration: 0.7, stagger: 0.18, ease: "power3.inOut" }, 0.2);
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
        intro.kill();
        trigger.kill();
      };
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="journey"
      className={`relative bg-abyss ${standalone ? "pb-28 md:pb-36" : "py-28 md:py-36"}`}
    >
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

          {/* ── 3. The route map, full width ── */}
          <figure className="board-in relative overflow-hidden rounded-2xl border border-bone/10 bg-ink p-3 md:p-5">
            <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-1">
              <span className="text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">Route map</span>
              <span className="text-[0.6rem] uppercase tracking-[0.24em] text-sand-dim">
                Kolkata to the bay
              </span>
            </figcaption>

            <div className="py-3">
              <RouteMap active={active} focus={focus} onLeg={select} />
            </div>

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

        {/* ── 4. The steps, one column per leg ── */}
          <ol className="board-in grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {journey.map((j, i) => {
              const on = i === active;
              return (
                <li key={j.step} className="h-full">
                  <button
                    type="button"
                    onPointerEnter={() => focusLeg(i)}
                    onPointerLeave={releaseLeg}
                    onFocus={() => focusLeg(i)}
                    onBlur={releaseLeg}
                    aria-expanded={on}
                    className={`flex h-full w-full gap-4 rounded-2xl border p-5 text-left transition-colors duration-500 md:p-6 ${
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
                      {/* Stacked (phones), the active step opens and the others
                          stay one line; in columns every detail shows, the
                          active one at full strength. */}
                      <span
                        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:grid-rows-[1fr] ${
                          on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 sm:opacity-60"
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

          {/* ── 5. The practical cards, ending on arrival ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
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

            <div className="board-in flex flex-col justify-between gap-6 rounded-2xl border border-bone/10 bg-linear-to-br from-ember-500/[0.12] to-transparent p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7">
              <div>
                <p className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.28em] text-ember-500">
                <Icon mode="Arrival" className="h-4 w-4" /> Arrive
              </p>
                <p className="mt-5 font-display text-2xl leading-tight text-bone">
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
