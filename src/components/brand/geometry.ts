/**
 * ─────────────────────────────────────────────────────────────
 *  PENGUIN BEACH CAMP — mark geometry, single source of truth
 * ─────────────────────────────────────────────────────────────
 *
 * Every surface reads from here: the React component, the favicon, the print
 * files, the share card. Nothing is drawn twice, so the mark cannot drift.
 *
 * ── THE IDEA ────────────────────────────────────────────────
 *
 * The penguin IS the tent. A penguin standing upright is already an A-frame:
 * narrow at the head, wide at the base. So the body is one rounded triangle,
 * and the white belly is cut out as the tent's door. One shape says both
 * halves of the name — penguin, camp — and the rest says beach:
 *
 *    • an ember sun over its shoulder, low, the way it sits over the bay
 *    • a single wave underfoot
 *    • ember feet that double as tent pegs
 *
 * ── THE RULES ───────────────────────────────────────────────
 *
 *    • Flat fills only, two tones: ink (currentColor) and ember.
 *    • Eyes and door are holes (even-odd), not white shapes, so the mark sits
 *      on any background — dark, light or photograph — without a halo.
 *    • Drawn on a 64-unit grid, centred on x = 32.
 */

export type Detail = "full" | "simple" | "micro";

export type Part = {
  d: string;
  tone: "ink" | "accent";
  /** Stroke width; when absent the part is filled. */
  stroke?: number;
};

/* ── Pieces ──────────────────────────────────────────────────── */

/** Rounded A-frame: head at the apex, canvas flaring to the ground. */
const BODY =
  "M32 6.5C35 6.5 37.2 8.6 38.5 12L52.5 48.5C53.6 51.4 51.9 53.5 49 53.5H15C12.1 53.5 10.4 51.4 11.5 48.5L25.5 12C26.8 8.6 29 6.5 32 6.5Z";

/** The door — and the belly. Curved flaps, open to the ground. */
const DOOR = "M32 26.5C36 33 39.6 43 42.6 53.5H21.4C24.4 43 28 33 32 26.5Z";

const EYES =
  "M27.6 16.2a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0Z M33 16.2a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0Z";

/** Flippers flare off the canvas like guy-lines pulled taut. */
const FLIPPERS =
  "M17.6 33.5C13 37 10 42.5 9.6 48.2C12.6 45.6 14.8 43.6 16.4 42.2Z M46.4 33.5C51 37 54 42.5 54.4 48.2C51.4 45.6 49.2 43.6 47.6 42.2Z";

const BEAK = "M29.9 19.4H34.1L32 22.7Z";

const SUN = "M41 14.5a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0Z";

const FEET =
  "M17.5 53.5h5a1.5 1.5 0 0 1 0 3h-5a1.5 1.5 0 0 1 0-3Z M41.5 53.5h5a1.5 1.5 0 0 1 0 3h-5a1.5 1.5 0 0 1 0-3Z";

const WAVE = "M4 60.5q7-3.6 14 0t14 0 14 0 14 0";

/* ── Tiers ───────────────────────────────────────────────────── */

/**
 * Which pieces survive at each size.
 *
 *   full    40px and up — everything
 *   simple  24–40px (nav, seal) — drops the wave, which turns to a smudge
 *   micro   under 24px (favicon) — body, door, beak and sun only; eyes and
 *           flippers fill in below ~20px and just muddy the silhouette
 */
export function partsFor(detail: Detail): Part[] {
  const sun: Part = { d: SUN, tone: "accent" };
  const beak: Part = { d: BEAK, tone: "accent" };

  if (detail === "micro") {
    return [sun, { d: `${BODY} ${DOOR}`, tone: "ink" }, beak];
  }

  const parts: Part[] = [
    sun,
    { d: `${BODY} ${DOOR} ${EYES} ${FLIPPERS}`, tone: "ink" },
    beak,
    { d: FEET, tone: "accent" },
  ];
  if (detail === "full") parts.push({ d: WAVE, tone: "ink", stroke: 2.4 });
  return parts;
}

/**
 * Vertical nudge per tier. Micro loses the feet and wave, so what is left
 * sits high on the grid; this re-centres it in the favicon tile.
 */
export const TIER_SHIFT: Record<Detail, number> = { full: 0, simple: 0, micro: 2 };

export const VIEWBOX = { w: 64, h: 64 };

export const brandColors = {
  ink: "#05070d",
  bone: "#f4efe6",
  sand: "#d8cdbb",
  sandDim: "#8d8577",
  ember: "#f39c4a",
  emberDeep: "#b7541f",
};

/**
 * The mark as a standalone SVG string — for the favicon, print files and the
 * OG/Apple images, which need markup rather than JSX.
 */
export function markSvgString({
  detail = "full",
  ink = brandColors.bone,
  accent = brandColors.ember,
  background,
  size,
  pad = 0,
}: {
  detail?: Detail;
  ink?: string;
  accent?: string;
  background?: string;
  size?: number;
  pad?: number;
} = {}) {
  const w = VIEWBOX.w + pad * 2;
  const h = VIEWBOX.h + pad * 2;
  const dim = size ? ` width="${size}" height="${Math.round((size * h) / w)}"` : "";
  const bg = background
    ? `<rect width="${w}" height="${h}" fill="${background}"${
        pad ? ` rx="${Math.round(w * 0.2)}"` : ""
      }/>`
    : "";

  const paths = partsFor(detail)
    .map((p) => {
      const color = p.tone === "accent" ? accent : ink;
      return p.stroke
        ? `<path d="${p.d}" fill="none" stroke="${color}" stroke-width="${p.stroke}" stroke-linecap="round"/>`
        : `<path d="${p.d}" fill="${color}" fill-rule="evenodd"/>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${w} ${h}">
  ${bg}
  <g transform="translate(${pad} ${pad + TIER_SHIFT[detail]})">
    ${paths}
  </g>
</svg>`;
}
