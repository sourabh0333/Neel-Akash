/**
 * The Penguin Beach Camp mark, as SVG markup — the single source for the
 * animated header logo (PenguinMark), the favicon, the Apple icon, the share
 * image and the files in public/brand. Plain strings, no React, so the icon
 * routes and scripts/gen-brand.ts can use it as well as the site.
 *
 * A King penguin drawn true to the bird — slate-grey back, the dark line
 * between back and belly, a white belly warming to gold at the breast,
 * orange ear patches running down the neck, a long slender bill with an
 * orange stripe — on the shore of a sunset badge, the sun low over the bay.
 *
 * The parts carry class names (pg-body, pg-flipper, pg-head, pg-eye, pg-sun,
 * pg-waves) that the "Penguin mark" CSS in globals.css animates; anywhere
 * that CSS isn't loaded (icons, print files) the same markup simply stands
 * still.
 */

export const PENGUIN_VIEWBOX = 200;

export const brandColors = {
  ink: "#05070d",
  bone: "#f4efe6",
  sand: "#d8cdbb",
  sandDim: "#8d8577",
  ember: "#f39c4a",
};

/** The inside of the mark (everything within <svg>). `p` prefixes the ids. */
export function penguinInner(p = "pg") {
  const id = (n: string) => `${n}-${p}`;
  const url = (n: string) => `url(#${id(n)})`;
  // Parts that move turn about their own pivot, given in the drawing's units.
  const pivot = (x: number, y: number) => `style="transform-origin:${x}px ${y}px;transform-box:view-box"`;
  const wave = (y: number) =>
    `M-200 ${y} q12.5 -5 25 0` + " t25 0".repeat(15);

  return `
<defs>
  <radialGradient id="${id("sky")}" cx="50%" cy="68%" r="70%">
    <stop offset="0" stop-color="#ffd38a"/><stop offset="0.38" stop-color="#f39c4a"/>
    <stop offset="0.8" stop-color="#c45a26"/><stop offset="1" stop-color="#7a2f1c"/>
  </radialGradient>
  <linearGradient id="${id("sea")}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2d63ad"/><stop offset="1" stop-color="#0a1730"/>
  </linearGradient>
  <linearGradient id="${id("sand")}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4e6cc"/><stop offset="1" stop-color="#d9bf93"/>
  </linearGradient>
  <linearGradient id="${id("back")}" x1="1" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7d8ea3"/><stop offset="0.55" stop-color="#3e4b5d"/><stop offset="1" stop-color="#1a2230"/>
  </linearGradient>
  <linearGradient id="${id("belly")}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ef8424"/><stop offset="0.12" stop-color="#f6b24a"/>
    <stop offset="0.3" stop-color="#fde9c4"/><stop offset="0.5" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e0d6"/>
  </linearGradient>
  <linearGradient id="${id("ear")}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffb13b"/><stop offset="1" stop-color="#ef7a1a"/>
  </linearGradient>
  <radialGradient id="${id("head")}" cx="40%" cy="35%" r="70%">
    <stop offset="0" stop-color="#2a3342"/><stop offset="1" stop-color="#090d14"/>
  </radialGradient>
  <clipPath id="${id("badge")}"><circle cx="100" cy="100" r="92"/></clipPath>
</defs>

<circle cx="100" cy="100" r="99" fill="#f4efe6"/>
<circle cx="100" cy="100" r="95" fill="#0b1220"/>

<g clip-path="${url("badge")}">
  <rect width="200" height="200" fill="${url("sky")}"/>
  <g class="pg-sun" ${pivot(100, 128)}>
    <circle cx="100" cy="128" r="54" fill="#ffd38a" opacity="0.28"/>
    <circle cx="100" cy="128" r="36" fill="#ffe2a8" opacity="0.9"/>
  </g>
  <rect y="130" width="200" height="70" fill="${url("sea")}"/>
  <g class="pg-waves">
    <path d="${wave(136)}" fill="none" stroke="#c3dcf7" stroke-opacity="0.6" stroke-width="1.6" stroke-linecap="round"/>
    <path d="${wave(146)}" fill="none" stroke="#c3dcf7" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round"/>
  </g>
  <path d="M0 168 C40 156 80 154 112 158 C150 162 178 160 200 154 V200 H0 Z" fill="${url("sand")}"/>

  <g class="pg-body" ${pivot(100, 172)}>
    <ellipse cx="100" cy="174" rx="26" ry="4" fill="#7a5b3a" opacity="0.35"/>
    <path d="M84 170 q-6 4 -2 6 h14 q2 -3 -2 -6 Z" fill="#1a1a1a"/>
    <path d="M102 170 q-4 4 0 6 h14 q3 -3 -2 -6 Z" fill="#1a1a1a"/>
    <path d="M96 52 C110 52 117 64 116 78 C125 95 129 118 127 140 C125 160 117 172 103 174 L89 174 C77 170 71 157 72 138 C74 114 79 94 84 80 C82 64 85 52 96 52 Z" fill="${url("back")}"/>
    <path d="M85 80 C78 100 75 124 77 144 C79 161 87 170 98 170 C108 169 113 160 112 143 C110 120 103 98 94 83 C91 79 88 78 85 80 Z" fill="${url("belly")}"/>
    <path d="M94 83 C103 98 110 120 112 143 C113 160 108 169 98 170" fill="none" stroke="#0d1420" stroke-width="2.6" stroke-linecap="round"/>
    <g class="pg-flipper" ${pivot(116, 92)}>
      <path d="M114 90 C124 104 128 124 124 146 C122 150 119 150 118 146 C114 128 110 110 110 96 Z" fill="#141b26"/>
      <path d="M115 96 C122 110 124 126 121 142" fill="none" stroke="#5c6c80" stroke-width="1.2" stroke-linecap="round"/>
    </g>
    <g class="pg-head" ${pivot(98, 76)}>
      <ellipse cx="96" cy="64" rx="15.5" ry="14.5" fill="${url("head")}"/>
      <path d="M101 57 C106.5 57.5 108.5 62.5 106.5 67.5 C104.5 71.5 101.5 74.5 99.5 79 C98.5 75 99 70 99.3 66 C99.4 62 99.6 59 101 57 Z" fill="${url("ear")}"/>
      <path d="M99.5 79 C97.5 82 95 84.5 92 86.5" fill="none" stroke="#ef7a1a" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M81 60 C70 61 58 66 48 74 C60 71 71 69 82 67 Z" fill="#101318"/>
      <path d="M81 65.5 C71 66.5 61 69.5 51 73.2 C61 73 72 72.2 81.5 71.2 Z" fill="#f08a3e"/>
      <g class="pg-eye" ${pivot(88, 59)}>
        <circle cx="88" cy="59" r="2.1" fill="#000"/>
        <circle cx="88.7" cy="58.3" r="0.7" fill="#fff"/>
      </g>
    </g>
  </g>
</g>

<circle cx="100" cy="100" r="92" fill="none" stroke="#f4efe6" stroke-opacity="0.5" stroke-width="1"/>`;
}

/**
 * The mark as a complete SVG file. `background` and `pad` (in drawing units)
 * put it on a rounded tile — the Apple icon and the tile files need one.
 */
export function penguinSvg({
  size,
  background,
  pad = 0,
  prefix = "pg",
}: { size?: number; background?: string; pad?: number; prefix?: string } = {}) {
  const w = PENGUIN_VIEWBOX + pad * 2;
  const dim = size ? ` width="${size}" height="${size}"` : "";
  const bg = background
    ? `<rect width="${w}" height="${w}" fill="${background}"${pad ? ` rx="${Math.round(w * 0.22)}"` : ""}/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg"${dim} viewBox="0 0 ${w} ${w}">${bg}<g transform="translate(${pad} ${pad})">${penguinInner(prefix)}</g></svg>`;
}
