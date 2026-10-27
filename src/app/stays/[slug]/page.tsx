import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site, stays } from "@/lib/site";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stay = stays.find((s) => s.id === slug);
  if (!stay) return {};
  return {
    title: stay.name,
    description: stay.blurb,
    alternates: { canonical: `/stays/${stay.id}` },
    openGraph: { title: `${stay.name} · ${site.name}`, description: stay.blurb },
  };
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
      <StayHero stay={stay} />
      <StayDetails stay={stay} />
      {stay.mealsIncluded && <StaysIncluded />}
      <div className="bg-abyss pt-24 md:pt-32">
        <StaysCta />
      </div>
    </main>
  );
}
