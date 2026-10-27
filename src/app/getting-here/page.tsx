import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Journey from "@/components/Journey";

export const metadata: Metadata = {
  title: "Getting here",
  description: `How to reach ${site.name} on ${site.location.island}: train from Sealdah to Namkhana, road to Bagdanga Ghat, ferry across the Chinai, then a toto to the camp.`,
};

/** The page guests forward to each other before a trip. */
export default function GettingHerePage() {
  return (
    <main>
      <PageHeader
        eyebrow="Getting here"
        title="A train, a van,"
        accent="and a boat"
      >
        Roughly four and a half hours door to door from central Kolkata. The
        last leg is a ferry, so the tide matters &mdash; call{" "}
        <a href={`tel:${site.owner.phoneRaw}`} className="link-draw text-ember-300">
          {site.owner.phone}
        </a>{" "}
        and we will tell you which train to take.
      </PageHeader>
      <Journey />
    </main>
  );
}
