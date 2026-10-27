import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import Island from "@/components/Island";
import IslandHero from "@/components/island/IslandHero";
import IslandGlance from "@/components/island/IslandGlance";
import IslandMap from "@/components/island/IslandMap";
import IslandMoments from "@/components/island/IslandMoments";
import IslandCta from "@/components/island/IslandCta";

export const metadata: Metadata = pageMeta({
  path: "/island",
  title: "Mousuni Island Travel Guide: Beaches, Villages & Map",
  description:
    "Mousuni Island, explained: Baliara beach, four villages, the Kakramarir Chor sandbar and a map of the delta, 120 km south of Kolkata in West Bengal.",
});

/**
 * The island, told in order: the horizon, the place in numbers, where it
 * sits from the air, its four villages, a day on it, and the way on.
 */
export default function IslandPage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "The Island", path: "/island" }])} />
      <IslandHero />
      <IslandGlance />
      <IslandMap />
      <Island />
      <IslandMoments />
      <IslandCta />
    </main>
  );
}
