import { site } from "@/lib/site";

/** The numbers after the main one, for showing beside it. */
export const otherPhones = site.owner.phones.slice(1);

/**
 * The camp's other numbers as tap-to-call links, set under or beside a
 * main "Call" button or number: "Also +91 92391 81660   +91 80016 96332".
 * Spaced rather than dotted, so a wrap never starts a line with a separator.
 */
export default function MorePhones({
  className = "",
  label = "Also",
}: {
  className?: string;
  /** The word before the numbers; pass "" to show only the numbers. */
  label?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-sand ${className}`}>
      {label && <span className="text-[0.6rem] uppercase tracking-[0.2em] text-sand-dim">{label}</span>}
      {otherPhones.map((p) => (
        <a
          key={p.raw}
          href={`tel:${p.raw}`}
          data-cursor="Call"
          className="link-draw whitespace-nowrap tabular-nums hover:text-ember-300"
        >
          {p.display}
        </a>
      ))}
    </p>
  );
}
