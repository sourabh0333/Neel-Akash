"use client";

import { useRef } from "react";
import Image from "next/image";
import { site } from "@/lib/site";
import { useHorizon, TideLine, ScrollCue, dms } from "../ui/Horizon";

/**
 * The island page opens on the horizon: the photograph splits open from a
 * single line, "Mousuni" rises letter by letter, and on the way out the frame
 * draws in to a card while the name drifts up past it.
 */
export default function IslandHero() {
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
              src="/images/g-1.jpg"
              alt="Waves breaking at dusk on Mousuni's open beach"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-abyss/60 via-abyss/10 to-abyss/90" />
          <div className="absolute inset-0 bg-linear-to-r from-abyss/50 via-transparent to-transparent" />
          <TideLine />
        </div>
      </div>

      <div className="hz-copy relative z-10 mx-auto flex h-full max-w-[100rem] flex-col justify-end px-6 pb-14 md:px-10 md:pb-20 lg:pb-28">
        <div className="hz-fade t-eyebrow mb-5 flex items-center gap-4 text-sand">
          <span className="h-px w-10 bg-ember-500" />
          The island · {site.location.district}
          <span className="font-bn hidden tracking-[0.08em] normal-case text-sand/70 sm:inline" lang="bn">
            মৌসুনি দ্বীপ
          </span>
        </div>

        <h1 className="hz-chars font-display text-[clamp(4.2rem,19vw,19rem)] leading-[0.8] tracking-[-0.04em] text-bone">
          Mousuni
        </h1>

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 md:grid-cols-12 md:items-end">
          <p className="hz-fade max-w-[40ch] text-base leading-relaxed text-sand md:col-span-5 md:text-lg">
            An island at the edge of the bay, where the Muri Ganga and the
            Chinai let go of the mainland.
          </p>

          <dl className="hz-fade grid grid-cols-3 gap-6 md:col-span-4 md:col-start-7">
            {[
              ["Villages", "4"],
              ["Open beach", "4.5 km"],
              ["From Kolkata", "120 km"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim">{k}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="hz-fade hidden text-right font-sans text-[0.62rem] uppercase leading-loose tracking-[0.24em] text-sand-dim tabular-nums md:col-span-2 md:col-start-11 md:block">
            {dms(site.location.lat)} N
            <br />
            {dms(site.location.lng)} E
          </p>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
