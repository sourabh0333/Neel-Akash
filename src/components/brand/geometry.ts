/**
 * ─────────────────────────────────────────────────────────────
 *  PENGUIN BEACH CAMP — mark geometry, single source of truth
 * ─────────────────────────────────────────────────────────────
 *
 * Every surface reads from here: the React component, the favicon, the print
 * files, the share card. Nothing is drawn twice, so the mark cannot drift.
 *
 * ── WHY THIS, AND NOT A SUN OVER WATER ──────────────────────
 *
 * A disc on a horizon inside a circle is the house style of every beach
 * resort on earth. Swap the name and it still works — which is the proof
 * that it says nothing. This mark is built from two things that belong to
 * this island and nowhere else.
 *
 * 1. THE MATRA (মাত্রা)
 *    Bengali is written hanging from a horizontal headstroke — the matra —
 *    that runs along the top of every word and binds it together. It is the
 *    single most recognisable feature of the script.
 *
 *    So the mark is a matra with everything hanging beneath it, and the
 *    empty field above the stroke is the sky over the bay. Not a picture of
 *    a sky — the typographic one, the line Bengali itself hangs from.
 *
 * 2. KANTHA (কাঁথা)
 *    The running-stitch quilting of rural Bengal, sewn by women from layered
 *    worn saris — the craft of this exact stretch of delta. Its earliest and
 *    plainest form is a straight running stitch, and a running stitch is
 *    literally a dashed line. It is also, in every account of it, prized for
 *    the "rippled effect" the stitches produce: water.
 *
 *    So the land and sea below the matra are stitched, not drawn. Kantha is
 *    worked from memory without pre-drawing, so the stitch lengths here carry
 *    a small deterministic irregularity — the mark is hand-sewn, not printed.
 *
 * THE FORM
 *    Rows of stitching narrow as they descend: Mousuni is a deltaic island
 *    tapering south into the Bay of Bengal, and it is losing its south-western
 *    edge to erosion. The rows read equally as the island itself and as the
 *    tide going out across four kilometres of flat sand.
 *
 *    One stitch in the last row is ember — the single warm thread. Kantha is
 *    often worked with a contrasting thread pulled from a different sari.
 */

/* ── The matra ─────────────────────────────────────────────────
   Flat caps, not round: it is a typographic rule, not a drawn line. */
export const MATRA = { y: 14, x1: 8, x2: 56, width: 3 };

/**
 * Stitched rows. `half` is the half-width about x=32, so every row is
 * centred by construction and the taper is arithmetic.
 */
export const ROWS = [
  { y: 24, half: 24 },
  { y: 31, half: 22 },
  { y: 38, half: 19 },
  { y: 45, half: 15 },
  { y: 52, half: 9, accent: true },
];

const STITCH = 3.4;
const GAP = 2.6;

/** Deterministic jitter — a fixed seed, so every render is identical. */
function wobble(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x); // 0…1
}

export type Stitch = { x1: number; x2: number; y: number; accent?: boolean };

/**
 * Lay a row of running stitches between x1 and x2. Stitch count is chosen so
 * the row begins and ends with a whole stitch — a real seam does not stop
 * mid-stitch — then the leftover is shared out and each length nudged
 * slightly, because kantha is sewn by eye.
 */
function stitchRow(y: number, half: number, seed: number, accent = false): Stitch[] {
  const x1 = 32 - half;
  const x2 = 32 + half;
  const span = x2 - x1;

  const n = Math.max(2, Math.round((span + GAP) / (STITCH + GAP)));
  const gap = (span - n * STITCH) / (n - 1);

  const out: Stitch[] = [];
  for (let i = 0; i < n; i++) {
    const nudge = (wobble(seed * 31 + i) - 0.5) * 0.7;
    const start = x1 + i * (STITCH + gap);
    const end = Math.min(x2, start + STITCH + nudge);
    out.push({
      x1: Math.round(start * 100) / 100,
      y,
      x2: Math.round(end * 100) / 100,
      // The warm thread sits one in from the end, not dead centre.
      accent: accent && i === n - 2,
    });
  }
  return out;
}

export type Detail = "full" | "simple" | "micro";

/** Which rows survive, and whether they are stitched or solid. */
export function rowsFor(detail: Detail) {
  if (detail === "micro") {
    // Below ~24px a dash pattern silts up into mud. Keep the silhouette,
    // drop the stitching, and carry only three rows.
    return {
      solid: [ROWS[0], ROWS[2], ROWS[4]],
      stitches: [] as Stitch[],
    };
  }
  const rows = detail === "simple" ? [ROWS[0], ROWS[1], ROWS[2], ROWS[4]] : ROWS;
  return {
    solid: [] as typeof ROWS,
    stitches: rows.flatMap((r, i) => stitchRow(r.y, r.half, i + 1, r.accent)),
  };
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
  stroke = brandColors.bone,
  accent = brandColors.ember,
  background,
  size,
  pad = 0,
}: {
  detail?: Detail;
  stroke?: string;
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

  const { solid, stitches } = rowsFor(detail);

  const solidRows = solid
    .map(
      (r) =>
        `<line x1="${32 - r.half}" y1="${r.y}" x2="${32 + r.half}" y2="${r.y}"${
          r.accent ? ` stroke="${accent}"` : ""
        }/>`
    )
    .join("");

  const sewn = stitches
    .map(
      (s) =>
        `<line x1="${s.x1}" y1="${s.y}" x2="${s.x2}" y2="${s.y}"${
          s.accent ? ` stroke="${accent}"` : ""
        }/>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${w} ${h}">
  ${bg}
  <g transform="translate(${pad} ${pad})">
    <line x1="${MATRA.x1}" y1="${MATRA.y}" x2="${MATRA.x2}" y2="${MATRA.y}" stroke="${stroke}" stroke-width="${MATRA.width}"/>
    <g stroke="${stroke}" stroke-width="2.1" stroke-linecap="round">${solidRows}${sewn}</g>
  </g>
</svg>`;
}
