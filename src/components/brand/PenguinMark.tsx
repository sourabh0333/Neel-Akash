"use client";

import { useId } from "react";
import { site } from "@/lib/site";
import { PENGUIN_VIEWBOX, penguinInner } from "./penguin";

/**
 * The animated Penguin Beach Camp mark, used in the header and footer. The
 * drawing itself lives in ./penguin.ts — the same markup the favicon, the
 * Apple icon, the share image and public/brand are made from — and the
 * "Penguin mark" CSS in globals.css brings it to life: the penguin waddles,
 * flaps a flipper now and then, blinks and looks out to sea; the sun
 * breathes and the waves run. It stops under prefers-reduced-motion.
 *
 * `still` draws the same mark without motion. Pass `title=""` where the
 * surrounding link already names the camp, and the mark is hidden from
 * screen readers.
 */
export default function PenguinMark({
  className = "",
  still = false,
  title = `${site.name} logo`,
}: {
  className?: string;
  still?: boolean;
  title?: string;
}) {
  // Gradient ids must be unique per copy on the page (header and footer).
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      viewBox={`0 0 ${PENGUIN_VIEWBOX} ${PENGUIN_VIEWBOX}`}
      className={`${still ? "" : "pg-live"} ${className}`}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      // Markup we generate ourselves from constants; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: penguinInner(id) }}
    />
  );
}
