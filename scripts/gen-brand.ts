import { writeFileSync } from "node:fs";
import { markSvgString, brandColors as c } from "../src/components/brand/geometry.ts";

const out: Array<[string, string]> = [
  ["public/brand/mark-on-dark.svg", markSvgString({ stroke: c.bone, accent: c.ember, size: 512 })],
  ["public/brand/mark-on-light.svg", markSvgString({ stroke: c.ink, accent: c.emberDeep, size: 512 })],
  ["public/brand/mark-tile-dark.svg", markSvgString({ stroke: c.bone, accent: c.ember, background: c.ink, pad: 12, size: 512 })],
  ["src/app/icon.svg", markSvgString({ detail: "micro", stroke: c.bone, accent: c.ember, background: c.ink, pad: 9, size: 64 })],
  ["public/brand/mark-tile-light.svg", markSvgString({ stroke: c.ink, accent: c.emberDeep, background: c.bone, pad: 12, size: 512 })],
];

for (const [path, svg] of out) {
  writeFileSync(path, svg + "\n");
  console.log("wrote", path, svg.length + "b");
}

/* Horizontal lockup for signage. The emblem is inlined from the same
   geometry; only the wordmark is hand-set (serif stack so it renders
   anywhere — convert to outlines for print). */
const mark = markSvgString({ stroke: c.bone, accent: c.ember })
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

const lockup = `<svg xmlns="http://www.w3.org/2000/svg" width="1260" height="288" viewBox="0 0 420 96">
  <title>Neel Akash — Mousuni Island</title>
  <g transform="translate(14 16)">${mark}</g>
  <text x="100" y="52" fill="${c.bone}" font-family="Instrument Serif, Georgia, 'Times New Roman', serif" font-size="38" letter-spacing="-0.5">Neel Akash</text>
  <text x="102" y="72" fill="${c.sandDim}" font-family="Inter, Helvetica, Arial, sans-serif" font-size="10" letter-spacing="3.4">MOUSUNI ISLAND · WEST BENGAL</text>
</svg>`;
writeFileSync("public/brand/lockup-on-dark.svg", lockup + "\n");
console.log("wrote public/brand/lockup-on-dark.svg", lockup.length + "b");
