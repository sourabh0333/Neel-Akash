"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { ghat, site } from "@/lib/site";
import Reveal from "./ui/Reveal";

/**
 * Arriving by road, made impossible to miss: the car parking and the camp's
 * own booking counter at Hujjaiter Kheya Ghat, each with a photograph, what
 * it costs and a Directions button straight to it on Google Maps.
 *
 * It sits near the top of Getting Here (the anchor #arrive, which the
 * floating reminder links to), after the stays on Home, and on Contact.
 */
export default function ArriveGhat({ className = "" }: { className?: string }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // Each card rises in, and its photo settles from a slight zoom.
      gsap.utils.toArray<HTMLElement>(".ag-card").forEach((card, i) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 85%", once: true },
          delay: i * 0.12,
        });
        tl.fromTo(card, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }).fromTo(
          card.querySelector(".ag-img"),
          { scale: 1.15 },
          { scale: 1, duration: 1.6, ease: "power3.out" },
          0
        );
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="arrive"
      aria-labelledby="arrive-title"
      className={`relative scroll-mt-24 border-y border-bone/10 bg-ink py-24 md:py-32 ${className}`}
    >
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="mb-12 grid gap-6 md:mb-16 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              Arriving at {ghat.full} · {ghat.landmark}
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
            className="max-w-[44ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            Cars and bikes can&rsquo;t cross the Chinai. Everything you need is
            waiting on this side of the river, a few steps from the boat.
          </Reveal>
        </div>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          {ghat.facilities.map((f) => {
            const parking = f.id === "parking";
            return (
              <article
                key={f.id}
                className="ag-card group relative flex flex-col overflow-hidden rounded-3xl border border-bone/10 bg-abyss"
              >
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10]">
                  <div className="ag-img absolute inset-0">
                    <Image
                      src={f.image}
                      alt={f.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] ${
                        parking ? "object-[50%_45%]" : "object-[50%_60%]"
                      }`}
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-abyss via-abyss/20 to-transparent" />

                  {/* The sign: a big P, or the camp's tent mark */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-2xl font-display text-3xl shadow-lg shadow-abyss/60 md:left-7 md:top-7 md:h-16 md:w-16 ${
                      parking ? "bg-neel-500 text-bone" : "bg-ember-400 text-abyss"
                    }`}
                  >
                    {parking ? (
                      "P"
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                        <path d="M12 4 3 19h18L12 4Zm0 7 3.6 6H8.4L12 11Z" />
                      </svg>
                    )}
                  </span>

                  {f.price && (
                    <span className="absolute right-5 top-5 rounded-full bg-bone px-4 py-2 font-display text-xl text-abyss md:right-7 md:top-7 md:text-2xl">
                      {f.price}
                      <span className="ml-1.5 font-sans text-[0.6rem] uppercase tracking-[0.16em] text-abyss/70">
                        {f.priceNote}
                      </span>
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ember-300">{f.where}</p>
                    <h3 className="mt-2 font-display text-[clamp(2rem,4vw,3.2rem)] leading-none text-bone">{f.title}</h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between gap-6 p-6 md:p-8">
                  <div>
                    <p className="font-display text-xl text-bone md:text-2xl">{f.place}</p>
                    <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-sand">{f.text}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={f.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="Map"
                      className="inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-abyss transition-colors hover:bg-ember-300"
                    >
                      Directions <span aria-hidden="true">↗</span>
                    </a>
                    {!parking && (
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
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
