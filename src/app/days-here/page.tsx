import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import Image from "next/image";
import Experiences from "@/components/Experiences";
import DaysHero from "@/components/days/DaysHero";
import DaysSunArc from "@/components/days/DaysSunArc";
import DaysPlan from "@/components/days/DaysPlan";
import Magnetic from "@/components/ui/Magnetic";

export const metadata: Metadata = pageMeta({
  path: "/days-here",
  title: "Things to Do on Mousuni Island – Sunrise to Bonfire",
  description:
    "Sunrise over the Chinai, a low-tide beach walk, a boat to the Kakramarir Chor sandbar and a bonfire at night: a day on Mousuni Island, plus a 2-day plan.",
});

/**
 * The day, told in order: the horizon, the sun's arc across it, each moment
 * up close, two days hour by hour, and the way on.
 */
export default function DaysHerePage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "Days Here", path: "/days-here" }])} />
      <DaysHero />
      <DaysSunArc />
      <Experiences />
      <DaysPlan />

      <section className="relative overflow-hidden border-t border-bone/10 bg-ink">
        <Image src="/images/camp-bonfire.jpg" alt="" fill sizes="100vw" className="object-cover md:object-[50%_72%] opacity-30" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative mx-auto flex max-w-[100rem] flex-col gap-10 px-6 py-28 md:px-10 md:py-40 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow text-ember-500">Your day starts at Sealdah</p>
            <h2 className="font-display t-huge mt-5 text-bone">
              Come for one, <span className="italic text-ember-300">stay for two</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Magnetic strength={0.3}>
              <a
                href="/stays"
                data-cursor="Stay"
                className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
              >
                Find a stay <span aria-hidden="true">&rarr;</span>
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href="/getting-here"
                className="inline-flex items-center gap-3 rounded-full border border-bone/30 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
              >
                Getting here
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </main>
  );
}
