import { ImageResponse } from "next/og";
import { penguinSvg, brandColors as c } from "@/components/brand/penguin";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Next only accepts jpg/jpeg/png for `apple-icon` — an SVG file here is
 * silently ignored — so the mark is rasterised into a real PNG, on a dark
 * tile because iOS fills any transparency with black or white.
 */
export default function AppleIcon() {
  const tile = penguinSvg({ background: c.ink, pad: 14, size: 180 });
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
