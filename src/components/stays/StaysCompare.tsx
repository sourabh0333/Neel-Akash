"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { stays } from "@/lib/site";
import Reveal from "../ui/Reveal";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * The three stays side by side, row for row. The cards rise in turn and each
 * price counts up to itself; the pointer lifts whichever card it is over.
 */
export default function StaysCompare() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".sc-card",
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          scrollTrigger: { trigger: ".sc-grid", start: "top 82%", once: true },
        }
      );
      gsap.utils.toArray<HTMLElement>(".sc-price").forEach((el) => {
        const to = Number(el.dataset.value);
        const o = { v: 0 };
        gsap.to(o, {
          v: to,
          duration: 1.6,
          ease: "power3.out",
          scrollTrigger: { trigger: ".sc-grid", start: "top 82%", once: true },
          onUpdate: () => (el.textContent = inr(Math.round(o.v / 10) * 10)),
          onComplete: () => (el.textContent = inr(to)),
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
          Side by side
        </Reveal>
        <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
          Pick your <span className="italic text-neel-300">night</span>
        </Reveal>

        <div className="sc-grid mt-16 grid gap-5 md:mt-20 lg:grid-cols-3">
          {stays.map((s) => {
            const rows: [string, string][] = [
              ["Charged", s.priceNote],
              ["Sleeps", s.capacity],
              ["Meals", s.mealsIncluded ? "All included" : "Ask when you book"],
            ];
            return (
              <article
                key={s.id}
                className="sc-card group relative flex flex-col overflow-hidden rounded-3xl border border-bone/10 bg-ink-2 p-7 transition-[transform,border-color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:-translate-y-2 hover:border-ember-400/50 md:p-9"
              >
                {/* A glow that rises from the foot of the card on hover. */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 translate-y-full bg-linear-to-t from-ember-500/15 to-transparent transition-transform duration-700 group-hover:translate-y-0" />

                <p className="relative text-[0.62rem] uppercase tracking-[0.24em] text-ember-500">
                  {s.kicker.split("—")[0].trim()}
                </p>
                <h3 className="font-display relative mt-3 text-4xl text-bone">{s.name}</h3>

                <div className="relative mt-8 flex items-baseline gap-3">
                  <span
                    className="sc-price font-display text-6xl text-bone tabular-nums"
                    data-value={s.price}
                  >
                    {inr(s.price)}
                  </span>
                  {s.originalPrice && (
                    <s className="font-display text-xl text-sand-dim decoration-ember-400/70">
                      <span className="sr-only">Regular price </span>
                      {inr(s.originalPrice)}
                    </s>
                  )}
                </div>
                {s.originalPrice && (
                  <span className="relative mt-3 self-start rounded-full bg-ember-500/15 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ember-300">
                    {inr(s.originalPrice - s.price)} off
                  </span>
                )}

                <dl className="relative mt-8 border-t border-bone/10">
                  {rows.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 border-b border-bone/10 py-3.5">
                      <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-sand-dim">{k}</dt>
                      <dd className="text-right text-sm text-bone">{v}</dd>
                    </div>
                  ))}
                </dl>

                <ul className="relative mt-6 flex-1 space-y-2.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-sand">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ember-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="relative mt-9 flex gap-3">
                  <a
                    href={`/contact?stay=${s.id}`}
                    data-cursor="Book"
                    className="flex-1 rounded-full bg-bone px-6 py-3.5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
                  >
                    Book
                  </a>
                  <a
                    href={`/stays/${s.id}`}
                    className="flex-1 rounded-full border border-bone/25 px-6 py-3.5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
                  >
                    Details
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
