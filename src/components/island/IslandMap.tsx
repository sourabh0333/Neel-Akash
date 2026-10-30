"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { CHINAI, HATANIA, LAND, LEGS, RIVERS, STATIONS } from "../route/geo";

type Box = [x: number, y: number, w: number, h: number];

/**
 * Stops on the way in, in the route map's own coordinates (geo.ts). Village
 * positions are approximate — set by eye on the Natural Earth coastline —
 * and the map says so.
 */
const STOPS: {
  key: string;
  title: string;
  kicker: string;
  text: string;
  cam: Box;
  pin?: { x: number; y: number };
}[] = [
  {
    key: "delta",
    title: "The delta",
    kicker: "Kolkata to the bay",
    text: "South of Kolkata the land breaks into islands, creeks and tide-flats. Mousuni is very nearly the last of them before the open sea.",
    cam: [150, 120, 700, 1330],
  },
  {
    key: "island",
    title: "Mousuni",
    kicker: "Between two rivers",
    text: "The Muri Ganga on one side, the Chinai on the other, and the Bay of Bengal along the whole southern edge.",
    cam: [262, 1088, 190, 190],
  },
  {
    key: "bagdanga",
    title: "Bagdanga",
    kicker: "01 · The landing",
    text: "Boats come over from Hujjuti Ghat with the tide, and the whole village knows before you do.",
    cam: [305, 1082, 115, 88],
    pin: { x: 362.2, y: 1126.4 },
  },
  {
    key: "kusumtala",
    title: "Kusumtala",
    kicker: "02 · Where we are",
    text: "Paddy, betel groves and brick paths. The island's quiet middle, and the camp.",
    cam: [298, 1138, 115, 92],
    pin: { x: 357, y: 1180 },
  },
  {
    key: "baliara",
    title: "Baliara",
    kicker: "03 · The seaward edge",
    text: "Open beach, casuarina, and the wind that never quite stops.",
    cam: [292, 1178, 115, 92],
    pin: { x: 349, y: 1224 },
  },
  {
    key: "chor",
    title: "Kakramarir Chor",
    kicker: "04 · An hour out by boat",
    text: "A sandbar out in the bay, populated entirely by birds.",
    cam: [262, 1210, 150, 118],
    pin: { x: 336, y: 1270 },
  },
];

const CAMP = STATIONS.find((s) => s.name === "Penguin Beach Camp")!;
/** Where the island's name sits: over its middle, west of the Chinai. */
const ISLAND_LABEL = { x: 312, y: 1160 };

/**
 * The island, found from the air. The section pins and scrolling flies the
 * camera from the whole delta down to Mousuni, then village by village out to
 * the sandbar. Pins and labels are counter-scaled so they keep their size
 * whatever the zoom.
 */
