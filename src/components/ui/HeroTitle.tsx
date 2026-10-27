import type { ReactNode } from "react";

/**
 * A page's <h1>, keyword-led for search but still set like a film title: a
 * big display line (the search phrase, with its last word in italic ember)
 * and a smaller line that finishes the sentence. Both sit inside the one
 * heading, so search engines read it as a single phrase — "How to reach ·
 * Mousuni Island from Kolkata by train & ferry".
 *
 * The big line rises letter by letter and the tail floats in, through the
 * shared horizon opening (`hz-chars`, `hz-fade` in ./Horizon).
 *
 * `size` is the display line's font-size class, chosen per page so its
 * line fits one row at every width.
 */
export default function HeroTitle({
  lead,
  accent,
  tail,
  size = "text-[clamp(3rem,12vw,12rem)]",
}: {
  lead?: string;
  accent: string;
  tail: ReactNode;
  size?: string;
}) {
  return (
    <h1 className="font-display text-bone">
      <span className={`hz-chars block whitespace-nowrap leading-[0.84] tracking-[-0.035em] ${size}`}>
        {lead && <>{lead} </>}
        <span className="italic text-ember-300">{accent}</span>
      </span>
      <span className="hz-fade mt-4 block font-sans text-[clamp(1rem,1.7vw,1.45rem)] leading-snug tracking-normal text-sand md:mt-5">
        {tail}
      </span>
    </h1>
  );
}
