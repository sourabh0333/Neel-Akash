"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/anim";
import { site, navLinks } from "@/lib/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";
import Magnetic from "./ui/Magnetic";
import { LogoMark } from "./brand/Logo";

export default function Nav() {
  const bar = useRef<HTMLElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  /* Hide on scroll down, reveal on scroll up, and go glass once past the hero. */
  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      let last = 0;
      const st = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const y = self.scroll();
          const solid = y > window.innerHeight * 0.85;
          el.dataset.solid = String(solid);

          // Never hide while the menu is open.
          if (menu.current?.dataset.open === "true") return;
          const goingDown = y > last && y > 300;
          gsap.to(el, {
            yPercent: goingDown ? -130 : 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
          });
          last = y;
        },
      });
      return () => st.kill();
    });
    return () => ctx.revert();
  }, []);

  /* Full-screen menu choreography. */
  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    el.dataset.open = String(open);

    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: open ? 1 : 0 });
      gsap.set(".nav-item", { opacity: 1, yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      if (open) {
        gsap
          .timeline()
          .set(el, { autoAlpha: 1 })
          .fromTo(
            ".nav-curtain",
            { scaleY: 0, transformOrigin: "top center" },
            { scaleY: 1, duration: 0.75, ease: "power4.inOut" }
          )
          .fromTo(
            ".nav-item",
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 0.9,
              ease: "power4.out",
              stagger: 0.06,
            },
            "-=0.3"
          )
          .fromTo(
            ".nav-aside",
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7 },
            "-=0.5"
          );
      } else {
        gsap
          .timeline()
          .to(".nav-item", {
            yPercent: -115,
            duration: 0.45,
            ease: "power3.in",
            stagger: 0.03,
          })
          .to(".nav-aside", { opacity: 0, duration: 0.3 }, 0)
          .to(
            ".nav-curtain",
            {
              scaleY: 0,
              transformOrigin: "bottom center",
              duration: 0.65,
              ease: "power4.inOut",
            },
            "-=0.15"
          )
          .set(el, { autoAlpha: 0 });
      }
    }, el);

    return () => ctx.revert();
  }, [open]);

  /* Escape closes; body locks while open. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    if (open) lockScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      if (open) unlockScroll();
    };
  }, [open]);

  return (
    <>
      <header
        ref={bar}
        data-solid="false"
        className="group fixed inset-x-0 top-0 z-[80] transition-colors duration-500 data-[solid=true]:bg-abyss/55 data-[solid=true]:backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[100rem] items-center justify-between px-6 py-5 md:px-10">
          <a
            href="#top"
            aria-label={`${site.name} — home`}
            className="group/logo flex items-center"
          >
            <LogoMark detail="simple"
              className="h-11 w-11 shrink-0 text-bone transition-colors duration-500 group-hover/logo:text-ember-300 md:h-12 md:w-12" />
          </a>

          <nav className="hidden items-center gap-9 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="link-draw text-[0.78rem] font-medium tracking-[0.14em] text-sand uppercase transition-colors duration-300 hover:text-bone"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Magnetic strength={0.25}>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                data-cursor="Call"
                className="hidden rounded-full border border-bone/20 px-5 py-2.5 text-[0.72rem] font-medium tracking-[0.16em] text-bone uppercase transition-colors duration-400 hover:border-ember-400 hover:text-ember-300 md:block"
              >
                {site.owner.phone}
              </a>
            </Magnetic>

            <button
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative z-[92] flex h-11 w-11 items-center justify-center rounded-full border border-bone/20 transition-colors duration-400 hover:border-ember-400"
            >
              <span className="relative block h-3 w-5">
                <span
                  className="absolute left-0 h-px w-full bg-bone transition-all duration-400"
                  style={{
                    top: open ? "50%" : 0,
                    transform: open ? "rotate(45deg)" : "none",
                  }}
                />
                <span
                  className="absolute left-0 h-px w-full bg-bone transition-all duration-400"
                  style={{
                    bottom: open ? "auto" : 0,
                    top: open ? "50%" : "auto",
                    transform: open ? "rotate(-45deg)" : "none",
                  }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        ref={menu}
        data-open="false"
        className="invisible fixed inset-0 z-[90] opacity-0"
      >
        <div className="nav-curtain absolute inset-0 bg-ink" />
        <div className="relative flex h-full flex-col justify-between px-6 pb-10 pt-28 md:px-10 md:pt-32">
          <nav className="flex flex-col">
            {navLinks.map((l, i) => (
              <div key={l.href} className="overflow-hidden">
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="nav-item group/nav flex items-baseline gap-5 py-1.5 md:py-2"
                >
                  <span className="font-sans text-[0.6rem] tracking-[0.3em] text-ember-500 tabular-nums">
                    0{i + 1}
                  </span>
                  <span className="font-display t-huge text-bone transition-colors duration-500 group-hover/nav:text-ember-400">
                    {l.label}
                  </span>
                </a>
              </div>
            ))}
          </nav>

          <div className="nav-aside grid gap-8 border-t border-bone/10 pt-8 sm:grid-cols-3">
            <div>
              <p className="t-eyebrow mb-2 text-sand-dim">Reservations</p>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                className="link-draw font-display text-2xl text-bone"
              >
                {site.owner.phone}
              </a>
            </div>
            <div>
              <p className="t-eyebrow mb-2 text-sand-dim">Find us</p>
              <p className="max-w-[22ch] text-sm leading-relaxed text-sand">
                {site.location.island}, {site.location.block},<br />
                {site.location.state} {site.location.pin}
              </p>
            </div>
            <div>
              <p className="t-eyebrow mb-2 text-sand-dim">Proprietor</p>
              <p className="text-sm text-sand">{site.owner.name}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
