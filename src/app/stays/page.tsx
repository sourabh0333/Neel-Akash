import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import Stays from "@/components/Stays";

export const metadata: Metadata = {
  title: "Stays",
  description: `Sea-facing tents, cottages and a group special at ${site.name}, ${site.location.island}. Prices per night with all meals.`,
};

export default function StaysPage() {
  return (
    <main>
      <PageHeader eyebrow="Where you sleep" title="Twelve doors," accent="all facing water">
        Tent and cottage tariffs are per person, per night, and include a
        welcome drink, lunch, evening snacks, dinner and the next
        morning&rsquo;s breakfast. The group special is one price for the
        whole group.
      </PageHeader>
      <Stays />
    </main>
  );
}
