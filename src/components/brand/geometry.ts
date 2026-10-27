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
 * A round badge: a King penguin standing on the shore, in profile, against
 * the sun going down over the bay. The sky inside the ring is one ember
 * disc, so the penguin always reads as a crisp silhouette — dark back, white
 * front, ember beak stripe, ear patch and feet — and the surf at its feet is
 * pale enough to read as ice as well as foam.
 *
 * ── THE RULES ───────────────────────────────────────────────
 *
 *    • Flat fills only, four tones:
 *        ink     currentColor — the ring and the sea, so the badge follows
 *                the text colour around it
 *        accent  ember — the sky, beak stripe, ear patch, feet
 *        dark    the penguin's back, head and beak
 *        light   the penguin's front and eye
 *    • Drawn on a 64-unit grid, centred on (32, 32). The penguin is drawn on
 *      its own grid and placed with PENGUIN_AT.
 */

export type Detail = "full" | "simple" | "micro";

export type Tone = "ink" | "accent" | "dark" | "light";

export type Part = {
  d: string;
  tone: Tone;
  /** Stroke width; when absent the part is filled. */
  stroke?: number;
  transform?: string;
};

/* ── Badge ───────────────────────────────────────────────────── */

const RING = "M2.4 32a29.6 29.6 0 1 0 59.2 0a29.6 29.6 0 1 0-59.2 0Z";

/**
 * Sky: the inner circle (r 27) above a chord at y = 49.5 — just below the
 * wave troughs, so no sliver of background shows between sky and sea.
 */
const SKY = "M32 5a27 27 0 0 1 20.56 44.5H11.44A27 27 0 0 1 32 5Z";

/**
 * Sea: the inner circle below a wavy waterline at y = 47.5, which meets the
 * circle at x = 32 ± 22.1.
 */
const SEA =
  "M9.9 47.5q5.53-2.6 11.05 0t11.05 0 11.05 0 11.05 0A27 27 0 0 1 9.9 47.5Z";

/* ── Penguin (own grid: head at y 6, feet at y 60, facing right) ── */

/** Head, back, tail and beak in one silhouette. */
const BODY =
  "M30 6C24.5 6 21.5 10.5 21.5 15.5C21.5 19 21 22 19.5 26C16.5 34 15.5 44 17.5 51C18.3 54 19.5 56 21 57L15.5 60L23.5 58.2C27 58.8 33 58.8 37 57.6C42 55.6 44.6 49 44.1 41C43.6 33 41.2 27 38.2 22.6C37.4 21.4 37.6 19.8 38 18.4C38.8 15.6 38.6 12.8 37.2 10.6C35.6 7.6 33 6 30 6Z M37 12.4L46.4 15.4L37.4 17.8C38.2 16 38.1 14.2 37 12.4Z";

/** The white front, from the chest down. */
const BELLY =
  "M37.3 19.8C40.2 24.2 42.7 30.5 42.8 40C42.9 48 40.4 54 35.4 56.3C32.8 52 31.4 44 31.7 36C32 29 34 23.8 37.3 19.8Z";

const EYE = "M31.4 12.2a1.15 1.15 0 1 0 2.3 0a1.15 1.15 0 1 0-2.3 0Z";

/** A King penguin's markings: the lower beak stripe and the ear patch. */
const MARKINGS =
  "M38.2 16.3L45.2 15.5L37.6 17.7Z M30.6 16.4C33.6 17.6 35.4 20.2 35 23.6C33.4 21.8 31.6 19.8 30.6 16.4Z";

const FEET = "M29 57.8C31.5 57.1 36 57.1 40 58.3C37.2 59.8 32.6 60 29 59.3Z";

/** Scaled to 0.66 and set so the feet meet the waterline. */
const PENGUIN_AT = "translate(11.5 7.2) scale(0.66)";

/* ── Tiers ───────────────────────────────────────────────────── */

/**
 * Which pieces survive at each size.
 *
 *   full    40px and up — everything
 *   simple  24–40px (nav, seal) — everything
 *   micro   under 24px (favicon) — the silhouette, front and beak only; the
 *           eye and markings are smaller than a pixel there
 */
export function partsFor(detail: Detail): Part[] {
  const at = PENGUIN_AT;
  const parts: Part[] = [
    { d: SKY, tone: "accent" },
    { d: SEA, tone: "ink" },
    { d: RING, tone: "ink", stroke: 2.4 },
    { d: BODY, tone: "dark", transform: at },
    { d: BELLY, tone: "light", transform: at },
  ];
  if (detail === "micro") return parts;

  parts.push(
    { d: EYE, tone: "light", transform: at },
    { d: MARKINGS, tone: "accent", transform: at },
    { d: FEET, tone: "accent", transform: at }
  );
  return parts;
}

export const VIEWBOX = { w: 64, h: 64 };

export const brandColors = {
  ink: "#05070d",
  /** Penguin back — a blue-black, a shade off the page ink. */
  night: "#0b1424",
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
  dark = brandColors.night,
  light = brandColors.bone,
  background,
  size,
  pad = 0,
}: {
  detail?: Detail;
  ink?: string;
  accent?: string;
  dark?: string;
  light?: string;
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
      const color = { ink, accent, dark, light }[p.tone];
      const t = p.transform ? ` transform="${p.transform}"` : "";
      return p.stroke
        ? `<path d="${p.d}"${t} fill="none" stroke="${color}" stroke-width="${p.stroke}" stroke-linecap="round"/>`
        : `<path d="${p.d}"${t} fill="${color}"/>`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${w} ${h}">
  ${bg}
  <g transform="translate(${pad} ${pad})">
    ${paths}
  </g>
</svg>`;
}
