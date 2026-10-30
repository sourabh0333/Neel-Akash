"use client";

import { useRef } from "react";
import Image from "next/image";
import { ghat, journey, site } from "@/lib/site";
import { useHorizon, TideLine, ScrollCue, dms } from "../ui/Horizon";
import HeroTitle from "../ui/HeroTitle";

const total = journey.reduce((n, j) => n + j.minutes, 0);
const doorToDoor = `≈ ${Math.floor(total / 60)}h ${String(total % 60).padStart(2, "0")}m`;
const parking = ghat.facilities.find((f) => f.id === "parking")!;

/** Getting Here opens the way the other pages do — on the horizon. */
export default function GettingHero() {
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
              src="/images/g-3.jpg"
              alt="Fishing boat drawn up on the sand"
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
            {journey[0].from} to {site.location.island}
          </span>
          <span className="hidden tabular-nums md:inline">
            {dms(site.location.lat)} N · {dms(site.location.lng)} E
          </span>
        </div>

        <HeroTitle
          lead="How to"
          accent="reach"
          tail="Mousuni Island from Kolkata by train & ferry"
          size="text-[clamp(3.4rem,14vw,14rem)]"
        />

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="hz-fade max-w-[46ch] text-base leading-relaxed text-sand md:text-lg lg:col-span-6">
            From Kolkata to Mousuni Island it is a train, a van and a boat.
            The last leg is a ferry, so the tide matters &mdash; call{" "}
            <a href={`tel:${site.owner.phoneRaw}`} className="link-draw text-ember-300">
              {site.owner.phone}
            </a>{" "}
            and we will tell you which train to take.
          </p>

          <dl className="hz-fade grid grid-cols-3 gap-6 lg:col-span-5 lg:col-start-8">
            {[
              ["Door to door", doorToDoor],
              ["Legs", String(journey.length)],
              ["Starts at", journey[0].from],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">{k}</dt>
                <dd className="mt-1.5 font-display text-2xl text-bone tabular-nums md:text-3xl">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Up front for drivers: parking and the counter at the ghat */}
          <div className="hz-fade flex flex-wrap gap-2 lg:col-span-5 lg:col-start-8">
            <a
              href="#arrive"
              className="inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-abyss/60 py-1.5 pl-1.5 pr-4 text-[0.68rem] uppercase tracking-[0.14em] text-bone backdrop-blur-md transition-colors hover:border-ember-400"
            >
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-neel-500 font-display text-sm normal-case">
                P
              </span>
              Parking {parking.price} {parking.priceNote}
            </a>
            <a
              href="#arrive"
              className="inline-flex items-center gap-2.5 rounded-full border border-bone/15 bg-abyss/60 py-1.5 pl-1.5 pr-4 text-[0.68rem] uppercase tracking-[0.14em] text-bone backdrop-blur-md transition-colors hover:border-ember-400"
            >
              <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-full bg-ember-400 text-abyss">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M12 4 3 19h18L12 4Zm0 7 3.6 6H8.4L12 11Z" />
                </svg>
              </span>
              Booking counter at the ghat
            </a>
          </div>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
