import type { Metadata } from "next";
import { site } from "@/lib/site";
import Island from "@/components/Island";
import IslandHero from "@/components/island/IslandHero";
import IslandGlance from "@/components/island/IslandGlance";
import IslandMap from "@/components/island/IslandMap";
import IslandMoments from "@/components/island/IslandMoments";
import IslandCta from "@/components/island/IslandCta";

export const metadata: Metadata = {
  title: "The island",
  description: `${site.location.island}, where the Muri Ganga and the Chinai meet the Bay of Bengal: four villages and one long beach, three hours from Kolkata.`,
  alternates: { canonical: "/island" },
};

/**
 * The island, told in order: the horizon, the place in numbers, where it
 * sits from the air, its four villages, a day on it, and the way on.
 */
export default function IslandPage() {
  return (
    <main>
      <IslandHero />
      <IslandGlance />
      <IslandMap />
      <Island />
      <IslandMoments />
      <IslandCta />
    </main>
  );
}
