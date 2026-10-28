"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site, stays, type Stay } from "@/lib/site";
import PriceTag from "../ui/PriceTag";
import Reveal from "../ui/Reveal";
import Magnetic from "../ui/Magnetic";

/**
 * A stay in detail: what you get as numbered tiles that rise in turn,
 * beside a booking card that stays in view; then the other stays, whose
 * photographs open out from a rounded window as they arrive.
 */
export default function StayDetails({ stay }: { stay: Stay }) {
  const root = useRef<HTMLElement>(null);
  const others = stays.filter((s) => s.id !== stay.id);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".sd-tile",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.09,
          scrollTrigger: { trigger: ".sd-tiles", start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        ".sd-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: ".sd-card", start: "top 88%", once: true } }
      );
      gsap.utils.toArray<HTMLElement>(".sd-other").forEach((o) => {
        gsap.fromTo(
          o,
          { clipPath: "inset(12% 10% 12% 10% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            ease: "none",
            scrollTrigger: { trigger: o, start: "top bottom", end: "top 40%", scrub: true },
          }
        );
        gsap.fromTo(
          o.querySelector(".sd-other-img"),
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: o, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root}>
      <div className="bg-abyss py-28 md:py-36">
        <div className="mx-auto grid max-w-[100rem] gap-14 px-6 md:px-10 lg:grid-cols-12 lg:gap-16">
          {/* ── What you get ── */}
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              What you get
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              {/* Only promise "everything" where the meals are part of it. */}
              {stay.mealsIncluded ? (
                <>
                  Everything <span className="italic text-neel-300">in the price</span>
                </>
              ) : (
                <>
                  How it <span className="italic text-neel-300">works</span>
                </>
              )}
            </Reveal>

            <ul className="sd-tiles mt-12 grid gap-4 sm:grid-cols-2">
              {stay.features.map((f, i) => (
                <li
                  key={f}
                  className="sd-tile group relative overflow-hidden rounded-2xl border border-bone/10 bg-ink-2 p-6 transition-colors duration-500 hover:border-ember-400/50 md:p-7"
                >
                  <span className="text-[0.6rem] tracking-[0.24em] text-ember-500 tabular-nums">0{i + 1}</span>
                  <p className="font-display mt-6 text-2xl leading-tight text-bone md:text-3xl">{f}</p>
                  <span className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-ember-400 transition-transform duration-700 group-hover:scale-x-100" />
                </li>
              ))}
              {stay.mealsIncluded && (
                <li className="sd-tile relative overflow-hidden rounded-2xl border border-ember-400/40 bg-ember-500/10 p-6 md:p-7">
                  <span className="text-[0.6rem] tracking-[0.24em] text-ember-400 tabular-nums">
                    0{stay.features.length + 1}
                  </span>
                  <p className="font-display mt-6 text-2xl leading-tight text-bone md:text-3xl">All meals included</p>
                  <a href="/menu" className="link-draw mt-3 inline-block text-sm text-ember-300">
                    See the menu &rarr;
                  </a>
                </li>
              )}
            </ul>

            <div className="mt-14 border-t border-bone/10 pt-10">
              <h3 className="font-display text-3xl text-bone">Getting here</h3>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-sand">
                The Namkhana Local from Sealdah, an auto to Bagdanga Ghat, a short
                ferry across the Chinai and a toto to the camp. Tell us your train
                and we will time the boat.
              </p>
              <a href="/getting-here" className="link-draw mt-4 inline-block text-sm text-ember-300">
                The route, step by step &rarr;
              </a>
            </div>
          </div>

          {/* ── Booking card ── */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sd-card sticky top-28 overflow-hidden rounded-3xl border border-bone/12 bg-ink-2">
              <div className="relative h-40 overflow-hidden">
                <Image src={stay.image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" style={{ objectPosition: stay.focus }} />
                <div className="absolute inset-0 bg-linear-to-t from-ink-2 to-transparent" />
              </div>
              <div className="p-8">
                <PriceTag stay={stay} size="lg" />
                <div className="mt-8 flex flex-col gap-3">
                  <Magnetic strength={0.2}>
                    <a
                      href={`/contact?stay=${stay.id}`}
                      data-cursor="Book"
                      className="flex items-center justify-center gap-3 rounded-full bg-bone px-8 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
                    >
                      Book this stay <span aria-hidden="true">&rarr;</span>
                    </a>
                  </Magnetic>
                  <a
                    href={`tel:${site.owner.phoneRaw}`}
                    className="flex items-center justify-center rounded-full border border-bone/25 px-8 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400"
                  >
                    Call {site.owner.phone}
                  </a>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-sand-dim">
                  Booking is a WhatsApp message to {site.owner.name} — no payment
                  online, nothing is sent until you press send.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── The other stays ── */}
      <div className="border-t border-bone/10 bg-ink py-24 md:py-32">
        <div className="mx-auto max-w-[100rem] px-6 md:px-10">
          <p className="t-eyebrow text-ember-500">Or perhaps</p>
          <h2 className="font-display mt-5 text-[clamp(2.2rem,5vw,4.4rem)] leading-none text-bone">
            The other <span className="italic text-ember-300">stays</span>
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {others.map((o) => (
              <a
                key={o.id}
                href={`/stays/${o.id}`}
                data-cursor="View"
                className="sd-other group relative block aspect-4/5 overflow-hidden rounded-3xl sm:aspect-16/11"
              >
                <div className="sd-other-img absolute inset-0">
                  <Image
                    src={o.image}
                    alt={o.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-[filter] duration-700 group-hover:brightness-110"
                    style={{ objectPosition: o.focus }}
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-abyss/90 via-abyss/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 md:p-9">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ember-400">{o.kicker}</p>
                    <p className="font-display mt-2 text-4xl text-bone transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">
                      {o.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl text-ember-300">
                      ₹{o.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[0.58rem] uppercase tracking-[0.14em] text-sand-dim">{o.priceNote}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
