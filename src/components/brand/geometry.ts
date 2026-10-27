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
 * A round badge: the sun going down into the bay, and a penguin standing on
 * the shore in front of it.
 *
 * The penguin IS the tent. A penguin standing upright is already an A-frame:
 * narrow at the head, wide at the base. So the body is one rounded triangle,
 * and the white belly is cut out as the tent's door — the sun shows through
 * it. One shape says both halves of the name, penguin and camp; the sun and
 * the sea around it say beach.
 *
 * ── THE RULES ───────────────────────────────────────────────
 *
 *    • Flat fills only, two tones: ink (currentColor) and ember.
 *    • No background-coloured shapes. Eyes and door are holes (even-odd),
 *      and the penguin stands clear of the water instead of being outlined,
 *      so the badge sits on dark, light or a photograph without a halo.
 *    • Drawn on a 64-unit grid, centred on (32, 32).
 */

export type Detail = "full" | "simple" | "micro";

export type Part = {
  d: string;
  tone: "ink" | "accent";
  /** Stroke width; when absent the part is filled. */
  stroke?: number;
  transform?: string;
};

/* ── Pieces ──────────────────────────────────────────────────── */

/** The badge ring. */
const RING = "M2.4 32a29.6 29.6 0 1 0 59.2 0a29.6 29.6 0 1 0-59.2 0Z";

/**
 * Sun, drawn only above the waterline (y = 47.5) — a segment of a circle of
 * radius 19 centred at (32, 44), so nothing needs clipping.
 */
const SUN = "M13.33 47.5A19 19 0 1 1 50.67 47.5Z";

/**
 * Sea: the part of the badge's inner circle (r 27) below a wavy waterline.
 * The waterline meets the circle at x = 32 ± 22.1.
 */
const SEA =
  "M9.9 47.5q5.53-2.6 11.05 0t11.05 0 11.05 0 11.05 0A27 27 0 0 1 9.9 47.5Z";

/* The tent penguin, drawn on its own 64 grid and placed by PENGUIN_AT. */

/** Rounded A-frame: head at the apex, canvas flaring to the ground. */
const BODY =
  "M32 6.5C35 6.5 37.2 8.6 38.5 12L52.5 48.5C53.6 51.4 51.9 53.5 49 53.5H15C12.1 53.5 10.4 51.4 11.5 48.5L25.5 12C26.8 8.6 29 6.5 32 6.5Z";

/** The door — and the belly. Curved flaps, open to the ground. */
const DOOR = "M32 26.5C36 33 39.6 43 42.6 53.5H21.4C24.4 43 28 33 32 26.5Z";

const EYES =
  "M27.6 16.2a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0Z M33 16.2a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0Z";

const BEAK = "M29.9 19.4H34.1L32 22.7Z";

/** Scaled to 0.56 and set so its feet sit just clear of the wave crests. */
const PENGUIN_AT = "translate(32 31.4) scale(0.56) translate(-32 -30)";

/* ── Tiers ───────────────────────────────────────────────────── */

/**
 * Which pieces survive at each size.
 *
 *   full    40px and up — everything
 *   simple  24–40px (nav, seal) — everything; the badge has no fine detail
 *           left to lose at this size
 *   micro   under 24px (favicon) — drops the eyes and beak, which fill in
 *           below ~20px
 */
export function partsFor(detail: Detail): Part[] {
  const parts: Part[] = [
    { d: RING, tone: "ink", stroke: 2.4 },
    { d: SUN, tone: "accent" },
    { d: SEA, tone: "ink" },
  ];

  if (detail === "micro") {
    parts.push({ d: `${BODY} ${DOOR}`, tone: "ink", transform: PENGUIN_AT });
    return parts;
  }

  parts.push(
    { d: `${BODY} ${DOOR} ${EYES}`, tone: "ink", transform: PENGUIN_AT },
    { d: BEAK, tone: "accent", transform: PENGUIN_AT }
  );
  return parts;
}

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
      const t = p.transform ? ` transform="${p.transform}"` : "";
      return p.stroke
        ? `<path d="${p.d}"${t} fill="none" stroke="${color}" stroke-width="${p.stroke}" stroke-linecap="round"/>`
        : `<path d="${p.d}"${t} fill="${color}" fill-rule="evenodd"/>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${w} ${h}">
  ${bg}
  <g transform="translate(${pad} ${pad})">
    ${paths}
  </g>
</svg>`;
}
