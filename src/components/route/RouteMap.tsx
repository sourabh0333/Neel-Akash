"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { ghat, journey } from "@/lib/site";
import { CHINAI, HATANIA, LABELS, LAND, LEGS, RIVERS, STATIONS, STOPS, TOWNS, VIEW } from "./geo";

/**
 * The route as a navigation app would show it, on the real delta.
 *
 * The geography is Natural Earth (see scripts/gen-route-map.py). A camera —
 * the SVG viewBox — follows the traveller: pulled back for the long train
 * ride, close in for the ferry, framing a whole leg when a step is pointed
 * at, and out to the full route at the start and the finish. The vehicle is
 * drawn from above and turns with the route: carriages for the train, a van,
 * a boat trailing its wake, a toto. At Hujjuti Ghat the pin carries what is
 * there — parking, and the camp's own booking counter.
 *
 * Lines keep their width at any zoom (non-scaling strokes), and labels, pins
 * and vehicles are counter-scaled by the camera, so text stays readable
 * while the map moves underneath it. Everything per-frame is written straight
 * to the DOM from one ticker; React only hears about leg changes.
 */

/**
 * Camera width, in map units, while following each leg — for a map window
 * of BASE_ASPECT. Other shapes keep the same visible area, so the train
 * looks as close on a wide desktop map as on a tall phone one.
 */
const FOLLOW_W = [560, 200, 160, 185];
const BASE_ASPECT = 11 / 16;
/** Seconds the traveller spends on each leg. */
const LEG_SECONDS = [7, 3.2, 3, 3.2];
const TRAIN_CARS = 3;
/** The departure ghat's pin, which carries the parking and booking badges. */
const GHAT_PIN = STATIONS.findIndex((s) => s.name === ghat.name);
/** The landing sits just across the river from the ghat: its name goes left. */
const LANDING_PIN = GHAT_PIN + 1;
/** Where the stops along the road begin in the counter-scaled list. */
const STOPS_AT = LABELS.length + TOWNS.length + STATIONS.length;

const totalMinutes = journey.reduce((n, j) => n + j.minutes, 0);
const fmt = (min: number) => {
  const m = Math.max(0, Math.round(min));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};

/** The whole route, framed with room around it, for a window of `aspect`. */
const ROUTE_BOX = (() => {
  const xs = STATIONS.map((s) => s.x);
  const ys = STATIONS.map((s) => s.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, spanX: x1 - x0 + 260, spanY: y1 - y0 + 220 };
})();
const overview = (aspect: number) => ({
  x: ROUTE_BOX.x,
  y: ROUTE_BOX.y,
  w: Math.max(ROUTE_BOX.spanX, ROUTE_BOX.spanY / aspect),
});
const INITIAL = overview(BASE_ASPECT);

type Props = {
  /** The leg the rest of the board is showing. */
  active: number;
  /** A leg the visitor is pointing at: the camera frames it and holds. */
  focus: number | null;
  /** Called when the travelling camera moves on to a new leg. */
  onLeg: (i: number) => void;
};

