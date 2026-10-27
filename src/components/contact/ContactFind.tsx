"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";
import { CHINAI, LAND, LEGS, STATIONS } from "../route/geo";

const CAMP = STATIONS.find((s) => s.name === "Penguin Beach Camp")!;
const LANDING = STATIONS.find((s) => s.name === "Mousuni Island")!;
const GHAT = STATIONS.find((s) => s.name === "Bagdanga Ghat")!;

/**
 * Where we are, drawn from the same Natural Earth data as the route map: the
 * island, the ferry across the Chinai and the last stretch by toto, with the
 * camp pulsing at the end. The map settles in from a wider view as it arrives.
 */
export default function ContactFind() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const svg = root.current!.querySelector<SVGSVGElement>(".cf-map")!;
      const far = { x: 220, y: 980, w: 360, h: 420 };
      const near = { x: 300, y: 1085, w: 190, h: 220 };
      const set = (b: typeof far) => svg.setAttribute("viewBox", `${b.x} ${b.y} ${b.w} ${b.h}`);
      if (prefersReducedMotion()) {
        set(near);
        return;
      }
      const cam = { ...far };
      set(cam);
      gsap.to(cam, {
        ...near,
        ease: "power2.inOut",
        onUpdate: () => set(cam),
        scrollTrigger: { trigger: svg, start: "top 90%", end: "center 55%", scrub: 0.8 },
      });
      gsap.fromTo(
        ".cf-route",
        { opacity: 0 },
        { opacity: 1, scrollTrigger: { trigger: svg, start: "top 70%", end: "center 55%", scrub: true } }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative border-t border-bone/10 bg-ink py-28 md:py-36">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-6 md:px-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <p className="t-eyebrow text-ember-500">Find us</p>
          <h2 className="font-display t-huge mt-5 text-bone">
            At the end of <span className="italic text-ember-300">the line</span>
          </h2>
          <address className="mt-8 not-italic leading-relaxed text-sand">
            {site.location.village}, {site.location.island}
            <br />
            {site.location.block}, {site.location.district}
            <br />
            {site.location.state} {site.location.pin}
          </address>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-bone px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
            >
              Google Maps <span aria-hidden="true">↗</span>
            </a>
            <a
              href="/getting-here"
              className="inline-flex items-center gap-3 rounded-full border border-bone/25 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
            >
              How to get here
            </a>
          </div>
        </div>

        <figure className="relative overflow-hidden rounded-3xl border border-bone/10 bg-[#050c1a] lg:col-span-7">
          <svg
            className="cf-map aspect-4/3 w-full"
            viewBox="300 1085 190 220"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={`Map: ${site.name} on ${site.location.island}, across the Chinai from Bagdanga Ghat`}
          >
            <defs>
              <pattern id="cf-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.35" fill="#6fa3e0" opacity="0.2" />
              </pattern>
            </defs>
            <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#cf-dots)" />
            {LAND.map((d, i) => (
              <path key={i} d={d} fill="#15294a" stroke="#6fa3e0" strokeOpacity="0.7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            <path d={CHINAI} fill="#050c1a" />

            <g className="cf-route">
              {LEGS.slice(2).map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#f39c4a"
                  strokeWidth="2"
                  strokeDasharray={i === 0 ? "6 5" : "0.1 6"}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              {[GHAT, LANDING].map((s) => (
                <g key={s.name}>
                  <circle cx={s.x} cy={s.y} r="2.2" fill="#f4efe6" />
                  <text x={s.x + 4} y={s.y + 1.5} fontSize="5.5" fill="#d8cdbb" className="font-sans">
                    {s.name}
                  </text>
                </g>
              ))}
            </g>

            <g transform={`translate(${CAMP.x} ${CAMP.y})`}>
              <circle r="4" fill="none" stroke="#ffc27a" strokeWidth="1">
                <animate attributeName="r" values="3;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="3" fill="#ffc27a" />
              <text x="6" y="2" fontSize="6.5" fill="#f4efe6" className="font-display">
                {site.name}
              </text>
            </g>
          </svg>
          <figcaption className="absolute bottom-4 left-5 text-[0.56rem] uppercase tracking-[0.2em] text-sand-dim">
            Map: Natural Earth · position approximate
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
