import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Island from "@/components/Island";

export const metadata: Metadata = {
  title: "The island",
  description: `${site.location.island}, where the Muri Ganga and the Chinai meet the Bay of Bengal: four villages and one long beach, three hours from Kolkata.`,
};

export default function IslandPage() {
  return (
    <main>
      <PageHeader eyebrow="Where we are" title="Mousuni," accent="at the edge of the bay">
        Nine square kilometres of silt, salt and paddy where the Muri Ganga
        and the Chinai let go of the mainland, and empty straight into the Bay
        of Bengal.
      </PageHeader>
      <Island />
    </main>
  );
}
