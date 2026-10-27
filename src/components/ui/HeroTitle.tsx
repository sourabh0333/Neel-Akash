import type { ReactNode } from "react";

/**
 * The display line, already split into letters on the server — each in a
 * clipping mask so it can rise from behind its own baseline. Doing the split
 * here rather than in the browser means the heading's letters exist at first
 * paint: the animation moves them, nothing is re-created afterwards, so the
 * page's largest paint is the real first one (and no aria-label has to be
 * patched onto a span). The text reads exactly as written to search engines.
 */
function Letters({ text }: { text: string }) {
  const words = text.split(" ");
  return words.map((w, wi) => (
    <span key={wi}>
      <span className="inline-block whitespace-nowrap">
        {[...w].map((c, ci) => (
          // The mask is padded so descenders and italic overhangs aren't cut.
          <span key={ci} className="-mx-[0.06em] -mb-[0.16em] inline-block overflow-hidden px-[0.06em] pb-[0.16em] align-bottom">
            <span className="hz-char inline-block">{c}</span>
          </span>
        ))}
      </span>
      {wi < words.length - 1 && " "}
    </span>
  ));
}

/**
 * A page's <h1>, keyword-led for search but still set like a film title: a
 * big display line (the search phrase, with its last word in italic ember)
 * and a smaller line that finishes the sentence. Both sit inside the one
 * heading, so search engines read it as a single phrase — "How to reach ·
 * Mousuni Island from Kolkata by train & ferry".
 *
 * The big line rises letter by letter and the tail floats in, through the
 * shared horizon opening (`hz-char`, `hz-fade` in ./Horizon).
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
      <span className={`block whitespace-nowrap leading-[0.84] tracking-[-0.035em] ${size}`}>
        {lead && (
          <>
            <Letters text={lead} />{" "}
          </>
        )}
        <span className="italic text-ember-300">
          <Letters text={accent} />
        </span>
      </span>
      {/* A real space, so the heading's raw text reads as one phrase. */}{" "}
      <span className="hz-fade mt-4 block font-sans text-[clamp(1rem,1.7vw,1.45rem)] leading-snug tracking-normal text-sand md:mt-5">
        {tail}
      </span>
    </h1>
  );
}
