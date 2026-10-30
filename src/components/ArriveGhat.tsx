"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { ghat, journey, site, stays } from "@/lib/site";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

const parking = ghat.facilities.find((f) => f.id === "parking")!;
const booking = ghat.facilities.find((f) => f.id === "booking")!;
const crossing = journey.find((j) => j.mode === "River")!;
const fromPrice = Math.min(...stays.filter((s) => s.mealsIncluded).map((s) => s.price));
const parkingFee = Number(parking.price!.replace(/\D/g, ""));

/** The last stretch on land, stop by stop, as the strip draws it. */
const STOPS = [
  { key: "turn", label: ghat.landmark, note: "Off the Bakkhali road" },
  { key: "parking", label: "Car parking", note: `${parking.price} ${parking.priceNote}` },
  { key: "booking", label: "Booking counter", note: "Walk in, we sort it out" },
  { key: "boat", label: "Boat to Mousuni", note: `${crossing.duration} across the Chinai` },
];

const TICKER = [
  ghat.full,
  `Car parking ${parking.price} ${parking.priceNote}`,
  "Our booking counter at the ghat",
  `${ghat.landmark} · Bakkhali road`,
  "Boats run with the tide",
];

/**
 * Arriving by road: the last stop on land, Hujjaiter Kheya Ghat.
 *
 * Three beats, top to bottom:
 *   1. the heading over a slow ticker of what is waiting there;
 *   2. "the last stretch" — a road from 7 Mile past the parking and our
 *      counter to the boat; scrolling drives a car along it, lighting each
 *      stop, and at the river the car becomes a boat;
 *   3. the parking and the counter as two cards: photographs that open out
 *      from a smaller frame and drift as you scroll, a spotlight and a slight
 *      tilt that follow the pointer, the fee counting up, and Directions
 *      straight to each on Google Maps.
 *
 * It sits right after the opening of Getting Here (the anchor #arrive),
 * after the stays on Home, and on Contact. With reduced motion everything
 * is simply shown, the car parked at the boat.
 */
