import { site } from "@/lib/site";
import { VIEWBOX, TIER_SHIFT, partsFor, brandColors, type Detail } from "./geometry";

/**
 * The Penguin Beach Camp mark: a penguin that is also an A-frame tent, with
 * the sun over its shoulder and a wave underfoot. See ./geometry.ts for the
 * reasoning and every number.
 *
 * Tiers
 * -----
 *   <LogoMark />                  full — with the wave, 40px and up
 *   <LogoMark detail="simple" />  no wave, 24–40px
 *   <LogoMark detail="micro" />   silhouette, door, beak and sun, under 24px
 *   <Logo variant="lockup" />     mark + wordmark, horizontal
 *   <Logo variant="stacked" />    mark over wordmark
 *   <LogoSeal />                  mark inside a ring of text — a stamp
 *
 * Wordmarks are real HTML text, never SVG paths: selectable, searchable,
 * translatable, and set in the loaded display face.
 */

function MarkShapes({
  detail = "full",
  accent = `var(--color-ember-400, ${brandColors.ember})`,
}: {
  detail?: Detail;
  accent?: string;
}) {
  return (
    <g transform={`translate(0 ${TIER_SHIFT[detail]})`}>
      {partsFor(detail).map((p, i) => {
        const color = p.tone === "accent" ? accent : "currentColor";
        return p.stroke ? (
          <path
            key={i}
            d={p.d}
            fill="none"
            stroke={color}
            strokeWidth={p.stroke}
            strokeLinecap="round"
          />
        ) : (
          <path key={i} d={p.d} fill={color} fillRule="evenodd" />
        );
      })}
    </g>
  );
}

export function LogoMark({
  className = "",
  detail = "full",
  accent,
  title,
}: {
  className?: string;
  detail?: Detail;
  accent?: string;
  /** Supply only when the mark stands alone with no adjacent brand text. */
  title?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <MarkShapes detail={detail} accent={accent} />
    </svg>
  );
}

/**
 * Mark + wordmark, with the island set small underneath.
 */
export function Logo({
  variant = "lockup",
  className = "",
  markClassName = "",
  showSubline = true,
}: {
  variant?: "lockup" | "stacked";
  className?: string;
  markClassName?: string;
  showSubline?: boolean;
}) {
  const stacked = variant === "stacked";

  return (
    <span
      className={`flex ${
        stacked
          ? "flex-col items-center gap-4 text-center"
          : "flex-row items-center gap-3.5"
      } ${className}`}
    >
      <LogoMark className={markClassName || (stacked ? "h-16 w-16" : "h-11 w-11")} />

      <span className={`flex flex-col ${stacked ? "items-center" : "items-start"}`}>
        <span className="font-display text-xl leading-none tracking-tight text-current md:text-2xl">
          {site.name}
        </span>
        {showSubline && (
          <span className="mt-1.5 text-[0.52rem] uppercase tracking-[0.32em] text-sand-dim">
            {site.location.island}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * The stamp: the mark inside a ring of text. Decorative — the same words are
 * always present as real text nearby, so it is hidden from assistive tech.
 */
export function LogoSeal({ className = "" }: { className?: string }) {
  const words = `${site.name}  ·  ${site.location.island}  ·  ${site.location.state}  ·  `;

  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <defs>
        <path
          id="seal-arc"
          d="M70,70 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0"
          fill="none"
        />
      </defs>

      <circle
        cx={70}
        cy={70}
        r={68}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.35}
      />

      {/* textLength = the arc's circumference (2π·55), so the ring always
          closes exactly on itself however long the name is. */}
      <text
        className="font-sans"
        fill="currentColor"
        fontSize={7}
        letterSpacing={3.2}
        textLength={345.6}
        lengthAdjust="spacing"
        opacity={0.75}
      >
        <textPath href="#seal-arc" startOffset="0%">
          {words.toUpperCase()}
        </textPath>
      </text>

      {/* 64×64 mark centred in the 140 seal: (140-64)/2 = 38 */}
      <g transform="translate(38 38)">
        <MarkShapes detail="simple" />
      </g>
    </svg>
  );
}
