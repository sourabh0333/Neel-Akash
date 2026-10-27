"use client";

import { useRef } from "react";
import Image from "next/image";
import { site } from "@/lib/site";
import HeroCanvas from "./HeroCanvas";
import Magnetic from "./ui/Magnetic";
import { useHorizon, TideLine, ScrollCue, dms } from "./ui/Horizon";
import HeroTitle from "./ui/HeroTitle";

/**
 * Home opens the way the Island page does: the sky and sea split open from
 * a single horizon line, the name rises letter by letter over a moving tide
 * line, and on the way out the frame draws in to a card.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  useHorizon(root);

  return (
    <section
      ref={root}
      id="top"
      className="relative h-[100svh] min-h-[38rem] w-full overflow-hidden bg-abyss"
    >
      <div className="hz-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
        <div className="hz-open absolute inset-0 overflow-hidden">
          <div className="hz-photo absolute inset-0">
            {/* Layer 1 — animated WebGL sky/sea */}
            <div className="absolute inset-0 bg-linear-to-b from-neel-900 via-ink to-abyss" />
            <HeroCanvas />

            {/* Layer 2 — a graded photograph, blended into the field.
                `overlay` keeps the field's own light and dark while lending
                the frame real photographic texture; `isolate` keeps the blend
                to this layer, or the photo greys out into the field. */}
            <div className="absolute inset-0 isolate">
              <Image
                src="/images/hero.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover opacity-60 mix-blend-overlay"
              />
            </div>
          </div>

          {/* Grade: hold the sky, sink the foot of the frame so type stays legible */}
          <div className="absolute inset-0 bg-linear-to-b from-abyss/45 via-abyss/5 to-abyss" />
          <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-transparent" />
          {/* The beach photo is bright; the type block needs its own shade. */}
          <div className="absolute inset-x-0 bottom-0 h-[80%] bg-linear-to-t from-abyss via-abyss/75 md:h-[62%] to-transparent" />
          <TideLine />
        </div>
      </div>

      <div className="hz-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20 lg:pb-28">
        <div className="hz-fade t-eyebrow mb-6 flex items-center justify-between gap-4 text-sand">
          <span className="flex items-center gap-4">
            <span className="h-px w-10 bg-ember-500" />
            {site.location.island} · {site.location.state}
            <span className="font-bn hidden tracking-[0.08em] normal-case text-sand/70 sm:inline" lang="bn">
              {site.nameBn}
            </span>
          </span>
          <span className="hidden tabular-nums text-sand md:inline">
            {dms(site.location.lat)} N · {dms(site.location.lng)} E
          </span>
        </div>

        <HeroTitle
          lead="Penguin"
          accent="Beach Camp"
          tail="Sea-facing tents & cottages on Mousuni Island, West Bengal"
          size="t-mega"
        />

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="hz-fade max-w-[34ch] text-lg leading-snug text-sand md:text-xl lg:col-span-4 xl:col-span-3">
            {site.tagline}.
          </p>

          <dl className="hz-fade grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 lg:col-span-5 lg:col-start-5 lg:grid-cols-2 xl:col-span-6 xl:col-start-4 xl:grid-cols-4">
            {site.stats.map((s) => (
              <div key={s.label}>
                <dt className="whitespace-nowrap text-[0.6rem] uppercase tracking-[0.16em] text-sand">{s.label}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">
                  {s.value}
                  <span className="text-lg text-ember-400">{s.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="hz-fade lg:col-span-3 lg:col-start-10 lg:flex lg:justify-end">
            <Magnetic strength={0.3}>
              <a
                href="#contact"
                data-cursor="Book"
                className="group/cta relative inline-flex items-center gap-4 overflow-hidden whitespace-nowrap rounded-full bg-bone px-8 py-4 text-abyss"
              >
                <span className="absolute inset-0 origin-left scale-x-0 bg-ember-400 transition-transform duration-600 ease-[cubic-bezier(.16,1,.3,1)] group-hover/cta:scale-x-100" />
                <span className="relative text-[0.76rem] font-semibold uppercase tracking-[0.18em]">
                  Reserve a night
                </span>
                <span className="relative transition-transform duration-500 group-hover/cta:translate-x-1">
                  &rarr;
                </span>
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
