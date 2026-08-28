import { ImageResponse } from "next/og";
import { markSvgString, brandColors as c } from "@/components/brand/geometry";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Next only accepts jpg/jpeg/png for `apple-icon` — an SVG file here is
 * silently ignored — so the emblem is rasterised into a real PNG.
 */
export default function AppleIcon() {
  const tile = markSvgString({
    stroke: c.bone,
    accent: c.ember,
    background: c.ink,
    pad: 12,
  });
  const src = `data:image/svg+xml;base64,${Buffer.from(tile).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex" }}>
        <img src={src} width={180} height={180} alt="" />
      </div>
    ),
    { ...size }
  );
}