export default function RouteMap({ active, focus, onLeg }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wrap = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const legPaths = useRef<Array<SVGPathElement | null>>([]);
  const reveals = useRef<Array<SVGPathElement | null>>([]);
  const vehicle = useRef<SVGGElement>(null);
  const cars = useRef<Array<SVGGElement | null>>([]);
  const scaled = useRef<Array<SVGGElement | null>>([]);
  const pins = useRef<Array<SVGGElement | null>>([]);
  const eta = useRef<HTMLSpanElement>(null);

  // Mutable state shared by the timeline, the ticker and the props.
  const st = useRef({
    leg: 0,
    f: 0,
    mode: "overview" as "overview" | "follow" | "focus",
    cam: { ...INITIAL },
    lens: [] as number[],
    pxW: 760,
    /** Height / width of the map window, as laid out. */
    aspect: BASE_ASPECT,
    reduced: false,
  });
  const loop = useRef<gsap.core.Timeline | null>(null);
  // Known only in the browser; drives the "Full route" readout when still.
  const [still, setStill] = useState(false);
  const onLegRef = useRef(onLeg);
  onLegRef.current = onLeg;

  /** One frame: camera, route reveal, vehicle, pins, labels, ETA. */
  const draw = (dt: number) => {
    const s = st.current;
    const paths = legPaths.current;
    if (!svg.current || !paths[0] || !s.lens.length) return;

    const leg = s.leg;
    const L = s.lens[leg];
    const path = paths[leg]!;
    const at = (d: number) => path.getPointAtLength(Math.max(0, Math.min(L, d)));
    const pos = at(L * s.f);

    // Camera target: the traveller, the focused leg, or the whole route.
    let target = overview(s.aspect);
    if (s.mode === "follow") {
      const ahead = at(L * s.f + 18);
      target = {
        x: pos.x * 0.7 + ahead.x * 0.3,
        y: pos.y * 0.7 + ahead.y * 0.3,
        w: FOLLOW_W[leg] * Math.sqrt(BASE_ASPECT / s.aspect),
      };
    } else if (s.mode === "focus") {
      const b = path.getBBox();
      target = {
        x: b.x + b.width / 2,
        y: b.y + b.height / 2,
        w: Math.max(b.width + 90, (b.height + 90) / s.aspect, 110),
      };
    }
    const k = dt <= 0 ? 1 : 1 - Math.exp(-dt * 2.6);
    const c = s.cam;
    c.x += (target.x - c.x) * k;
    c.y += (target.y - c.y) * k;
    c.w += (target.w - c.w) * k;
    const h = c.w * s.aspect;
    svg.current.setAttribute("viewBox", `${c.x - c.w / 2} ${c.y - h / 2} ${c.w} ${h}`);
    const u = c.w / s.pxW; // map units per screen pixel

    // Route: legs behind are drawn, the current one up to the traveller.
    reveals.current.forEach((r, i) => {
      if (!r) return;
      const f = i < leg ? 1 : i === leg ? s.f : 0;
      r.style.strokeDashoffset = String(s.lens[i] * (1 - f));
    });

    // The vehicle (and the train's following carriages), turned to the route.
    const angle = (d: number) => {
      const a = at(d - 2);
      const b = at(d + 2);
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    };
    vehicle.current?.setAttribute(
      "transform",
      `translate(${pos.x} ${pos.y}) rotate(${angle(L * s.f)}) scale(${u})`
    );
    cars.current.forEach((car, n) => {
      if (!car) return;
      const d = L * s.f - (n + 1) * 15 * u;
      const p = at(d);
      car.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle(d)}) scale(${u})`);
      car.style.opacity = leg === 0 && d > 0 ? "1" : "0";
    });

    // Labels and pins stay the same size on screen.
    scaled.current.forEach((g, i) => {
      if (!g) return;
      g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${u})`);
      // Small water names and the stops along the road only once zoomed in,
      // like the ghats.
      if ((i < LABELS.length && LABELS[i].kind === "water-sm") || i >= STOPS_AT) {
        g.style.opacity = c.w > 380 ? "0" : "1";
      }
    });
    pins.current.forEach((p, i) => {
      if (!p) return;
      const reached = i <= leg || (i === leg + 1 && s.f >= 0.999);
      p.dataset.state = i === leg + 1 && s.mode !== "overview" ? "next" : reached ? "done" : "ahead";
      // Like a map app: the ghat and the landing only name themselves once
      // the camera is close enough for the names not to collide.
      p.dataset.far = String((i === 2 || i === 3) && c.w > 380);
    });

    if (eta.current && !(s.reduced && s.mode === "overview")) {
      const covered = journey.slice(0, leg).reduce((n, j) => n + j.minutes, 0) + journey[leg].minutes * s.f;
      eta.current.textContent = fmt(totalMinutes - covered);
    }
  };

  useEffect(() => {
    const s = st.current;
    s.reduced = prefersReducedMotion();
    s.lens = legPaths.current.map((p) => p?.getTotalLength() ?? 0);
    reveals.current.forEach((r, i) => r && (r.style.strokeDasharray = String(s.lens[i])));

    const measure = () => {
      const el = wrap.current;
      if (!el) return;
      s.pxW = el.clientWidth || 760;
      s.aspect = el.clientHeight && el.clientWidth ? el.clientHeight / el.clientWidth : BASE_ASPECT;
      if (s.reduced) draw(0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);

    if (s.reduced) {
      // No travel: the whole route, drawn, until a step is pointed at.
      setStill(true);
      s.leg = journey.length - 1;
      s.f = 1;
      draw(0);
      if (vehicle.current) vehicle.current.style.opacity = "0";
      return () => ro.disconnect();
    }

    // The loop: overview → each leg in turn → arrive and pull back.
    const tl = gsap.timeline({ paused: true, repeat: -1 });
    tl.call(() => {
      s.mode = "overview";
      s.leg = 0;
      s.f = 0;
      onLegRef.current(0);
    })
      .to({}, { duration: 1.6 })
      .call(() => {
        s.mode = "follow";
      });
    journey.forEach((_, i) => {
      tl.call(() => {
        s.leg = i;
        s.f = 0;
        onLegRef.current(i);
      }).to(s, { f: 1, duration: LEG_SECONDS[i], ease: i === 0 ? "power1.inOut" : "sine.inOut" });
    });
    tl.call(() => {
      s.mode = "overview";
    }).to({}, { duration: 3.4 });
    loop.current = tl;

    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      draw(Math.min(0.1, (now - last) / 1000));
      last = now;
    };

    // Only run while the map is on screen. (ScrollTrigger rather than an
    // IntersectionObserver: it is already in step with the smooth scroller.)
    const run = (on: boolean) => {
      if (on) {
        last = performance.now();
        gsap.ticker.add(tick);
        if (s.mode !== "focus") tl.play();
      } else {
        gsap.ticker.remove(tick);
        tl.pause();
      }
    };
    const watch = ScrollTrigger.create({
      trigger: wrap.current,
      start: "top bottom",
      end: "bottom top",
      // Measure after the pinned sections above (the tickets on this page),
      // which are created later and push the map down by their spacing.
      refreshPriority: -1,
      onToggle: (self) => run(self.isActive),
    });
    run(watch.isActive);
    draw(0);

    return () => {
      watch.kill();
      ro.disconnect();
      gsap.ticker.remove(tick);
      tl.kill();
      loop.current = null;
    };
  }, []);

  /* Pointing at a step frames that leg and holds; letting go resumes. */
  useEffect(() => {
    const s = st.current;
    if (focus === null) {
      if (s.mode === "focus") {
        if (s.reduced) {
          s.mode = "overview";
          s.leg = journey.length - 1;
          s.f = 1;
          if (vehicle.current) vehicle.current.style.opacity = "0";
          draw(0);
        } else {
          s.mode = "follow";
          loop.current?.resume();
        }
      }
      return;
    }
    loop.current?.pause();
    s.mode = "focus";
    s.leg = focus;
    s.f = 0.55;
    if (s.reduced) {
      if (vehicle.current) vehicle.current.style.opacity = "1";
      draw(0);
    }
  }, [focus]);

  const leg = journey[active];
  const showAll = still && focus === null;
  const modeName = showAll ? "Full route" : leg.mode === "Arrival" ? "Toto" : leg.mode;
  const fromTo = showAll
    ? `${journey[0].from} → ${journey[journey.length - 1].to}`
    : `${leg.from} → ${leg.to}`;

  return (
    <div
      ref={wrap}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#071226] sm:aspect-[16/10] lg:aspect-[21/9]"
    >
      <style>{`
        @keyframes rm-flow { to { stroke-dashoffset: -40; } }
        @keyframes rm-ping { 0% { transform: scale(.6); opacity: .7 } 100% { transform: scale(2.4); opacity: 0 } }
        @keyframes rm-wake { 0% { stroke-dashoffset: 0 } 100% { stroke-dashoffset: -24 } }
        .rm-flow { animation: rm-flow 5s linear infinite; }
        .rm-wake { animation: rm-wake .9s linear infinite; }
        .rm-pin .rm-ring { transform-box: fill-box; transform-origin: center; opacity: 0; }
        .rm-pin[data-state="next"] .rm-ring { animation: rm-ping 1.8s ease-out infinite; }
        .rm-pin .rm-dot { transition: fill .4s, stroke .4s; }
        .rm-pin[data-state="done"] .rm-dot, .rm-pin[data-state="next"] .rm-dot { fill: var(--color-ember-400); stroke: #fff; }
        .rm-pin[data-state="ahead"] .rm-name { opacity: .6; }
        .rm-pin .rm-name { transition: opacity .35s; }
        .rm-pin[data-far="true"] .rm-name { opacity: 0; }
        @media (prefers-reduced-motion: reduce) { .rm-flow, .rm-wake, .rm-pin .rm-ring { animation: none; } }
      `}</style>

      <svg
        ref={svg}
        viewBox={`${INITIAL.x - INITIAL.w / 2} ${INITIAL.y - (INITIAL.w * BASE_ASPECT) / 2} ${INITIAL.w} ${INITIAL.w * BASE_ASPECT}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-sea`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1d3a" />
            <stop offset="1" stopColor="#06101f" />
          </linearGradient>
          <pattern id={`${uid}-waves`} width="26" height="18" patternUnits="userSpaceOnUse">
            <path d="M2 9q4.5-3 9 0t9 0" fill="none" stroke="#6fa3e0" strokeOpacity="0.12" strokeWidth="0.8" />
            <animateTransform attributeName="patternTransform" type="translate" from="0 0" to="26 0" dur="9s" repeatCount="indefinite" />
          </pattern>
          <pattern id={`${uid}-paddy`} width="9" height="9" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.7" fill="#9fb8a0" fillOpacity="0.07" />
          </pattern>
          <clipPath id={`${uid}-land`}>
            {LAND.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </clipPath>
          {LEGS.map((d, i) => (
            <mask key={i} id={`${uid}-leg${i}`} maskUnits="userSpaceOnUse" x={-1000} y={-1000} width={3000} height={3600}>
              <path
                ref={(p) => {
                  reveals.current[i] = p;
                }}
                d={d}
                stroke="white"
                strokeWidth="60"
                strokeLinecap="round"
                fill="none"
              />
            </mask>
          ))}
        </defs>

        {/* Sea, with a slow drift of ripples */}
        <rect x={-1200} y={-1200} width={VIEW.w + 2400} height={VIEW.h + 2400} fill={`url(#${uid}-sea)`} />
        <rect x={-1200} y={-1200} width={VIEW.w + 2400} height={VIEW.h + 2400} fill={`url(#${uid}-waves)`} />

        {/* Land: the real coastline, softly lit at the shore */}
        {LAND.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#2d63ad" strokeOpacity="0.18" strokeWidth="6" vectorEffect="non-scaling-stroke" />
            <path d={d} fill="#111a28" />
            <path d={d} fill={`url(#${uid}-paddy)`} />
            <path d={d} fill="none" stroke="#6fa3e0" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        ))}

        {/* The Hatania-Doania and the Chinai, cut through the land by hand
            (Natural Earth joins the islands) and shown only over land */}
        <g clipPath={`url(#${uid}-land)`}>
          {[HATANIA, CHINAI].map((d) => (
            <path key={d} d={d} fill="#0b1d3a" stroke="#6fa3e0" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Rivers, with a slow current */}
        {RIVERS.map((d, i) => (
          <g key={i}>
            <path d={d} fill="none" stroke="#14315e" strokeWidth="3.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path
              d={d}
              className="rm-flow"
              fill="none"
              stroke="#6fa3e0"
              strokeOpacity="0.5"
              strokeWidth="1.2"
              strokeDasharray="4 14"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* The route still to travel: a faint dashed guide */}
        {LEGS.map((d, i) => (
          <path
            key={i}
            ref={(p) => {
              legPaths.current[i] = p;
            }}
            d={d}
            fill="none"
            stroke="#f4efe6"
            strokeOpacity="0.28"
            strokeWidth="1.5"
            strokeDasharray="3 5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* The route travelled: glow under a line in each leg's own style */}
        {LEGS.map((d, i) => (
          <g key={i} mask={`url(#${uid}-leg${i})`}>
            <path d={d} fill="none" stroke="var(--color-ember-400)" strokeOpacity="0.22" strokeWidth="10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {i === 0 && (
              <path d={d} fill="none" stroke="var(--color-ember-500)" strokeWidth="8" strokeDasharray="1.5 6" vectorEffect="non-scaling-stroke" />
            )}
            <path
              d={d}
              fill="none"
              stroke="var(--color-ember-300)"
              strokeWidth={i === 3 ? 3 : 2.5}
              strokeLinecap="round"
              strokeDasharray={i === 2 ? "8 6" : i === 3 ? "0.1 7" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        {/* Place names: water, land, towns on the line */}
        {LABELS.map((l, i) => (
          <g
            key={l.text}
            ref={(g) => {
              scaled.current[i] = g;
            }}
            data-x={l.x}
            data-y={l.y}
            transform={`translate(${l.x} ${l.y})`}
          >
            <text
              textAnchor="middle"
              className={
                l.kind === "city"
                  ? "fill-bone font-display text-[17px]"
                  : l.kind === "land"
                    ? "fill-sand-dim text-[10px] uppercase tracking-[0.3em]"
                    : l.kind === "sea"
                      ? "fill-neel-300/70 text-[12px] uppercase tracking-[0.5em]"
                      : "fill-neel-300/80 font-display text-[14px] italic"
              }
            >
              {l.text}
            </text>
          </g>
        ))}
        {TOWNS.map((t, i) => (
          <g
            key={t.name}
            ref={(g) => {
              scaled.current[LABELS.length + i] = g;
            }}
            data-x={t.x}
            data-y={t.y}
            transform={`translate(${t.x} ${t.y})`}
          >
            <circle r="2.5" fill="#f4efe6" fillOpacity="0.5" />
            <text x="8" y="4" className="fill-sand-dim text-[11px]">
              {t.name}
            </text>
          </g>
        ))}

        {/* Stops along the road: the bridge and the turn at 7 Mile */}
        {STOPS.map((t, i) => (
          <g
            key={t.name}
            ref={(g) => {
              scaled.current[STOPS_AT + i] = g;
            }}
            data-x={t.x}
            data-y={t.y}
            transform={`translate(${t.x} ${t.y})`}
            style={{ opacity: 0 }}
          >
            <rect x="-2.5" y="-2.5" width="5" height="5" rx="1" fill="#f4efe6" fillOpacity="0.75" />
            {/* The turn at 7 Mile sits just east of the ghat, whose name runs
                towards it, so it is named on its far side. */}
            <text
              x={i === STOPS.length - 1 ? 8 : -8}
              y="4"
              textAnchor={i === STOPS.length - 1 ? "start" : "end"}
              className="fill-sand text-[11px]"
              paintOrder="stroke"
              stroke="#071226"
              strokeWidth="3"
            >
              {t.name}
            </text>
          </g>
        ))}

        {/* Stations: pins that light as the traveller reaches them */}
        {STATIONS.map((p, i) => {
          const end = i === STATIONS.length - 1;
          return (
            <g
              key={p.name}
              ref={(g) => {
                scaled.current[LABELS.length + TOWNS.length + i] = g;
                pins.current[i] = g;
              }}
              className="rm-pin"
              data-state={i === 0 ? "done" : "ahead"}
              data-x={p.x}
              data-y={p.y}
              transform={`translate(${p.x} ${p.y})`}
            >
              <circle className="rm-ring" r="9" fill="none" stroke="var(--color-ember-400)" strokeWidth="1.5" />
              {end ? (
                <path
                  className="rm-dot"
                  d="M0 0C-6-8-9-11-9-16a9 9 0 0 1 18 0c0 5-3 8-9 16Z"
                  fill="#0b1424"
                  stroke="#f4efe6"
                  strokeWidth="1.5"
                />
              ) : (
                <circle className="rm-dot" r="5" fill="#0b1424" stroke="#f4efe6" strokeWidth="1.5" />
              )}
              <text
                className="rm-name fill-bone font-display"
                x={end ? 14 : i === LANDING_PIN ? -11 : 11}
                y={end ? -10 : 5}
                textAnchor={i === LANDING_PIN ? "end" : undefined}
                fontSize={end ? 17 : 14}
                paintOrder="stroke"
                stroke="#071226"
                strokeWidth="4"
                strokeLinejoin="round"
              >
                {p.name}
              </text>
              {i === GHAT_PIN && (
                <g className="rm-name">
                  {/* Parking */}
                  <g transform="translate(11 14)">
                    <rect width="15" height="15" rx="3" fill="#2d63ad" stroke="#071226" strokeWidth="1" />
                    <text x="7.5" y="11.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">
                      P
                    </text>
                    <text x="21" y="11.5" fontSize="11" className="fill-sand" paintOrder="stroke" stroke="#071226" strokeWidth="3">
                      Parking
                    </text>
                  </g>
                  {/* The camp's booking counter */}
                  <g transform="translate(11 33)">
                    <rect width="15" height="15" rx="3" fill="var(--color-ember-400)" stroke="#071226" strokeWidth="1" />
                    <path d="M3.5 12L7.5 3.5L11.5 12Z M7.5 8.5V12" fill="#071226" stroke="#071226" strokeWidth="0.8" strokeLinejoin="round" />
                    <text x="21" y="11.5" fontSize="11" className="fill-sand" paintOrder="stroke" stroke="#071226" strokeWidth="3">
                      Camp booking
                    </text>
                  </g>
                </g>
              )}
            </g>
          );
        })}

        {/* Following carriages (train only) */}
        {Array.from({ length: TRAIN_CARS - 1 }, (_, n) => (
          <g
            key={n}
            ref={(g) => {
              cars.current[n] = g;
            }}
            style={{ opacity: 0 }}
          >
            <rect x="-7" y="-3.2" width="13" height="6.4" rx="1.6" fill="var(--color-ember-500)" stroke="#071226" strokeWidth="0.8" />
            <rect x="-5" y="-1" width="9" height="2" rx="1" fill="#071226" fillOpacity="0.35" />
          </g>
        ))}

        {/* The traveller, drawn from above, pointing along the route */}
        <g ref={vehicle}>
          <circle r="22" fill="var(--color-ember-400)" fillOpacity="0.16" />
          {leg.mode === "Rail" && (
            <g>
              <rect x="-7" y="-3.4" width="15" height="6.8" rx="2.4" fill="var(--color-ember-300)" stroke="#071226" strokeWidth="0.8" />
              <rect x="-5" y="-1" width="9" height="2" rx="1" fill="#071226" fillOpacity="0.35" />
            </g>
          )}
          {leg.mode === "Road" && (
            <g>
              <rect x="-7" y="-4" width="14" height="8" rx="2.5" fill="#f4efe6" stroke="#071226" strokeWidth="0.8" />
              <rect x="1.5" y="-3" width="3.5" height="6" rx="1" fill="#14315e" />
              <rect x="-5" y="-3" width="4" height="6" rx="1" fill="#14315e" fillOpacity="0.5" />
            </g>
          )}
          {leg.mode === "River" && (
            <g>
              <path
                className="rm-wake"
                d="M-7 -1L-30 -9M-7 1L-30 9"
                fill="none"
                stroke="#cfe3ff"
                strokeOpacity="0.55"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
              <path d="M-8 -3.6H4L10 0L4 3.6H-8Z" fill="#f4efe6" stroke="#071226" strokeWidth="0.8" />
              <rect x="-5" y="-2" width="6" height="4" rx="1" fill="var(--color-ember-400)" />
            </g>
          )}
          {leg.mode === "Arrival" && (
            <g>
              <rect x="-6" y="-3.6" width="12" height="7.2" rx="2" fill="#7bc47f" stroke="#071226" strokeWidth="0.8" />
              <rect x="-6" y="-3.6" width="7" height="7.2" rx="2" fill="#f4efe6" fillOpacity="0.85" />
            </g>
          )}
        </g>
      </svg>

      {/* Edge vignette so the map sits in the card */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_70px_rgba(3,5,9,0.85)]" />

      {/* Navigation readout */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 rounded-full border border-bone/15 bg-abyss/70 px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.16em] text-bone backdrop-blur-md sm:text-[0.62rem] sm:tracking-[0.18em]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember-400 shadow-[0_0_8px_var(--color-ember-400)]" />
          <span className="truncate">
            {modeName}
            <span className="hidden sm:inline">
              {" "}
              · {fromTo}
            </span>
          </span>
        </span>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-bone/15 bg-abyss/70 px-3 py-1.5 text-[0.56rem] uppercase tracking-[0.16em] text-sand backdrop-blur-md tabular-nums sm:text-[0.62rem] sm:tracking-[0.18em]">
          ETA <span ref={eta} className="text-bone">{fmt(totalMinutes)}</span>
        </span>
      </div>
      <p className="pointer-events-none absolute bottom-2.5 left-3 text-[0.5rem] uppercase tracking-[0.2em] text-sand-dim/80 sm:text-[0.55rem]">
        <span className="hidden sm:inline">Simulated trip · map: </span>Natural Earth · positions approximate
      </p>
    </div>
  );
}
