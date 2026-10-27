import type { Metadata } from "next";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import StaysHero from "@/components/stays/StaysHero";
import StaysShowcase from "@/components/stays/StaysShowcase";
import StaysIncluded from "@/components/stays/StaysIncluded";
import StaysCompare from "@/components/stays/StaysCompare";
import StaysCta from "@/components/stays/StaysCta";

export const metadata: Metadata = pageMeta({
  path: "/stays",
  title: "Mousuni Island Tent & Cottage Booking – From ₹900",
  description:
    "Sea-facing tents at ₹900 and cottages at ₹1,200 per person a night with all meals, plus a ₹3,000 group special on Mousuni Island. Book on WhatsApp.",
});

/**
 * The stays, told in order: the horizon, each stay in full, what a night
 * includes, the three side by side, and how to book.
 */
export default function StaysPage() {
  return (
    <main>
      <JsonLd data={breadcrumbs([{ name: "Stays", path: "/stays" }])} />
      <StaysHero />
      <StaysShowcase />
      <StaysIncluded />
      <StaysCompare />
      <StaysCta />
    </main>
  );
}
