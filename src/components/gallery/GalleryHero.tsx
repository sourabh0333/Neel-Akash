"use client";

import { useRef } from "react";
import Image from "next/image";
import { photos, site } from "@/lib/site";
import { useHorizon, TideLine, ScrollCue, dms } from "../ui/Horizon";

/** The gallery opens the way the other pages do — on the horizon. */
export default function GalleryHero() {
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
              src="/images/g-4.jpg"
              alt="Sunset over the Bay of Bengal"
              fill
              priority
              sizes="100vw"
              className="object-cover"
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
            Gallery · {site.location.island}
          </span>
          <span className="hidden tabular-nums md:inline">
            {dms(site.location.lat)} N · {dms(site.location.lng)} E
          </span>
        </div>

        <h1 className="hz-chars font-display text-[clamp(3.6rem,15vw,15rem)] leading-[0.82] tracking-[-0.035em] whitespace-nowrap text-bone">
          In <span className="italic text-ember-300">pictures</span>
        </h1>

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="hz-fade max-w-[44ch] text-base leading-relaxed text-sand md:text-lg lg:col-span-6">
            The beach, the tide, the boats and the camp. Click any photograph
            to see it large; the arrow keys step through them.
          </p>

          <dl className="hz-fade grid grid-cols-3 gap-6 lg:col-span-5 lg:col-start-8">
            {[
              ["Photographs", String(photos.length)],
              ["Of the island", String(photos.filter((p) => p.group === "Island").length)],
              ["Dawn to", "Dark"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">{k}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
