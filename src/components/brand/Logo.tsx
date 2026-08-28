import { site } from "@/lib/site";
import {
  MATRA,
  VIEWBOX,
  rowsFor,
  brandColors,
  type Detail,
} from "./geometry";

/**
 * The Neel Akash mark: a Bengali matra with the island hanging beneath it in
 * kantha running stitch. See ./geometry.ts for the reasoning and every number.
 *
 * Tiers
 * -----
 *   <LogoMark />                  full — five stitched rows, 40px and up
 *   <LogoMark detail="simple" />  four rows, 24–40px
 *   <LogoMark detail="micro" />   three solid rows, under 24px
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
  animated = false,
}: {
  detail?: Detail;
  accent?: string;
  animated?: boolean;
}) {
  const { solid, stitches } = rowsFor(detail);

  return (
    <>
      {/* The matra — flat caps, because it is a typographic rule */}
      <line
        className={animated ? "logo-matra" : undefined}
        x1={MATRA.x1}
        y1={MATRA.y}
        x2={MATRA.x2}
        y2={MATRA.y}
        strokeWidth={MATRA.width}
        pathLength={1}
      />

      <g
        className={animated ? "logo-stitches" : undefined}
        strokeWidth={2.1}
        strokeLinecap="round"
      >
        {solid.map((r) => (
          <line
            key={`s${r.y}`}
            x1={32 - r.half}
            y1={r.y}
            x2={32 + r.half}
            y2={r.y}
            stroke={r.accent ? accent : undefined}
          />
        ))}
        {stitches.map((s, i) => (
          <line
            key={i}
            className="logo-stitch"
            x1={s.x1}
            y1={s.y}
            x2={s.x2}
            y2={s.y}
            stroke={s.accent ? accent : undefined}
          />
        ))}
      </g>
    </>
  );
}

export function LogoMark({
  className = "",
  detail = "full",
  accent,
  title,
  animated = false,
}: {
  className?: string;
  detail?: Detail;
  accent?: string;
  /** Supply only when the mark stands alone with no adjacent brand text. */
  title?: string;
  animated?: boolean;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
    >
      <MarkShapes detail={detail} accent={accent} animated={animated} />
    </svg>
  );
}

/**
 * Mark + wordmark. The Bengali sits under its own rule in the lockup, which
 * rhymes with the matra in the mark — the same device at two scales.
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

      <text
        className="font-sans"
        fill="currentColor"
        fontSize={7}
        letterSpacing={3.2}
        opacity={0.75}
      >
        <textPath href="#seal-arc" startOffset="0%">
          {words.toUpperCase()}
        </textPath>
      </text>

      {/* 64×64 mark centred in the 140 seal: (140-64)/2 = 38 */}
      <g
        transform="translate(38 38)"
        fill="none"
        stroke="currentColor"
        strokeLinecap="butt"
      >
        <MarkShapes detail="simple" />
      </g>
    </svg>
  );
}
