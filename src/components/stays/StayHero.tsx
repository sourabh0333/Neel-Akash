"use client";

import { useRef } from "react";
import Image from "next/image";
import type { Stay } from "@/lib/site";
import { useHorizon, TideLine, ScrollCue } from "../ui/Horizon";
import HeroTitle from "../ui/HeroTitle";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** A single stay opens the way every page does — on the horizon, over its own photograph. */
export default function StayHero({ stay }: { stay: Stay }) {
  const root = useRef<HTMLElement>(null);
  useHorizon(root);

  // "Sea-Facing Tent" → "Sea-Facing" + italic "Tent", like the other titles.
  const words = stay.name.split(" ");
  const last = words.pop();

  return (
    <section
      ref={root}
      className="relative flex min-h-[max(100svh,40rem)] w-full flex-col overflow-hidden bg-abyss"
    >
      <div className="hz-frame absolute inset-0 overflow-hidden will-change-[clip-path]">
        <div className="hz-open absolute inset-0 overflow-hidden">
          <div className="hz-photo absolute inset-0">
            <Image src={stay.image} alt={stay.name} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: stay.focus }} />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-abyss/60 via-abyss/10 to-abyss/90" />
          <div className="absolute inset-0 bg-linear-to-r from-abyss/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[70%] bg-linear-to-t from-abyss via-abyss/60 to-transparent md:h-[55%]" />
          <TideLine />
        </div>
      </div>

      <div className="hz-copy relative z-10 mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-end px-6 pb-14 pt-28 md:px-10 md:pb-20 lg:pb-28">
        <div className="hz-fade t-eyebrow mb-6 flex items-center justify-between gap-4 text-sand">
          <a href="/stays" className="link-draw flex items-center gap-3 hover:text-bone">
            <span aria-hidden="true">&larr;</span> All stays
          </a>
          <span className="hidden text-ember-400 sm:inline">{stay.kicker}</span>
        </div>

        <HeroTitle
          lead={words.join(" ") || undefined}
          accent={last ?? stay.name}
          tail={
            stay.mealsIncluded
              ? `on Mousuni Island · ${inr(stay.price)} a night with all meals`
              : `on Mousuni Island · ${inr(stay.price)} a night for the whole group`
          }
          size="text-[clamp(3rem,11vw,11rem)]"
        />

        <div className="hz-rule mt-8 h-px origin-left bg-bone/20" />

        <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-end">
          <p className="hz-fade max-w-[46ch] text-base leading-relaxed text-sand md:text-lg lg:col-span-6">
            {stay.blurb}
          </p>

          <dl className="hz-fade grid grid-cols-3 gap-6 lg:col-span-5 lg:col-start-8">
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">Price</dt>
              <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">
                {stay.originalPrice && (
                  <s className="mr-2 text-base text-sand-dim decoration-ember-400/70 md:text-lg">
                    <span className="sr-only">Regular price </span>
                    {inr(stay.originalPrice)}
                  </s>
                )}
                {inr(stay.price)}
              </dd>
              <p className="mt-1 text-[0.58rem] uppercase tracking-[0.14em] text-sand-dim">{stay.priceNote}</p>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">Sleeps</dt>
              <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">{stay.capacity}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] uppercase tracking-[0.16em] text-sand">Meals</dt>
              <dd className="mt-1.5 font-display text-2xl text-bone md:text-3xl">
                {stay.mealsIncluded ? "Included" : "Ask us"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <ScrollCue />
    </section>
  );
}
