import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/lib/site";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryZoom from "@/components/gallery/GalleryZoom";
import GalleryWall from "@/components/gallery/GalleryWall";
import Magnetic from "@/components/ui/Magnetic";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photographs of the beach, the tide, the stays and the days at ${site.name}, ${site.location.island}.`,
  alternates: { canonical: "/gallery" },
};

/**
 * The gallery, told in order: the horizon, a field of frames you scroll
 * into, every photograph on one filterable wall, and the way on.
 */
export default function GalleryPage() {
  return (
    <main>
      <GalleryHero />
      <GalleryZoom />
      <GalleryWall />

      <section className="relative overflow-hidden border-t border-bone/10 bg-ink">
        <Image src="/images/g-6.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative mx-auto flex max-w-[100rem] flex-col gap-10 px-6 py-28 md:px-10 md:py-40 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow text-ember-500">Better in person</p>
            <h2 className="font-display t-huge mt-5 text-bone">
              Come and take <span className="italic text-ember-300">your own</span>
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
