"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, SplitText, prefersReducedMotion } from "@/lib/anim";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds of delay after the trigger fires. */
  delay?: number;
  /** `lines` masks and lifts each line; `fade` just floats the block in. */
  mode?: "lines" | "fade";
  start?: string;
};

/**
 * The workhorse entrance. Text splits into masked lines that rise from
 * behind their own baseline — the move that reads as "considered" rather
 * than "animated".
 *
 * `autoSplit` re-splits when the font loads or the box reflows, and re-runs
 * `onSplit` for the new lines. Without it, a resize leaves text reflowing
 * inside stale line wrappers whose `overflow: hidden` then clips it.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  mode = "lines",
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current;
      if (!el) return;

      el.classList.add("is-ready");

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

      // Nothing is split or measured until the element is about to scroll
      // into view. Splitting text into lines forces a layout per element,
      // and a page has dozens of these: doing them all at load was the
      // biggest block on the main thread. Text that is never reached is
      // simply never split, and stays visible as plain text.
      let split: { revert: () => void } | undefined;
      const setup = contextSafe!(() => {
        if (mode === "fade") {
          gsap.fromTo(
            el,
            { opacity: 0, y: 34 },
            {
              opacity: 1,
              y: 0,
              duration: 1.2,
              delay,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start },
            }
          );
          return;
        }

        gsap.set(el, { opacity: 1 });
        split = SplitText.create(el, {
          type: "lines",
          linesClass: "line-inner",
          mask: "lines",
          autoSplit: true,
          // Lines stay readable as they are (no aria-label on the element).
          aria: "none",
          // Returning the tween lets GSAP kill it cleanly before each re-split.
          onSplit: (self: { lines: Element[] }) =>
            gsap.fromTo(
              self.lines,
              { yPercent: 108 },
              {
                yPercent: 0,
                duration: 1.25,
                delay,
                ease: "power4.out",
                stagger: 0.085,
                scrollTrigger: { trigger: el, start },
              }
            ),
        });
      });

      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          setup();
        },
        // A quarter of a screen early, so the hidden start state is set
        // before the element can be seen.
        { rootMargin: "0px 0px 25% 0px" }
      );
      io.observe(el);

      return () => {
        io.disconnect();
        split?.revert();
      };
    },
    { scope: ref, dependencies: [mode, delay, start] }
  );

  const cls = `${mode === "lines" ? "js-reveal" : "js-fade"} ${className}`;
  return (
    <Tag ref={ref} className={cls}>
      {children}
    </Tag>
  );
}
