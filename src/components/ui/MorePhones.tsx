import { site } from "@/lib/site";

/** The numbers after the main one, for showing beside it. */
export const otherPhones = site.owner.phones.slice(1);

/**
 * The camp's other numbers as tap-to-call links, set under or beside a
 * main "Call" button or number: "Also +91 92391 81660   +91 80016 96332".
 * Spaced rather than dotted, so a wrap never starts a line with a separator.
 * A number that is also on WhatsApp gets a small WhatsApp link beside it.
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
        <span key={p.raw} className="inline-flex items-center gap-2 whitespace-nowrap">
          <a href={`tel:${p.raw}`} data-cursor="Call" className="link-draw tabular-nums hover:text-ember-300">
            {p.display}
          </a>
          {p.whatsapp && (
            <a
              href={`https://wa.me/${p.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${p.display}`}
              className="rounded-full border border-[#25d366]/40 px-2 py-0.5 text-[0.56rem] font-semibold uppercase tracking-[0.14em] text-[#7ee2a8] transition-colors hover:border-[#25d366] hover:bg-[#25d366]/15"
            >
              WhatsApp
            </a>
          )}
        </span>
      ))}
    </p>
  );
}
