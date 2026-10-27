import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import Image from "next/image";
import { site } from "@/lib/site";
import Journey from "@/components/Journey";
import Reveal from "@/components/ui/Reveal";
import Magnetic from "@/components/ui/Magnetic";
import GettingHero from "@/components/getting/GettingHero";
import GettingTickets from "@/components/getting/GettingTickets";

export const metadata: Metadata = pageMeta({
  path: "/getting-here",
  title: "How to Reach Mousuni Island from Kolkata: Train & Ferry",
  description:
    "Sealdah to Namkhana by local train, a van to Bagdanga Ghat, a 10-minute ferry and a toto to the camp: about 4 hours from Kolkata, step by step.",
});

/**
 * The page guests forward to each other before a trip, told in order: the
 * horizon, a ticket per leg, the live journey board, and who to call.
 */
export default function GettingHerePage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "Getting Here", path: "/getting-here" }])} />
      <GettingHero />
      <GettingTickets />

      <div className="bg-abyss pt-28 md:pt-40">
        <div className="mx-auto mb-16 grid max-w-[100rem] gap-6 px-6 md:mb-20 md:px-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal as="p" mode="fade" className="t-eyebrow text-ember-500">
              The journey board
            </Reveal>
            <Reveal as="h2" className="font-display t-huge mt-5 text-bone">
              Watch the <span className="italic text-neel-300">whole trip</span>
            </Reveal>
          </div>
          <Reveal
            as="p"
            mode="fade"
            delay={0.1}
            className="max-w-[40ch] text-sm leading-relaxed text-sand lg:col-span-4 lg:col-start-9"
          >
            The route plays on the real delta. Point at a step to hold the
            map on that leg.
          </Reveal>
        </div>
      </div>
      <Journey standalone />

      <section className="relative overflow-hidden border-t border-bone/10 bg-ink">
        <Image src="/images/g-2.jpg" alt="" fill sizes="100vw" className="object-cover opacity-30" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/60 to-ink/30" />
        <div className="relative mx-auto flex max-w-[100rem] flex-col gap-10 px-6 py-28 md:px-10 md:py-40 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="t-eyebrow text-ember-500">Before you set off</p>
            <h2 className="font-display t-huge mt-5 text-bone">
              Tell us <span className="italic text-ember-300">your train</span>
            </h2>
            <p className="mt-6 max-w-[46ch] text-sand">
              {site.owner.name} will time the boat and have someone at the
              ghat.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Magnetic strength={0.3}>
              <a
                href={`tel:${site.owner.phoneRaw}`}
                data-cursor="Call"
                className="inline-flex items-center gap-3 rounded-full bg-ember-400 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
              >
                Call {site.owner.phone}
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={`https://wa.me/${site.owner.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-bone/30 px-8 py-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400 hover:text-ember-300"
              >
                WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </Magnetic>
          </div>
        </div>
      </section>
    </main>
  );
}
