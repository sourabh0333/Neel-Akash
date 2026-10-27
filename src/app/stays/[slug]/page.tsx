import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site, stays, type Stay } from "@/lib/site";
import { breadcrumbs, pageMeta } from "@/lib/meta";
import JsonLd from "@/components/JsonLd";
import StayHero from "@/components/stays/StayHero";
import StayDetails from "@/components/stays/StayDetails";
import StaysIncluded from "@/components/stays/StaysIncluded";
import StaysCta from "@/components/stays/StaysCta";

type Params = { slug: string };

/* One static page per stay; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return stays.map((s) => ({ slug: s.id }));
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Each stay's search title and snippet, written from its own data so a price
 * or a feature changed in site.ts shows up in search too.
 */
function staySeo(stay: Stay) {
  const price = inr(stay.price);
  const features = stay.features.slice(0, 3).join(", ").toLowerCase();
  if (!stay.mealsIncluded) {
    return {
      title: `${stay.name} on Mousuni Island – ${price} a Night`,
      description: `One flat price for the whole group: ${price} a night${
        stay.originalPrice ? ` (usually ${inr(stay.originalPrice)})` : ""
      } on ${site.location.island}. Friends, family or office trips; book by phone or WhatsApp.`,
    };
  }
  return {
    title: `${stay.name}, Mousuni Island – ${price} with All Meals`,
    description: `${stay.kicker.split("—")[1]?.trim() ?? stay.name}: ${price} per person a night with all meals, ${features}. Sleeps ${stay.capacity.replace(" guests", "")} on ${site.location.island}.`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = stays.find((s) => s.id === slug);
  if (!stay) return {};
  return pageMeta({ path: `/stays/${stay.id}`, ...staySeo(stay) });
}

/**
 * One stay, told in order: the horizon over its own photograph, what you
 * get beside the booking card, the day's meals (when they come with it), the
 * other stays, and the proprietor's number.
 */
export default async function StayPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stay = stays.find((s) => s.id === slug);
  if (!stay) notFound();

  return (
    <main>
      <JsonLd
        data={breadcrumbs([
          { name: "Stays", path: "/stays" },
          { name: stay.name, path: `/stays/${stay.id}` },
        ])}
      />
      <StayHero stay={stay} />
      <StayDetails stay={stay} />
      {stay.mealsIncluded && <StaysIncluded />}
      <div className="bg-abyss pt-24 md:pt-32">
        <StaysCta />
      </div>
    </main>
  );
}
