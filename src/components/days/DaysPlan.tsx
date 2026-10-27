"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { experiences, meals } from "@/lib/site";
import Reveal from "../ui/Reveal";

type Item = { time: string; kind: "Meal" | "On the island"; title: string; detail: string };

const isClock = (t: string) => /^\d{2}:\d{2}$/.test(t);

/*
 * Two days built from the site's own times. Day one starts with the welcome
 * drink and runs from lunch onwards; day two is everything in the morning.
 * Nothing here is invented: change a time in `meals` or `experiences` and
 * the plan re-sorts itself.
 */
const all: Item[] = [
  ...meals.map((m) => ({
    time: m.time,
    kind: "Meal" as const,
    title: m.label,
    detail: m.dishes.map((d) => d.name).join(" · "),
  })),
  ...experiences.map((x) => ({ time: x.time, kind: "On the island" as const, title: x.title, detail: x.copy })),
];
const byTime = (a: Item, b: Item) => a.time.localeCompare(b.time);
const DAYS = [
  {
    label: "Day one",
    note: "Arrive by lunch",
    items: [
      ...all.filter((i) => !isClock(i.time)),
      ...all.filter((i) => isClock(i.time) && i.time >= "12:00").sort(byTime),
    ],
  },
  {
    label: "Day two",
    note: "Up with the sun",
    items: all.filter((i) => isClock(i.time) && i.time < "12:00").sort(byTime),
  },
];

/**
 * A suggested two days, hour by hour. Each day's line draws down as you
 * scroll, and its stops slide in to meet it.
 */
export default function DaysPlan() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>(".dp-day").forEach((day) => {
        gsap.fromTo(
          day.querySelector(".dp-line"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: day, start: "top 75%", end: "bottom 60%", scrub: 0.6 },
          }
        );
        day.querySelectorAll<HTMLElement>(".dp-item").forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0, x: 40 },
            {
              opacity: 1,
              x: 0,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: item, start: "top 85%", once: true },
            }
          );
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-x-clip border-t border-bone/10 bg-ink py-28 md:py-40">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Make a weekend of it
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Two days, <span className="italic text-ember-300">hour by hour</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            One way to spend a night here, from the welcome drink to the walk
            after breakfast. The times are a guide; ask when you book what
            suits the day.
          </Reveal>
        </div>

        <div className="mt-20 grid gap-16 md:mt-28 lg:grid-cols-2 lg:gap-20">
          {DAYS.map((d) => (
            <div key={d.label} className="dp-day">
              <div className="flex items-baseline justify-between border-b border-bone/15 pb-5">
                <h3 className="font-display text-4xl text-bone md:text-5xl">{d.label}</h3>
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-ember-400">{d.note}</span>
              </div>

              <ol className="relative mt-8">
                <span className="absolute bottom-3 left-[5px] top-3 w-px bg-bone/10">
                  <span className="dp-line block h-full w-full origin-top bg-ember-400" />
                </span>
                {d.items.map((it) => (
                  <li key={it.title} className="dp-item relative grid grid-cols-[auto_1fr] gap-x-6 pb-9 pl-8 last:pb-0">
                    <span
                      className={`absolute left-0 top-2 h-[11px] w-[11px] rounded-full ring-4 ring-ink ${
                        it.kind === "Meal" ? "bg-neel-300" : "bg-ember-400"
                      }`}
                    />
                    <span className="w-16 pt-0.5 font-display text-2xl text-bone tabular-nums">
                      {isClock(it.time) ? it.time : "—"}
                    </span>
                    <div>
                      <p
                        className={`text-[0.6rem] uppercase tracking-[0.22em] ${
                          it.kind === "Meal" ? "text-neel-300" : "text-ember-400"
                        }`}
                      >
                        {it.kind}
                        {!isClock(it.time) && ` · ${it.time}`}
                      </p>
                      <p className="font-display mt-1 text-2xl text-bone">{it.title}</p>
                      <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-sand-dim">{it.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
