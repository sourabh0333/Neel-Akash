import { site } from "@/lib/site";
import { penguinInner } from "./penguin";

/**
 * The stamp: the mark inside a ring of text, set faint behind the footer.
 * Decorative — the same words are always present as real text nearby, so it
 * is hidden from assistive tech. The animated mark itself is ./PenguinMark;
 * both draw from ./penguin.ts.
 */
export function LogoSeal({ className = "" }: { className?: string }) {
  const words = `${site.name}  ·  ${site.location.island}  ·  ${site.location.state}  ·  `;

  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <defs>
        <path
          id="seal-arc"
          d="M70,70 m-55,0 a55,55 0 1,1 110,0 a55,55 0 1,1 -110,0"
          fill="none"
        />
      </defs>

      <circle
        cx={70}
        cy={70}
        r={68}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.35}
      />

      {/* textLength = the arc's circumference (2π·55), so the ring always
          closes exactly on itself however long the name is. */}
      <text
        className="font-sans"
        fill="currentColor"
        fontSize={7}
        letterSpacing={3.2}
        textLength={345.6}
        lengthAdjust="spacing"
        opacity={0.75}
      >
        <textPath href="#seal-arc" startOffset="0%">
          {words.toUpperCase()}
        </textPath>
      </text>

      {/* The 200-unit mark drawn 64 wide in the middle of the seal, washed
          out to grey so it reads as a stamp rather than a second logo. */}
      <g
        transform="translate(38 38) scale(0.32)"
        opacity={0.3}
        style={{ filter: "grayscale(1)" }}
        dangerouslySetInnerHTML={{ __html: penguinInner("seal") }}
      />
    </svg>
  );
}