export default function IslandMap() {
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const el = root.current;
      const s = svg.current;
      if (!el || !s) return;

      const cam = { x: 0, y: 0, w: 0, h: 0 };
      const apply = () => {
        // meet: one unit is this many px; pins scale by the inverse.
        const u = 1 / Math.min(s.clientWidth / cam.w, s.clientHeight / cam.h);
        // On a tall screen the card covers the lower third, so frame the
        // subject higher up.
        const lift = s.clientHeight > s.clientWidth ? s.clientHeight * u * 0.14 : 0;
        s.setAttribute("viewBox", `${cam.x} ${cam.y + lift} ${cam.w} ${cam.h}`);
        s.querySelectorAll<SVGGElement>("[data-pin]").forEach((g) => {
          g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${u})`);
        });
        // Village names only once the camera is close enough to read them.
        s.style.setProperty("--near", cam.w < 260 ? "1" : "0");
      };

      const set = (b: Box) => Object.assign(cam, { x: b[0], y: b[1], w: b[2], h: b[3] });

      if (prefersReducedMotion()) {
        set(STOPS[1].cam);
        apply();
        setActive(1);
        const onResize = () => apply();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
      }

      set(STOPS[0].cam);
      apply();

      // Each stop: fly (1) then hold (0.7) so the card can be read.
      const per = 1.7;
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        // Read the stop off the timeline itself, so the card changes with the
        // camera as scrub catches up, not ahead of it with the scrollbar.
        onUpdate: () => {
          apply();
          const i = Math.min(STOPS.length - 1, Math.max(0, Math.round((tl.time() - 0.4) / per)));
          setActive((a) => (a === i ? a : i));
        },
      });
      tl.to({}, { duration: 0.4 });
      STOPS.slice(1).forEach((stop) => {
        tl.to(cam, { x: stop.cam[0], y: stop.cam[1], w: stop.cam[2], h: stop.cam[3], duration: 1 });
        tl.to({}, { duration: 0.7 });
      });

      // The route in fades up, leg by leg, as the camera leaves the delta.
      const legs = gsap.utils.toArray<SVGPathElement>(".im-leg", el);
      gsap.set(legs, { opacity: 0 });
      tl.to(legs, { opacity: 1, duration: 0.8, stagger: 0.12, ease: "none" }, 0);

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * STOPS.length * 0.9}`,
        pin: true,
        scrub: 1,
        animation: tl,
        invalidateOnRefresh: true,
      });

      const onResize = () => apply();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    },
    { scope: root }
  );

  const stop = STOPS[active];

  return (
    <section
      ref={root}
      aria-label="Map of Mousuni Island"
      className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-[#050c1a]"
    >
      <svg
        ref={svg}
        viewBox={STOPS[0].cam.join(" ")}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full [--near:0]"
        role="img"
        aria-label="Mousuni Island and its villages, south of Kolkata at the mouth of the delta"
      >
        <defs>
          <pattern id="im-dots" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.35" fill="#6fa3e0" opacity="0.18" />
          </pattern>
          <radialGradient id="im-glow">
            <stop offset="0" stopColor="#ffc27a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffc27a" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#im-dots)" />

        <g>
          {LAND.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#15294a"
              stroke="#6fa3e0"
              strokeOpacity="0.7"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {[HATANIA, CHINAI].map((d) => (
            <path key={d} d={d} fill="#050c1a" />
          ))}
          {RIVERS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke="#2d63ad"
              strokeOpacity="0.5"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </g>

        {/* Sandbar, drawn by hand — too small for Natural Earth. */}
        <ellipse cx="336" cy="1271" rx="9" ry="2.6" fill="#d8cdbb" opacity="0.28" transform="rotate(-18 336 1271)" />

        {LEGS.map((d, i) => (
          <path
            key={i}
            d={d}
            className="im-leg"
            fill="none"
            stroke="#f39c4a"
            strokeOpacity="0.7"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* The camp: a soft glow and an ember point. */}
        <g data-pin data-x={CAMP.x} data-y={CAMP.y}>
          <circle r="34" fill="url(#im-glow)" className="animate-pulse" />
          <circle r="5" fill="#ffc27a" />
          <circle r="11" fill="none" stroke="#ffc27a" strokeOpacity="0.6" />
          <text x="16" y="4" fontSize="12" fill="#f4efe6" className="font-sans" letterSpacing="1">
            PENGUIN BEACH CAMP
          </text>
        </g>

        <g data-pin data-x={ISLAND_LABEL.x} data-y={ISLAND_LABEL.y} className="transition-opacity duration-500"
          style={{ opacity: active <= 1 ? 1 : 0 }}>
          <text fontSize="13" fill="#d8cdbb" className="font-display" letterSpacing="1">
            Mousuni Island
          </text>
        </g>

        {STOPS.map((s, i) =>
          s.pin ? (
            <g
              key={s.key}
              data-pin
              data-x={s.pin.x}
              data-y={s.pin.y}
              className="transition-opacity duration-500"
              style={{ opacity: active === i ? 1 : "calc(var(--near) * 0.55)" }}
            >
              {active === i && (
                <circle r="9" fill="none" stroke="#f4efe6" strokeWidth="1">
                  <animate attributeName="r" values="6;22" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle r="4.5" fill={active === i ? "#f4efe6" : "#8d8577"} />
              <text x="12" y="-8" fontSize="14" fill="#f4efe6" className="font-display">
                {s.title}
              </text>
            </g>
          ) : null
        )}
      </svg>

      {/* Edges fade into the page. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-abyss to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-abyss/90 to-transparent" />

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-between px-6 pb-8 pt-28 md:px-10 md:pb-12 md:pt-32">
        <div className="flex items-start justify-between gap-6">
          <p className="t-eyebrow text-ember-500">The island, from above</p>
          <ol className="hidden gap-2 md:flex" aria-hidden="true">
            {STOPS.map((s, i) => (
              <li
                key={s.key}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-ember-400" : i < active ? "w-4 bg-bone/50" : "w-4 bg-bone/15"
                }`}
              />
            ))}
          </ol>
        </div>

        <div className="max-w-md rounded-2xl border border-bone/10 bg-abyss/70 p-6 backdrop-blur-md md:p-8">
          <div key={stop.key} className="animate-[im-in_0.6s_var(--ease-cinema)_both]">
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-ember-400">{stop.kicker}</p>
            <h2 className="font-display t-big mt-3 text-bone">{stop.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-sand">{stop.text}</p>
          </div>
          <p className="mt-6 border-t border-bone/10 pt-4 text-[0.58rem] uppercase tracking-[0.2em] text-sand-dim">
            Map: Natural Earth · village positions approximate
          </p>
        </div>
      </div>
    </section>
  );
}
