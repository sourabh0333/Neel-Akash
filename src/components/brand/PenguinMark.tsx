"use client";

import { useId } from "react";
import { site } from "@/lib/site";

/**
 * The animated Penguin Beach Camp mark: a King penguin standing on the shore
 * of a sunset badge, drawn true to the bird — slate-grey back, white belly
 * warming to gold at the breast, orange ear patches that run down the neck,
 * and a long, slender bill with an orange stripe along the lower half.
 *
 * It lives: the penguin waddles on the spot, flaps a flipper now and then,
 * blinks and turns its head; the sun breathes and the sea runs along the
 * shore. All of it is CSS (see "Penguin mark" in globals.css), so it costs
 * nothing to run and stops under prefers-reduced-motion.
 *
 * `still` draws the same mark without motion (print, tiny sizes, or a
 * second copy that shouldn't compete with the first). Pass `title=""` where
 * the surrounding link already names the camp, and the mark is hidden from
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
  const id = useId().replace(/:/g, "");
  const u = (n: string) => `${n}-${id}`;
  const url = (n: string) => `url(#${u(n)})`;

  return (
    <svg
      viewBox="0 0 200 200"
      className={`${still ? "" : "pg-live"} ${className}`}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    >
      <defs>
        <radialGradient id={u("sky")} cx="50%" cy="68%" r="70%">
          <stop offset="0" stopColor="#ffd38a" />
          <stop offset="0.38" stopColor="#f39c4a" />
          <stop offset="0.8" stopColor="#c45a26" />
          <stop offset="1" stopColor="#7a2f1c" />
        </radialGradient>
        <linearGradient id={u("sea")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2d63ad" />
          <stop offset="1" stopColor="#0a1730" />
        </linearGradient>
        <linearGradient id={u("sand")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e6cc" />
          <stop offset="1" stopColor="#d9bf93" />
        </linearGradient>
        <linearGradient id={u("back")} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d8ea3" />
          <stop offset="0.55" stopColor="#3e4b5d" />
          <stop offset="1" stopColor="#1a2230" />
        </linearGradient>
        <linearGradient id={u("belly")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ef8424" />
          <stop offset="0.12" stopColor="#f6b24a" />
          <stop offset="0.3" stopColor="#fde9c4" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6e0d6" />
        </linearGradient>
        <linearGradient id={u("ear")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb13b" />
          <stop offset="1" stopColor="#ef7a1a" />
        </linearGradient>
        <radialGradient id={u("head")} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#2a3342" />
          <stop offset="1" stopColor="#090d14" />
        </radialGradient>
        <clipPath id={u("badge")}>
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      {/* ── The badge ── */}
      <circle cx="100" cy="100" r="99" fill="#f4efe6" />
      <circle cx="100" cy="100" r="95" fill="#0b1220" />

      <g clipPath={url("badge")}>
        <rect width="200" height="200" fill={url("sky")} />

        {/* The sun, low over the bay, breathing. */}
        <g className="pg-sun" style={{ transformOrigin: "100px 128px", transformBox: "view-box" }}>
          <circle cx="100" cy="128" r="54" fill="#ffd38a" opacity="0.28" />
          <circle cx="100" cy="128" r="36" fill="#ffe2a8" opacity="0.9" />
        </g>

        {/* The bay, its waves running along the shore. */}
        <rect y="130" width="200" height="70" fill={url("sea")} />
        <g className="pg-waves">
          {[136, 146].map((y, i) => (
            <path
              key={y}
              d={`M-200 ${y} q12.5 -5 25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0 t25 0`}
              fill="none"
              stroke="#c3dcf7"
              strokeOpacity={i ? 0.35 : 0.6}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ))}
        </g>

        {/* The beach the penguin stands on. */}
        <path d="M0 168 C40 156 80 154 112 158 C150 162 178 160 200 154 V200 H0 Z" fill={url("sand")} />

        {/* ── The penguin ── */}
        <g className="pg-body" style={{ transformOrigin: "100px 172px", transformBox: "view-box" }}>
          {/* Shadow on the sand */}
          <ellipse cx="100" cy="174" rx="26" ry="4" fill="#7a5b3a" opacity="0.35" />

          {/* Feet */}
          <path d="M84 170 q-6 4 -2 6 h14 q2 -3 -2 -6 Z" fill="#1a1a1a" />
          <path d="M102 170 q-4 4 0 6 h14 q3 -3 -2 -6 Z" fill="#1a1a1a" />

          {/* Body: the slate back and the dark sides */}
          <path
            d="M96 52 C110 52 117 64 116 78 C125 95 129 118 127 140 C125 160 117 172 103 174 L89 174 C77 170 71 157 72 138 C74 114 79 94 84 80 C82 64 85 52 96 52 Z"
            fill={url("back")}
          />

          {/* Belly, warming to gold at the breast */}
          <path
            d="M85 80 C78 100 75 124 77 144 C79 161 87 170 98 170 C108 169 113 160 112 143 C110 120 103 98 94 83 C91 79 88 78 85 80 Z"
            fill={url("belly")}
          />
          {/* The dark line a King penguin has between belly and back */}
          <path
            d="M94 83 C103 98 110 120 112 143 C113 160 108 169 98 170"
            fill="none"
            stroke="#0d1420"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* The flipper, which flaps now and then */}
          <g className="pg-flipper" style={{ transformOrigin: "116px 92px", transformBox: "view-box" }}>
            <path
              d="M114 90 C124 104 128 124 124 146 C122 150 119 150 118 146 C114 128 110 110 110 96 Z"
              fill="#141b26"
            />
            <path d="M115 96 C122 110 124 126 121 142" fill="none" stroke="#5c6c80" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* The head, which turns a little */}
          <g className="pg-head" style={{ transformOrigin: "98px 76px", transformBox: "view-box" }}>
            <ellipse cx="96" cy="64" rx="15.5" ry="14.5" fill={url("head")} />
            {/* Ear patch and the line of orange down the neck */}
            <path
              d="M101 57 C106.5 57.5 108.5 62.5 106.5 67.5 C104.5 71.5 101.5 74.5 99.5 79 C98.5 75 99 70 99.3 66 C99.4 62 99.6 59 101 57 Z"
              fill={url("ear")}
            />
            <path d="M99.5 79 C97.5 82 95 84.5 92 86.5" fill="none" stroke="#ef7a1a" strokeWidth="2.2" strokeLinecap="round" />
            {/* The long, slender bill, with its orange stripe */}
            <path d="M81 60 C70 61 58 66 48 74 C60 71 71 69 82 67 Z" fill="#101318" />
            <path d="M81 65.5 C71 66.5 61 69.5 51 73.2 C61 73 72 72.2 81.5 71.2 Z" fill="#f08a3e" />
            {/* Eye, with a catch of light; it blinks */}
            <g className="pg-eye" style={{ transformOrigin: "88px 59px", transformBox: "view-box" }}>
              <circle cx="88" cy="59" r="2.1" fill="#000" />
              <circle cx="88.7" cy="58.3" r="0.7" fill="#fff" />
            </g>
          </g>
        </g>
      </g>

      {/* Fine outer ring */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#f4efe6" strokeOpacity="0.5" strokeWidth="1" />
    </svg>
  );
}
