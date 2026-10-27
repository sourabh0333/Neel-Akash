import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import Kitchen from "@/components/Kitchen";
import Reveal from "@/components/ui/Reveal";
import MenuHero from "@/components/menu/MenuHero";
import MenuPlates from "@/components/menu/MenuPlates";
import MenuCta from "@/components/menu/MenuCta";

export const metadata: Metadata = pageMeta({
  path: "/menu",
  title: "Mousuni Island Camp Food: Bengali Fish & Meals Menu",
  description:
    "Pomfret and prawns, rice, dal and sabji, chicken at dinner and luchi for breakfast: every meal at Penguin Beach Camp, included with tents and cottages.",
});

/**
 * The menu, told in order: the horizon, every plate on one rail, the day
 * course by course, and the way on.
 */
export default function MenuPage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "Menu", path: "/menu" }])} />
      <MenuHero />
      <MenuPlates />

      <div className="bg-abyss pt-28 md:pt-40">
        <div className="mx-auto mb-16 grid max-w-[100rem] gap-6 px-6 md:mb-20 md:px-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              The running order
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Course <span className="italic text-neel-300">by course</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            From the welcome drink to the next morning&rsquo;s breakfast,
            with what is on each plate.
          </Reveal>
        </div>
      </div>
      <Kitchen standalone />

      <MenuCta />
    </main>
  );
}
