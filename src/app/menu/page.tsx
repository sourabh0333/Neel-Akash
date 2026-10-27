import type { Metadata } from "next";
import Image from "next/image";
import { meals, site, stays } from "@/lib/site";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Menu",
  description: `The full meal plan at ${site.name}: welcome drink, lunch, evening snacks, dinner and next morning's breakfast.`,
};

/**
 * The whole meal plan on one page, to read before a trip or forward to
 * whoever is coming. Same data as the home page's Kitchen section, laid out
 * flat, with each course's Bengali as it is written on the menu card.
 */
/** "the Sea-Facing Tent and the Cottage", from whichever stays include meals. */
const withMeals = stays
  .filter((s) => s.mealsIncluded)
  .map((s) => `the ${s.name}`)
  .join(" and ");

export default function MenuPage() {
  return (
    <main>
      <PageHeader eyebrow="The kitchen · রান্নাঘর" title="The menu">
        Every meal below is included with {withMeals}, cooked by the family on
        the day. This is the camp&rsquo;s own menu
        card, in the order it is served.
      </PageHeader>

      <section className="bg-abyss pb-24 md:pb-32">
        <div className="mx-auto max-w-[100rem] px-6 md:px-10">
          {meals.map((meal) => (
            <div
              key={meal.label}
              className="grid gap-6 border-t border-bone/12 py-10 md:grid-cols-12 md:gap-10 md:py-14"
            >
              <div className="md:col-span-3">
                <p className="font-display text-3xl text-ember-400">{meal.time}</p>
                <p className="mt-2 text-[0.66rem] uppercase tracking-[0.26em] text-sand-dim">
                  {meal.label}
                </p>
                <p className="font-bn mt-1 text-base text-neel-300">{meal.bn}</p>
              </div>

              <ul className="grid gap-6 md:col-span-9">
                {meal.dishes.map((d) => (
                  <li key={d.name} className="flex items-start gap-5">
                    <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm md:h-24 md:w-24">
                      <Image
                        src={d.image}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-2xl leading-tight text-bone md:text-3xl">
                        {d.name}
                      </span>
                      <span className="font-bn mt-1 block text-base text-ember-300">
                        {d.bn}
                      </span>
                      <span className="mt-1 block max-w-[60ch] text-sm leading-relaxed text-sand">
                        {d.note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col items-start gap-4 border-t border-bone/12 pt-10 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[52ch] text-sm text-sand-dim">
              Dietary needs or a celebration to plan? Tell {site.owner.name}{" "}
              when you book.
            </p>
            <a
              href="/#contact"
              data-cursor="Book"
              className="inline-flex items-center gap-3 rounded-full border border-bone/25 px-8 py-4 text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400"
            >
              Book a stay <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
