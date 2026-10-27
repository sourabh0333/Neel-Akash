"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { journey, site, stays } from "@/lib/site";
import Reveal from "../ui/Reveal";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const total = journey.reduce((n, j) => n + j.minutes, 0);

/** Every answer is something the site already says elsewhere. */
const FAQ = [
  {
    q: "Do I pay anything online?",
    a: `No. Booking is a WhatsApp message or a call to ${site.owner.name}; nothing is paid on this site and no card details are asked for.`,
  },
  {
    q: "What does a night cost?",
    a: stays
      .map((s) => `${s.name}: ${inr(s.price)} ${s.priceNote}${s.originalPrice ? ` (usually ${inr(s.originalPrice)})` : ""}`)
      .join(". ") + ".",
  },
  {
    q: "Are meals included?",
    a: "Tent and cottage nights include a welcome drink, lunch, evening snacks, dinner and the next morning's breakfast. For the group special, ask when you book.",
    link: { href: "/menu", label: "See the menu" },
  },
  {
    q: "How do I get there?",
    a: `${journey.map((j) => j.title).join(", then ")}. Roughly ${Math.floor(total / 60)} hours ${total % 60} minutes door to door.`,
    link: { href: "/getting-here", label: "The route, step by step" },
  },
  {
    q: "Will the ferry be running when I arrive?",
    a: "Boats run with the tide, so tell us your train and we will time the crossing for you, and meet you at the ghat.",
  },
];

/**
 * The questions people ask before they book. Each opens smoothly to its
 * full height; only one is open at a time.
 */
export default function ContactFaq() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useGSAP(
    () => {
      const panels = gsap.utils.toArray<HTMLElement>(".cq-panel");
      panels.forEach((p, i) => {
        gsap.to(p, {
          height: i === open ? "auto" : 0,
          opacity: i === open ? 1 : 0,
          duration: prefersReducedMotion() ? 0 : 0.6,
          ease: "power3.inOut",
          overwrite: true,
        });
      });
    },
    { scope: root, dependencies: [open] }
  );

  return (
    <section ref={root} className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-6 md:px-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
            Before you ask
          </Reveal>
          <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
            Good <span className="italic text-neel-300">questions</span>
          </Reveal>
        </div>

        <ul className="border-t border-bone/12 lg:col-span-8">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-bone/12">
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={`cq-${i}`}
                    onClick={() => setOpen(on ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="flex items-baseline gap-5">
                      <span className="text-[0.62rem] tracking-[0.24em] text-ember-500 tabular-nums">0{i + 1}</span>
                      <span
                        className={`font-display text-[clamp(1.4rem,2.4vw,2.1rem)] leading-tight transition-colors duration-300 ${
                          on ? "text-ember-300" : "text-bone group-hover:text-ember-300"
                        }`}
                      >
                        {f.q}
                      </span>
                    </span>
                    {/* A plus that turns into a minus. */}
                    <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                      <span className="absolute left-0 top-1/2 h-px w-full bg-bone" />
                      <span
                        className={`absolute left-1/2 top-0 h-full w-px bg-bone transition-transform duration-500 ${
                          on ? "scale-y-0" : "scale-y-100"
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`cq-${i}`}
                  role="region"
                  className="cq-panel overflow-hidden"
                  style={{ height: i === 0 ? "auto" : 0, opacity: i === 0 ? 1 : 0 }}
                >
                  <div className="max-w-[62ch] pb-8 pl-10 text-sand">
                    <p className="leading-relaxed">{f.a}</p>
                    {f.link && (
                      <a href={f.link.href} className="link-draw mt-3 inline-block text-sm text-ember-300">
                        {f.link.label} &rarr;
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