export default function ArriveGhat({ className = "" }: { className?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) return;

      // ── The last stretch: the car drives with the scroll ──
      const strip = el.querySelector<HTMLElement>(".ag-strip")!;
      const stops = gsap.utils.toArray<HTMLElement>(".ag-stop", el);
      const car = el.querySelector<HTMLElement>(".ag-car")!;
      const boatAt = 2 / 3; // past the counter, the road meets the river
      gsap.set(".ag-fill", { scaleX: 0 });
      gsap.set(car, { left: "0%" });
      stops.forEach((s, i) => (s.dataset.on = String(i === 0)));
      gsap
        .timeline({
          scrollTrigger: {
            trigger: strip,
            start: "top 85%",
            end: "bottom 40%",
            scrub: 0.8,
            onUpdate: (self) => {
              const p = self.progress;
              stops.forEach((s, i) => (s.dataset.on = String(p >= i / 3 - 0.02)));
              car.dataset.mode = p >= boatAt ? "boat" : "car";
            },
          },
        })
        .to(".ag-fill", { scaleX: 1, ease: "none" }, 0)
        .to(car, { left: "100%", ease: "none" }, 0);

      // ── The cards ──
      gsap.utils.toArray<HTMLElement>(".ag-card", el).forEach((card, i) => {
        // Arrive: lift in, the photo opens out from a smaller frame.
        gsap
          .timeline({ scrollTrigger: { trigger: card, start: "top 88%", once: true }, delay: i * 0.12 })
          .fromTo(card, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" })
          .fromTo(
            card.querySelector(".ag-media"),
            { clipPath: "inset(10% 8% 10% 8% round 28px)" },
            { clipPath: "inset(0% 0% 0% 0% round 20px)", duration: 1.4, ease: "expo.out" },
            0
          );
        // Then the photo drifts inside its frame as the page moves.
        gsap.fromTo(
          card.querySelector(".ag-img"),
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      // The fee counts up to itself.
      const fee = el.querySelector<HTMLElement>(".ag-fee");
      if (fee) {
        const n = { v: 0 };
        gsap.to(n, {
          v: parkingFee,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: fee, start: "top 90%", once: true },
          onUpdate: () => (fee.textContent = String(Math.round(n.v))),
        });
      }
    },
    { scope: root }
  );

  /** A spotlight and a slight tilt that follow the pointer (fine pointers only). */
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    gsap.to(card.querySelector(".ag-tilt"), {
      rotationY: (x - 0.5) * 5,
      rotationX: (0.5 - y) * 4,
      transformPerspective: 1100,
      duration: 0.6,
      ease: "power3.out",
    });
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget.querySelector(".ag-tilt"), {
      rotationX: 0,
      rotationY: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
  };

  return (
    <section
      ref={root}
      id="arrive"
      aria-labelledby="arrive-title"
      className={`relative scroll-mt-24 overflow-hidden border-y border-bone/10 bg-ink py-24 md:py-32 ${className}`}
    >
      <style>{`
        .ag-stop .ag-dot { transition: background-color .5s, box-shadow .5s, transform .5s; }
        .ag-stop[data-on="true"] .ag-dot { background: var(--color-ember-400); box-shadow: 0 0 0 6px color-mix(in oklab, var(--color-ember-400) 22%, transparent), 0 0 24px var(--color-ember-400); transform: scale(1.15); }
        .ag-stop .ag-label { transition: color .5s, opacity .5s; }
        .ag-stop[data-on="false"] .ag-label { opacity: .45; }
        .ag-car .ag-boat, .ag-car[data-mode="boat"] .ag-auto { opacity: 0; transform: scale(.6); }
        .ag-car[data-mode="boat"] .ag-boat { opacity: 1; transform: none; }
        .ag-car .ag-auto, .ag-car .ag-boat { transition: opacity .35s, transform .45s cubic-bezier(.16,1,.3,1); }
        .ag-spot { background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), color-mix(in oklab, var(--color-ember-300) 14%, transparent), transparent 65%); }
        @keyframes ag-tick { to { transform: translateX(-50%); } }
        .ag-ticker { animation: ag-tick 48s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ag-ticker { animation: none; } }
      `}</style>

      {/* A slow ticker of what is waiting at the ghat, behind the heading */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-10 overflow-hidden opacity-[0.07] md:top-14">
        <div className="ag-ticker flex w-max whitespace-nowrap font-display text-[clamp(3rem,9vw,8rem)] leading-none text-bone">
          {[0, 1].map((n) => (
            <span key={n} className="flex">
              {TICKER.map((t) => (
                <span key={t} className="px-8">
                  {t} <span className="text-ember-400">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[100rem] px-6 md:px-10">
        {/* ── 1. Heading ── */}
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal as="p" mode="fade" className="t-eyebrow flex items-center gap-3 text-ember-500">
              <span className="h-px w-10 bg-ember-500" />
              The last stop on land · {ghat.full}
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              <span id="arrive-title">
                Park at the ghat, <span className="italic text-ember-300">book at our counter</span>
              </span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4"
          >
            Cars and bikes can&rsquo;t cross the Chinai. Everything you need is
            on this side of the river, a few steps from the boat &mdash; also
            written {ghat.aka}.
          </Reveal>
        </div>

        {/* ── 2. The last stretch ── */}
        <div className="ag-strip mt-14 rounded-3xl border border-bone/10 bg-abyss/60 px-5 pb-6 pt-5 backdrop-blur-sm md:mt-20 md:px-10 md:pb-9 md:pt-7">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim">The last stretch</p>
            <p className="hidden text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim sm:block">
              From the turn at {ghat.landmark} to the water
            </p>
          </div>

          <div className="relative mx-3 mt-10 md:mx-8 md:mt-12">
            {/* Road, then river: solid to the counter, rippled to the boat */}
            <div className="absolute inset-x-0 top-0 h-[3px] -translate-y-1/2 overflow-hidden rounded-full">
              <div className="absolute inset-y-0 left-0 w-2/3 bg-bone/12" />
              <div className="absolute inset-y-0 left-2/3 right-0 bg-[repeating-linear-gradient(90deg,rgba(111,163,224,.55)_0_8px,transparent_8px_14px)]" />
              <div className="ag-fill absolute inset-0 origin-left bg-linear-to-r from-ember-500 via-ember-400 to-neel-300" />
            </div>

            {/* The traveller: a car on the road, a boat on the river */}
            <div className="ag-car absolute top-0 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: "100%" }} data-mode="boat" aria-hidden="true">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-bone shadow-[0_0_30px_rgba(255,194,122,.45)] md:h-12 md:w-12">
                <svg className="ag-auto absolute h-6 w-6 text-abyss" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15.5v-4l2-4.5h12l2 4.5v4" />
                  <path d="M3.5 15.5h17" />
                  <circle cx="7.5" cy="16.8" r="1.6" />
                  <circle cx="16.5" cy="16.8" r="1.6" />
                </svg>
                <svg className="ag-boat absolute h-6 w-6 text-neel-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14h18l-2.5 4h-13Z" />
                  <path d="M12 14V5l5 6h-5" />
                  <path d="M3 20.5q1.5-1.2 3 0t3 0 3 0 3 0 3 0 3 0" />
                </svg>
              </span>
            </div>

            {/* The stops */}
            <ol className="relative grid grid-cols-4">
              {STOPS.map((s, i) => (
                <li
                  key={s.key}
                  data-on="true"
                  className={`ag-stop relative flex flex-col ${
                    i === 0 ? "items-start" : i === STOPS.length - 1 ? "items-end text-right" : "items-center text-center"
                  }`}
                >
                  <span
                    className={`ag-dot relative z-[1] -mt-[9px] grid h-[18px] w-[18px] place-items-center rounded-full border-2 border-abyss bg-bone/30 ${
                      i === 0 ? "-ml-[9px]" : i === STOPS.length - 1 ? "-mr-[9px]" : ""
                    }`}
                  />
                  <span className="ag-label mt-5 flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 font-display text-base leading-tight text-bone md:text-2xl">
                      {s.key === "parking" && (
                        <span className="hidden h-5 w-5 place-items-center rounded-md bg-neel-500 font-sans text-[0.65rem] font-bold text-bone sm:grid">P</span>
                      )}
                      {s.label}
                    </span>
                    <span className="hidden text-[0.62rem] uppercase tracking-[0.16em] text-sand-dim sm:block">
                      {s.note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── 3. The two cards ── */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">
          {[parking, booking].map((f, i) => {
            const isParking = f.id === "parking";
            return (
              <article
                key={f.id}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="ag-card group relative [perspective:1100px]"
              >
                <div className="ag-tilt relative flex h-full flex-col overflow-hidden rounded-3xl border border-bone/10 bg-abyss will-change-transform">
                  {/* Pointer spotlight */}
                  <div className="ag-spot pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="ag-media relative aspect-[16/11] overflow-hidden sm:aspect-[16/9]">
                    <div className="ag-img absolute -inset-y-[8%] inset-x-0">
                      <Image
                        src={f.image}
                        alt={f.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className={`object-cover ${isParking ? "object-[50%_45%]" : "object-[50%_60%]"}`}
                      />
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/10 to-abyss/30" />

                    {/* Index and sign */}
                    <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 md:p-7">
                      <span
                        aria-hidden="true"
                        className={`grid h-14 w-14 place-items-center rounded-2xl font-display text-3xl shadow-lg shadow-abyss/50 md:h-16 md:w-16 ${
                          isParking ? "bg-neel-500 text-bone" : "bg-ember-400 text-abyss"
                        }`}
                      >
                        {isParking ? (
                          "P"
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
                            <path d="M12 4 3 19h18L12 4Zm0 7 3.6 6H8.4L12 11Z" />
                          </svg>
                        )}
                      </span>
                      <span className="font-display text-5xl leading-none text-transparent [-webkit-text-stroke:1px_rgba(244,239,230,0.45)] md:text-6xl">
                        0{i + 1}
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ember-300">{f.where}</p>
                      <h3 className="mt-2 font-display text-[clamp(2.2rem,4.2vw,3.6rem)] leading-[0.95] text-bone">
                        {f.title}
                      </h3>
                    </div>
                  </div>

                  <div className="relative z-[3] flex flex-1 flex-col">
                    <div className="grid flex-1 gap-6 p-5 md:grid-cols-[auto_1fr] md:gap-8 md:p-7">
                      {/* The figure that matters */}
                      <div className="flex items-end gap-2 md:flex-col md:items-start md:gap-1 md:border-r md:border-bone/10 md:pr-8">
                        {isParking ? (
                          <>
                            <span className="font-display text-6xl leading-none text-bone tabular-nums md:text-7xl">
                              ₹<span className="ag-fee">{parkingFee}</span>
                            </span>
                            <span className="pb-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-sand-dim">{f.priceNote}</span>
                          </>
                        ) : (
                          <>
                            <span className="font-display text-6xl leading-none text-bone tabular-nums md:text-7xl">
                              ₹{fromPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="pb-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-sand-dim">
                              Stays from · per person, all meals
                            </span>
                          </>
                        )}
                      </div>
                      <div>
                        <p className="font-display text-xl text-bone md:text-2xl">{f.place}</p>
                        <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-sand">{f.text}</p>
                      </div>
                    </div>

                    {/* Actions along the foot, level across both cards */}
                    <div className="flex flex-wrap items-center gap-3 border-t border-bone/10 px-5 py-4 md:px-7 md:py-5">
                      <Magnetic strength={0.25}>
                        <a
                          href={f.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-cursor="Map"
                          className="group/btn inline-flex items-center gap-3 rounded-full bg-bone px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-ember-300"
                        >
                          Directions
                          <span aria-hidden="true" className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5">
                            ↗
                          </span>
                        </a>
                      </Magnetic>
                      {!isParking && (
                        <a
                          href={`tel:${site.owner.phoneRaw}`}
                          data-cursor="Call"
                          className="inline-flex items-center gap-2 rounded-full border border-bone/25 px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:border-ember-400 hover:text-ember-300"
                        >
                          Call {site.owner.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
