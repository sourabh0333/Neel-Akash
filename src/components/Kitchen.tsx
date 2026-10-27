"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, isTouchOrSmall } from "@/lib/anim";
import { meals, site, type Dish } from "@/lib/site";

/** Flat list so the preview panel can address any dish by index. */
const allDishes: Dish[] = meals.flatMap((m) => m.dishes);
const indexOf = (d: Dish) => allDishes.findIndex((x) => x.name === d.name);

/**
 * The menu as the day's running order rather than a price list — meals here
 * are served at times, not ordered. Hovering a dish wipes its photograph into
 * a sticky plate panel (the "dish preview" pattern), and the Bengali name and
 * description swap with it.
 *
 * On touch the hover channel doesn't exist, so each dish carries its own
 * inline thumbnail instead.
 */
export default function Kitchen() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  /* Wipe the incoming plate photo in, fade the outgoing one out. */
  useGSAP(
    () => {
      if (prefersReducedMotion() || isTouchOrSmall()) return;
      const frames = gsap.utils.toArray<HTMLElement>(".plate-frame");
      frames.forEach((f, i) => {
        if (i === active) {
          gsap.fromTo(
            f,
            { clipPath: "inset(0% 0% 100% 0%)", scale: 1.14 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              scale: 1,
              duration: 1,
              ease: "power4.out",
              overwrite: true,
            }
          );
          gsap.set(f, { zIndex: 2, autoAlpha: 1 });
        } else {
          gsap.to(f, { autoAlpha: 0, duration: 0.5, overwrite: true });
          gsap.set(f, { zIndex: 1 });
        }
      });

      gsap.fromTo(
        ".plate-caption",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: true }
      );
    },
    { scope: root, dependencies: [active] }
  );

  /* Course headings and dish rows arrive as you reach each course. */
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>(".course").forEach((course) => {
        gsap.from(course.querySelectorAll(".course-head > *"), {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: course, start: "top 84%" },
        });
        gsap.from(course.querySelectorAll(".dish-row"), {
          opacity: 0,
          y: 26,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: course, start: "top 82%" },
        });
        // The time marker's rule draws down through the course.
        gsap.fromTo(
          course.querySelector(".course-rule"),
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: course,
              start: "top 78%",
              end: "bottom 60%",
              scrub: 0.6,
            },
          }
        );
      });
    },
    { scope: root }
  );

  const current = allDishes[active];

  return (
    <section ref={root} className="relative bg-abyss pb-28 md:pb-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Sticky plate (desktop) ── */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24">
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-sm bg-ink">
                {allDishes.map((d) => (
                  <div key={d.name} className="plate-frame absolute inset-0">
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      sizes="40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-abyss/80 via-transparent to-transparent" />
                  </div>
                ))}

                {/* Corner registration marks — the "contact sheet" feel */}
                <span className="pointer-events-none absolute left-4 top-4 z-10 h-5 w-5 border-l border-t border-bone/40" />
                <span className="pointer-events-none absolute right-4 top-4 z-10 h-5 w-5 border-r border-t border-bone/40" />
                <span className="pointer-events-none absolute bottom-4 left-4 z-10 h-5 w-5 border-b border-l border-bone/40" />
                <span className="pointer-events-none absolute right-4 bottom-4 z-10 h-5 w-5 border-r border-b border-bone/40" />
              </div>

              <div className="plate-caption mt-6">
                <p className="font-bn text-xl text-ember-300">{current.bn}</p>
                <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-sand">
                  {current.note}
                </p>
                <p className="mt-4 text-[0.6rem] uppercase tracking-[0.28em] text-sand-dim tabular-nums">
                  {String(active + 1).padStart(2, "0")} /{" "}
                  {String(allDishes.length).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Courses ── */}
          <div className="lg:col-span-7">
            {meals.map((meal) => (
              <div key={meal.label} className="course relative pb-14 last:pb-0">
                <div className="course-head mb-6 flex items-baseline gap-5">
                  <span className="font-display text-2xl text-ember-400 tabular-nums">
                    {meal.time}
                  </span>
                  <span className="h-px flex-1 bg-bone/15" />
                  <span className="text-[0.64rem] uppercase tracking-[0.28em] text-sand-dim">
                    {meal.label}
                  </span>
                  <span className="font-bn text-sm text-neel-300">{meal.bn}</span>
                </div>

                {/* Vertical rule that draws through the course */}
                <span className="course-rule absolute left-[0.6rem] top-12 hidden h-[calc(100%-3.5rem)] w-px bg-ember-500/25 lg:block" />

                <ul>
                  {meal.dishes.map((d) => {
                    const i = indexOf(d);
                    const on = i === active;
                    return (
                      <li key={d.name}>
                        <button
                          type="button"
                          onPointerEnter={() => setActive(i)}
                          onFocus={() => setActive(i)}
                          onClick={() => setActive(i)}
                          aria-pressed={on}
                          className="dish-row group/d flex w-full items-center gap-5 border-b border-bone/10 py-5 text-left"
                        >
                          {/* Inline thumbnail — the touch fallback for hover */}
                          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm lg:hidden">
                            <Image
                              src={d.image}
                              alt=""
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span
                              className={`block font-display text-[clamp(1.35rem,2.6vw,2.1rem)] leading-tight transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:group-hover/d:translate-x-3 ${
                                on ? "text-ember-300 lg:translate-x-3" : "text-bone"
                              }`}
                            >
                              {d.name}
                            </span>
                            <span className="font-bn mt-1 block text-sm text-sand-dim lg:hidden">
                              {d.bn}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-sand-dim lg:hidden">
                              {d.note}
                            </span>
                          </span>

                          <span
                            className={`hidden shrink-0 text-[0.6rem] tracking-[0.2em] tabular-nums transition-colors duration-500 lg:block ${
                              on ? "text-ember-400" : "text-sand-dim"
                            }`}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-bone/10 pt-7">
              <p className="text-[0.7rem] uppercase tracking-[0.18em] text-sand-dim">
                Vegetarian &amp; Jain meals on request
              </p>
              <span className="hidden h-3 w-px bg-bone/20 sm:block" />
              <a
                href={`tel:${site.owner.phoneRaw}`}
                className="link-draw text-sm text-ember-300"
              >
                Tell us when you book
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
