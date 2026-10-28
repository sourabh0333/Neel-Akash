"use client";

import { useRef } from "react";
import Image from "next/image";
import { site, stays } from "@/lib/site";
import { useHorizon, TideLine, ScrollCue, dms } from "../ui/Horizon";
import HeroTitle from "../ui/HeroTitle";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** The stays page opens the way Home and the Island do — on the horizon. */
export default function StaysHero() {
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
            <Image
              src="/images/camp-tent.jpg"
              alt="A dome tent made up with bedding under the canopy at Penguin Beach Camp"
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: stays[0].focus }}
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-abyss/60 via-abyss/10 to-abyss/90" />
          <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-abyss via-abyss/60 to-transparent md:h-[55%]" />
          <TideLine />
        </div>
      </div>

      <div className="hz-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20 lg:pb-28">
        <div className="hz-fade t-eyebrow mb-6 flex items-center justify-between gap-4 text-sand">
          <span className="flex items-center gap-4">
            <span className="h-px w-10 bg-ember-500" />
            Where you sleep · {site.location.island}
          </span>
          <span className="hidden tabular-nums md:inline">
            {dms(site.location.lat)} N · {dms(site.location.lng)} E
          </span>
        </div>

        <HeroTitle
          lead="Tents &"
          accent="cottages"
          tail="on Mousuni Island, from ₹900 a night with all meals"
          size="text-[clamp(3rem,12vw,12rem)]"
        />

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="hz-fade max-w-[40ch] text-base leading-relaxed text-sand md:text-lg lg:col-span-5">
            Sea-facing tents on the sand of Mousuni Island, cottages raised
            above it, and one price for a whole group. Every tent and cottage
            night comes with all meals.
          </p>

          <dl className="hz-fade grid grid-cols-3 gap-6 lg:col-span-6 lg:col-start-7">
            {stays.map((s) => (
              <div key={s.id}>
                <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">{s.name}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">
                  {s.originalPrice && (
                    <s className="mr-2 text-base text-sand-dim decoration-ember-400/70 md:text-lg">
                      <span className="sr-only">Regular price </span>
                      {inr(s.originalPrice)}
                    </s>
                  )}
                  {inr(s.price)}
                </dd>
                <dd className="mt-1 text-[0.58rem] uppercase tracking-[0.14em] text-sand-dim">
                  {s.priceNote}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
