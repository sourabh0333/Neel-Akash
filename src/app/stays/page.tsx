import type { Metadata } from "next";
import { site } from "@/lib/site";
import StaysHero from "@/components/stays/StaysHero";
import StaysShowcase from "@/components/stays/StaysShowcase";
import StaysIncluded from "@/components/stays/StaysIncluded";
import StaysCompare from "@/components/stays/StaysCompare";
import StaysCta from "@/components/stays/StaysCta";

export const metadata: Metadata = {
  title: "Stays",
  description: `Sea-facing tents, cottages and a group special at ${site.name}, ${site.location.island}. Prices per night with all meals.`,
};

/**
 * The stays, told in order: the horizon, each stay in full, what a night
 * includes, the three side by side, and how to book.
 */
export default function StaysPage() {
  return (
    <main>
      <StaysHero />
      <StaysShowcase />
      <StaysIncluded />
      <StaysCompare />
      <StaysCta />
    </main>
  );
}
