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
    () => {
      const el = ref.current;
      if (!el) return;

      el.classList.add("is-ready");

      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }

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

      const split = SplitText.create(el, {
        type: "lines",
        linesClass: "line-inner",
        mask: "lines",
        autoSplit: true,
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

      return () => split.revert();
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
