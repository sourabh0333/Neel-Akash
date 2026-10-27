"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site } from "@/lib/site";

const WAYS = [
  {
    key: "write",
    label: "Write",
    title: "WhatsApp",
    text: "Fill in the sentence below and it arrives as a message with everything needed.",
    href: "#compose",
    cta: "Write the message",
    icon: (
      <path d="M4 19.5l1.3-3.9A8 8 0 1 1 8.6 19L4 19.5ZM9 9.5c.3 2.3 2.2 4.2 4.5 4.5l1-1.3 2 .9-.4 1.6c-3.6.4-7.8-3.8-7.4-7.4l1.6-.4.9 2-1.2 1Z" />
    ),
  },
  {
    key: "call",
    label: "Call",
    title: site.owner.phone,
    text: `Speak to ${site.owner.name} for dates, the boat and anything else.`,
    href: `tel:${site.owner.phoneRaw}`,
    cta: "Call now",
    icon: <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z" />,
  },
  {
    key: "find",
    label: "Find",
    title: site.location.village,
    text: `${site.location.island}, ${site.location.block}, ${site.location.district} ${site.location.pin}.`,
    href: `https://www.google.com/maps/search/?api=1&query=${site.location.mapsQuery}`,
    cta: "Open in Google Maps",
    external: true,
    icon: (
      <>
        <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
        <circle cx="12" cy="10" r="2.3" />
      </>
    ),
  },
];

/**
 * Three ways in, as cards that light up under the pointer: a soft glow
 * follows it across each card and its border, and the icon lifts.
 */
export default function ContactWays() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ".cw-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          scrollTrigger: { trigger: ".cw-grid", start: "top 85%", once: true },
        }
      );
    },
    { scope: root }
  );

  // The glow's position is two CSS variables, set straight from the pointer.
  const track = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={root} className="relative bg-abyss py-28 md:py-36">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <p className="t-eyebrow text-ember-500">Three ways in</p>
        <h2 className="font-display t-huge mt-5 text-bone">
          However <span className="italic text-neel-300">suits you</span>
        </h2>

        <div className="cw-grid mt-14 grid gap-5 md:mt-20 lg:grid-cols-3">
          {WAYS.map((w, i) => (
            <a
              key={w.key}
              href={w.href}
              onPointerMove={track}
              data-cursor={w.label}
              {...(w.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="cw-card group relative isolate flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-3xl border border-bone/10 bg-ink-2 p-8 transition-colors duration-500 hover:border-transparent md:p-10"
            >
              {/* Glow under the pointer, and the same glow lighting the border. */}
              <span className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--x,50%)_var(--y,50%),rgba(243,156,74,0.16),transparent_60%)]" />
              <span className="pointer-events-none absolute inset-0 rounded-3xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(300px_circle_at_var(--x,50%)_var(--y,50%),rgba(255,194,122,0.7),transparent_60%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude]" />

              <div className="flex items-start justify-between">
                <span className="text-[0.62rem] uppercase tracking-[0.26em] text-ember-400 tabular-nums">
                  0{i + 1} · {w.label}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-10 w-10 text-bone/70 transition-all duration-500 group-hover:-translate-y-1 group-hover:text-ember-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                >
                  {w.icon}
                </svg>
              </div>

              <div>
                <h3 className="font-display text-[clamp(2rem,3.4vw,3rem)] leading-tight text-bone">{w.title}</h3>
                <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-sand">{w.text}</p>
                <span className="mt-8 inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-ember-300">
                  {w.cta}
                  <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
                    {w.external ? "↗" : "→"}
                  </span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
