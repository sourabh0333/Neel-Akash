import { ImageResponse } from "next/og";
import { site } from "@/lib/site";
import { penguinSvg, brandColors as c } from "@/components/brand/penguin";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The link-preview card. The emblem is handed to Satori as an SVG data URI
 * rather than rebuilt from boxes: it comes straight from penguin.ts, so the
 * share card and the site can never disagree about what the logo looks like.
 */
export default function OpengraphImage() {
  const mark = penguinSvg({ size: 180 });
  const src = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: c.ink,
          padding: 72,
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -220,
            height: 460,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(226,118,43,0.32), rgba(5,7,13,0) 70%)",
          }}
        />

        <div style={{ display: "flex", position: "relative" }}>
          <img src={src} width={180} height={180} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 10, color: c.sandDim }}>
            {site.location.island.toUpperCase()} · {site.location.state.toUpperCase()}
          </div>
          <div style={{ display: "flex", fontSize: 100, lineHeight: 1, marginTop: 20, color: c.bone }}>
            {site.name}
          </div>
          <div style={{ display: "flex", fontSize: 34, marginTop: 24, color: c.sand }}>
            {site.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
