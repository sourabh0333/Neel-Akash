import type { Stay } from "@/lib/site";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * A stay's price: the regular price struck through with an "off" tag when
 * there is a discount, the price itself, then what it covers and for whom.
 * Shared by the home page's Stays list and each stay's own page.
 */
export default function PriceTag({
  stay,
  align = "start",
  size = "md",
}: {
  stay: Stay;
  align?: "start" | "end";
  size?: "md" | "lg";
}) {
  const end = align === "end";
  return (
    <div className={end ? "md:text-right" : ""}>
      {stay.originalPrice && (
        <div className={`mb-1.5 flex items-center gap-2.5 ${end ? "md:justify-end" : ""}`}>
          <span className="rounded-full bg-ember-500/15 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ember-300">
            {inr(stay.originalPrice - stay.price)} off
          </span>
          <s className="font-display text-lg text-sand-dim decoration-ember-400/70">
            <span className="sr-only">Regular price </span>
            {inr(stay.originalPrice)}
          </s>
        </div>
      )}
      <p
        className={`font-display text-bone ${
          size === "lg" ? "text-5xl" : "text-2xl md:text-3xl"
        }`}
      >
        {inr(stay.price)}
      </p>
      <p className="mt-1 text-[0.64rem] uppercase tracking-[0.14em] text-sand-dim">
        {stay.priceNote}
      </p>
      <p className="mt-1 text-[0.64rem] uppercase tracking-[0.14em] text-sand-dim">
        {stay.capacity}
      </p>
    </div>
  );
}
