"use client";

import { useRef } from "react";
import Image from "next/image";
import { navLinks, site } from "@/lib/site";
import Magnetic from "./ui/Magnetic";
import { useHorizon, TideLine, dms } from "./ui/Horizon";

/**
 * The 404, in the site's own clothes: the same horizon opening as every
 * page, a line about where the page went, and every way back.
 */
export default function NotFoundHero() {
  const root = useRef<HTMLElement>(null);
  useHorizon(root);

  return (
    <section
      ref={root}
      className="relative h-[100svh] min-h-[40rem] w-full overflow-hidden bg-abyss"
    >
      <div className="hz-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
        <div className="hz-open absolute inset-0 overflow-hidden">
          <div className="hz-photo absolute inset-0">
            <Image src="/images/g-2.jpg" alt="Empty shoreline at low tide" fill priority sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-abyss/60 via-abyss/10 to-abyss/90" />
          <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[75%] bg-linear-to-t from-abyss via-abyss/65 to-transparent md:h-[60%]" />
          <TideLine />
        </div>
      </div>

      <div className="hz-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20 lg:pb-24">
        <div className="hz-fade t-eyebrow mb-6 flex items-center justify-between gap-4 text-sand">
          <span className="flex items-center gap-4">
            <span className="h-px w-10 bg-ember-500" />
            404 · Page not found
          </span>
          <span className="hidden tabular-nums md:inline">
            {dms(site.location.lat)} N · {dms(site.location.lng)} E
          </span>
        </div>

        <h1 className="hz-chars font-display text-[clamp(3.2rem,13vw,13rem)] leading-[0.82] tracking-[-0.035em] whitespace-nowrap text-bone">
          Off the <span className="italic text-ember-300">map</span>
        </h1>

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="hz-fade max-w-[44ch] text-base leading-relaxed text-sand md:text-lg">
              This page went out with the tide. The island is still here &mdash;
              pick a way back below.
            </p>
            <div className="hz-fade mt-8 flex flex-wrap gap-3">
              <Magnetic strength={0.3}>
                <a
                  href="/"
                  className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
                >
                  <span aria-hidden="true">&larr;</span> Back home
                </a>
              </Magnetic>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                className="inline-flex items-center gap-3 rounded-full border border-bone/30 px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
              >
                Call {site.owner.phone}
              </a>
            </div>
          </div>

          <nav aria-label="Pages" className="hz-fade lg:col-span-5 lg:col-start-8">
            <p className="text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim">Or go to</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="link-draw font-display text-xl text-bone hover:text-ember-300 md:text-2xl">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
