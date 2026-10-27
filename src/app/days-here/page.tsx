import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Experiences from "@/components/Experiences";

export const metadata: Metadata = {
  title: "Days here",
  description: `A day at ${site.name}: sunrise over the Chinai, the long walk at low tide, boats to Kakramarir Chor and a bonfire at night.`,
};

export default function DaysHerePage() {
  return (
    <main>
      <PageHeader eyebrow="Days here" title="A day" accent="on the island">
        Sunrise over the Chinai, the long walk at low tide, boats to
        Kakramarir Chor and a bonfire at night: this is how the hours go at{" "}
        {site.name}.
      </PageHeader>
      <Experiences />
    </main>
  );
}
