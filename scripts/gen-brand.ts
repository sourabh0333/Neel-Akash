import { writeFileSync } from "node:fs";
import { penguinSvg, penguinInner, brandColors as c } from "../src/components/brand/penguin.ts";

/*
 * Regenerates every static copy of the mark from src/components/brand/
 * penguin.ts — the same drawing the animated header logo uses.
 */
const out: Array<[string, string]> = [
  // The favicon: the round badge alone, so it sits on any tab colour.
  ["src/app/icon.svg", penguinSvg({ size: 64 })],
  ["public/brand/mark.svg", penguinSvg({ size: 512 })],
  ["public/brand/mark-tile-dark.svg", penguinSvg({ background: c.ink, pad: 14, size: 512 })],
  ["public/brand/mark-tile-light.svg", penguinSvg({ background: c.bone, pad: 14, size: 512 })],
];

for (const [path, svg] of out) {
  writeFileSync(path, svg + "\n");
  console.log("wrote", path, svg.length + "b");
}

/* Horizontal lockup for signage. The mark is the same drawing; only the
   wordmark is hand-set (serif stack so it renders anywhere — convert to
   outlines for print). */
const lockup = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="288" viewBox="0 0 500 96">
  <title>Penguin Beach Camp — Mousuni Island</title>
  <rect width="500" height="96" fill="${c.ink}"/>
  <g transform="translate(12 12) scale(0.36)">${penguinInner("lockup")}</g>
  <text x="100" y="52" fill="${c.bone}" font-family="Instrument Serif, Georgia, 'Times New Roman', serif" font-size="38" letter-spacing="-0.5">Penguin Beach Camp</text>
  <text x="102" y="72" fill="${c.sandDim}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10" letter-spacing="3.4">MOUSUNI ISLAND · WEST BENGAL</text>
</svg>`;
writeFileSync("public/brand/lockup-on-dark.svg", lockup + "\n");
console.log("wrote public/brand/lockup-on-dark.svg", lockup.length + "b");
