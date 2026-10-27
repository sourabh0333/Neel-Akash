"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/anim";
import { site, navLinks, stayLinks } from "@/lib/site";
import { LogoSeal } from "./brand/Logo";
import PenguinMark from "./brand/PenguinMark";

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // The wordmark rises out of its own mask as the footer arrives.
      gsap.fromTo(
        ".foot-mark",
        { yPercent: 60, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.6,
          ease: "power4.out",
          scrollTrigger: { trigger: root.current, start: "top 92%" },
        }
      );
    },
    { scope: root }
  );

  const year = new Date().getFullYear();

  return (
    <footer
      ref={root}
      className="relative overflow-hidden border-t border-bone/10 bg-abyss pt-20"
    >
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <div className="grid gap-12 pb-16 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <LogoSeal className="pointer-events-none absolute right-6 top-0 hidden h-28 w-28 text-bone/25 lg:block" />
            <div className="flex items-center gap-4">
              <PenguinMark className="h-14 w-14" />
              <p className="font-bn text-3xl text-bone">{site.nameBn}</p>
            </div>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-sand-dim">
              {site.description}
            </p>
          </div>

          <div>
            <p className="t-eyebrow mb-4 text-sand-dim">Explore</p>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="link-draw text-sm text-sand transition-colors hover:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="t-eyebrow mb-4 text-sand-dim">Stays</p>
            <ul className="space-y-2.5">
              {stayLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="link-draw text-sm text-sand transition-colors hover:text-bone"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="t-eyebrow mb-4 text-sand-dim">Reservations</p>
            <a
              href={`tel:${site.owner.phoneRaw}`}
              className="link-draw block text-sm text-sand hover:text-bone"
            >
              {site.owner.phone}
            </a>
            <a
              href={`https://wa.me/${site.owner.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-draw mt-2.5 block text-sm text-sand hover:text-bone"
            >
              WhatsApp
            </a>
            <p className="mt-5 text-sm leading-relaxed text-sand-dim">
              {site.location.island}
              <br />
              {site.location.state} {site.location.pin}
            </p>
          </div>
        </div>

        {/* Oversized wordmark, sized so the full name spans the page */}
        <div className="overflow-hidden">
          <p className="foot-mark whitespace-nowrap text-center font-display leading-[0.8] text-bone/12 [font-size:clamp(2.5rem,12.5vw,13.5rem)]">
            {site.name}
          </p>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-bone/10 py-6 text-[0.68rem] tracking-wide text-sand-dim sm:flex-row">
          <p>
            &copy; {year} {site.name}. Proprietor: {site.owner.name}.
          </p>
          <p>
            {site.location.village}, {site.location.island},{" "}
            {site.location.district}
          </p>
        </div>
      </div>
    </footer>
  );
}
