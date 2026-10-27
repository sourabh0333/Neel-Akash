"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { experiences } from "@/lib/site";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toClock = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.floor(min % 60)).padStart(2, "0")}`;

/** The day the arc covers: 05:00 at the left horizon to 20:00 at the right. */
const START = 5 * 60;
const END = 20 * 60;
const frac = (t: string) => (toMin(t) - START) / (END - START);

/* The sun's path: half a circle standing on the horizon. */
const CX = 500;
const CY = 500;
const R = 420;
const ARC = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`;
const at = (f: number) => {
  const a = Math.PI * (1 - f);
  return { x: CX + R * Math.cos(a), y: CY - R * Math.sin(a) };
};

/* The sky through the day, evenly spaced from dawn to night. */
const SKY_TOP = ["#1d1b3f", "#2f5e9e", "#3f74b4", "#4a5f8e", "#3a2a4f", "#050a1c"];
const SKY_BOT = ["#e0875a", "#9cc4e4", "#b9d6ec", "#efb46a", "#e06a3c", "#111a33"];
const SUN = ["#ffc58a", "#fff3d2", "#fff8e6", "#ffd690", "#ff8a4a", "#dfe6ff"];
const SEA = ["#1b2140", "#1f4a7a", "#24578c", "#2c4366", "#2a1f3a", "#03060f"];

/**
 * The day as the sun sees it. The section pins and scrolling carries the
 * sun from the left horizon to the right: the sky runs from dawn to night,
 * the clock keeps time, its light trails across the sea, the stars come out
 * at the end, and each of the day's moments lights up as the sun reaches it.
 */
export default function DaysSunArc() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  // A fixed star field. Integer-only arithmetic (an LCG), so the server and
  // the browser draw exactly the same sky — Math.sin can differ in the last
  // digits between them, and React would flag the mismatch.
  const stars = useMemo(() => {
    let seed = 7;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return (seed >>> 8) / 16777216;
    };
    return Array.from({ length: 70 }, () => ({
      x: Math.round(rnd() * 1000),
      y: Math.round(rnd() * 470),
      s: Math.round((0.6 + rnd() * 1.6) * 10) / 10,
      d: Math.round(rnd() * 30) / 10,
    }));
  }, []);

  useGSAP(
    () => {
      const el = root.current!;
      const sky = el.querySelector<HTMLElement>(".sa-sky")!;
      const sea = el.querySelector<HTMLElement>(".sa-sea")!;
      const sun = el.querySelector<SVGGElement>(".sa-sun")!;
      const core = el.querySelector<SVGCircleElement>(".sa-core")!;
      const trail = el.querySelector<SVGPathElement>(".sa-trail")!;
      const glint = el.querySelector<HTMLElement>(".sa-glint")!;
      const starG = el.querySelector<SVGGElement>(".sa-stars")!;
      const clock = el.querySelector<HTMLElement>(".sa-clock")!;
      const len = trail.getTotalLength();
      const top = gsap.utils.interpolate(SKY_TOP);
      const bot = gsap.utils.interpolate(SKY_BOT);
      const sunC = gsap.utils.interpolate(SUN);
      const seaC = gsap.utils.interpolate(SEA);
      const marks = experiences.map((x) => frac(x.time));

      const render = (p: number) => {
        const { x, y } = at(p);
        sky.style.background = `linear-gradient(to bottom, ${top(p)}, ${bot(p)})`;
        sea.style.background = `linear-gradient(to bottom, ${seaC(p)}, #030509)`;
        sun.setAttribute("transform", `translate(${x} ${y})`);
        core.setAttribute("fill", sunC(p));
        trail.style.strokeDashoffset = String(len * (1 - p));
        glint.style.left = `${x / 10}%`;
        glint.style.opacity = String(Math.max(0, 1 - Math.abs(p - 0.5) * 0.9));
        glint.style.background = `radial-gradient(ellipse at center, ${sunC(p)}, transparent 70%)`;
        starG.style.opacity = String(gsap.utils.clamp(0, 1, (p - 0.82) / 0.15));
        clock.textContent = toClock(START + p * (END - START));
        let i = 0;
        marks.forEach((m, k) => p >= m - 0.01 && (i = k));
        setActive((a) => (a === i ? a : i));
      };

      gsap.set(trail, { strokeDasharray: len });

      if (prefersReducedMotion()) {
        render(frac(experiences[0].time));
        return;
      }

      const state = { p: 0 };
      render(0);
      gsap.to(state, {
        p: 1,
        ease: "none",
        onUpdate: () => render(state.p),
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=320%",
          pin: true,
          scrub: 0.8,
        },
      });
    },
    { scope: root }
  );

  const x = experiences[active];

  return (
    <section
      ref={root}
      aria-label="The day, sunrise to bonfire"
      className="relative h-[100svh] min-h-[36rem] overflow-hidden bg-abyss"
    >
      <div className="sa-sky absolute inset-0" />

      {/* The stage keeps the arc's proportions; the sea runs from its horizon down. */}
      <div className="absolute inset-x-0 top-[16%] mx-auto aspect-[1000/560] w-[min(100%,calc(50svh*1000/560))] md:top-[13%]">
        <div className="sa-sea absolute left-1/2 top-[89.3%] h-[100svh] w-[100vw] -translate-x-1/2" />
        <div className="sa-glint pointer-events-none absolute top-[89.3%] h-[30svh] w-[18%] -translate-x-1/2 blur-md" />

        <svg viewBox="0 0 1000 560" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <g className="sa-stars" opacity="0">
            {stars.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#f4efe6">
                <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2.5 + s.d}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          <path d={ARC} fill="none" stroke="#f4efe6" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 8" />
          <path className="sa-trail" d={ARC} fill="none" stroke="#ffc27a" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="-2000" x2="3000" y1={CY} y2={CY} stroke="#f4efe6" strokeOpacity="0.35" strokeWidth="1" />

          {experiences.map((e, i) => {
            const p = at(frac(e.time));
            const on = i <= active;
            return (
              <g key={e.index} transform={`translate(${p.x} ${p.y})`}>
                <circle r={i === active ? 9 : 6} fill={on ? "#ffc27a" : "#030509"} stroke="#ffc27a" strokeWidth="2" className="transition-all duration-500" />
                <text
                  y={-22}
                  textAnchor="middle"
                  fontSize="20"
                  fill="#f4efe6"
                  opacity={on ? 1 : 0.55}
                  className="font-sans tabular-nums transition-opacity duration-500"
                  letterSpacing="2"
                >
                  {e.time}
                </text>
              </g>
            );
          })}

          <g className="sa-sun" transform={`translate(${at(0).x} ${at(0).y})`}>
            <circle r="70" fill="#ffc27a" opacity="0.12" />
            <circle r="42" fill="#ffc27a" opacity="0.22" />
            <circle className="sa-core" r="24" fill="#ffc58a" />
          </g>
        </svg>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-between px-6 pb-8 pt-24 md:px-10 md:pb-12 md:pt-28">
        <div className="flex items-start justify-between">
          <p className="t-eyebrow text-bone/80">The day, as the sun sees it</p>
          <p className="sa-clock font-display text-4xl text-bone tabular-nums md:text-6xl">05:00</p>
        </div>

        <div className="max-w-md rounded-2xl border border-bone/15 bg-abyss/60 p-6 backdrop-blur-md md:p-8">
          <div key={x.index} className="animate-[im-in_0.6s_var(--ease-cinema)_both]">
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-ember-300">
              {x.index} · {x.time}
            </p>
            <h2 className="font-display t-big mt-3 text-bone">{x.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-sand">{x.copy}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
