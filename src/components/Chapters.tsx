import Image from "next/image";
import { stays } from "@/lib/site";
import Reveal from "./ui/Reveal";

const from = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const tent = stays.find((s) => s.id === "sea-facing-tent");
const cottage = stays.find((s) => s.id === "cottage");

/**
 * The home page's table of contents: one row per page in the header, each
 * with a picture, a line of what is there, and the whole row as the link.
 * Prices are read from `stays`, so the preview can never quote an old one.
 */
const chapters = [
  {
    href: "/island",
    title: "The Island",
    line: "Four villages and one long beach, where the delta lets go of the mainland and empties into the Bay of Bengal.",
    image: "/images/g-2.jpg",
  },
  {
    href: "/stays",
    title: "Stays",
    line: `Sea-facing tents from ${tent ? from(tent.price) : ""} and cottages from ${
      cottage ? from(cottage.price) : ""
    } a night with every meal, or one price for the whole group.`,
    image: "/images/stay-tent.jpg",
  },
  {
    href: "/menu",
    title: "Menu",
    line: "The camp's own menu card, from the welcome drink to the next morning's luchi, cooked by the family.",
    image: "/images/dish-telebhaja.jpg",
  },
  {
    href: "/days-here",
    title: "Days Here",
    line: "Sunrise over the Chinai, the long walk at low tide, boats to Kakramarir Chor and a bonfire at night.",
    image: "/images/xp-sunrise.jpg",
  },
  {
    href: "/getting-here",
    title: "Getting Here",
    line: "About four and a half hours from Kolkata: a train, a van, and a short ferry across the Chinai.",
    image: "/images/g-4.jpg",
  },
];

export default function Chapters() {
  return (
    <section className="relative bg-abyss py-24 md:py-32">
      <div className="mx-auto max-w-[100rem] px-6 md:px-10">
        <Reveal as="p" mode="fade" className="t-eyebrow mb-10 text-ember-500">
          Explore the camp
        </Reveal>

        <div className="rule" />
        {chapters.map((c, i) => (
          <div key={c.href}>
            <a
              href={c.href}
              data-cursor="Open"
              className="group grid grid-cols-1 items-center gap-5 py-8 md:grid-cols-12 md:gap-8 md:py-10"
            >
              <span className="relative aspect-16/9 w-full overflow-hidden rounded-sm md:order-last md:col-span-3 md:aspect-4/3">
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                />
              </span>

              <span className="text-[0.66rem] tracking-[0.26em] text-ember-500 tabular-nums md:col-span-1">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="font-display text-[clamp(2rem,4.2vw,3.6rem)] leading-none text-bone transition-all duration-600 ease-[cubic-bezier(.16,1,.3,1)] md:col-span-4 md:group-hover:translate-x-3 md:group-hover:text-ember-300">
                {c.title}
              </span>

              <span className="max-w-[44ch] text-sm leading-relaxed text-sand md:col-span-4">
                {c.line}
                <span className="mt-3 block text-[0.7rem] uppercase tracking-[0.2em] text-ember-300">
                  Explore &rarr;
                </span>
              </span>
            </a>
            <div className="rule" />
          </div>
        ))}
      </div>
    </section>
  );
}
