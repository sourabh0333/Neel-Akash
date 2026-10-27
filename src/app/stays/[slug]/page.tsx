import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { site, stays } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import PriceTag from "@/components/ui/PriceTag";
import Reveal from "@/components/ui/Reveal";

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
    openGraph: { title: `${stay.name} · ${site.name}`, description: stay.blurb },
  };
}

export default async function StayPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const stay = stays.find((s) => s.id === slug);
  if (!stay) notFound();

  const others = stays.filter((s) => s.id !== stay.id);

  return (
    <main>
      <PageHeader
        eyebrow={stay.kicker}
        title={stay.name}
        back={{ href: "/#stays", label: "All stays" }}
      >
        {stay.blurb}
      </PageHeader>

      <section className="bg-abyss pb-24 md:pb-32">
        <div className="mx-auto max-w-[100rem] px-6 md:px-10">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-sm md:aspect-21/9">
            <Image
              src={stay.image}
              alt={stay.name}
              fill
              priority
              sizes="(max-width: 1600px) 100vw, 1600px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-abyss/40 to-transparent" />
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* ── Details ── */}
            <div className="lg:col-span-7">
              <Reveal as="h2" className="font-display text-3xl text-bone md:text-4xl">
                What you get
              </Reveal>
              <ul className="mt-8 grid gap-x-10 sm:grid-cols-2">
                {stay.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 border-b border-bone/10 py-4 text-sand"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" />
                    {f}
                  </li>
                ))}
              </ul>

              {stay.mealsIncluded && (
                <div className="mt-12">
                  <h3 className="font-display text-2xl text-bone">All meals included</h3>
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-sand">
                    A welcome drink when you arrive, then lunch, evening
                    snacks, dinner and the next morning&rsquo;s breakfast,
                    cooked by the family.
                  </p>
                  <a
                    href="/menu"
                    className="link-draw mt-4 inline-block text-sm text-ember-300"
                  >
                    See the full menu &rarr;
                  </a>
                </div>
              )}

              <div className="mt-12">
                <h3 className="font-display text-2xl text-bone">Getting here</h3>
                <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-sand">
                  The Namkhana Local from Sealdah, an auto to Bagdanga Ghat, a
                  short ferry across the Chinai and a toto to the camp. Tell
                  us your train and we will time the boat.
                </p>
                <a
                  href="/getting-here"
                  className="link-draw mt-4 inline-block text-sm text-ember-300"
                >
                  The route, step by step &rarr;
                </a>
              </div>
            </div>

            {/* ── Booking card ── */}
            <aside className="lg:col-span-5">
              <div className="sticky top-28 rounded-sm border border-bone/12 bg-ink p-8">
                <PriceTag stay={stay} size="lg" />
                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={`/?stay=${stay.id}#contact`}
                    data-cursor="Book"
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-bone px-8 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-abyss transition-colors duration-300 hover:bg-ember-300"
                  >
                    Book this stay <span aria-hidden="true">&rarr;</span>
                  </a>
                  <a
                    href={`tel:${site.owner.phoneRaw}`}
                    className="inline-flex items-center justify-center rounded-full border border-bone/25 px-8 py-4 text-[0.76rem] font-semibold uppercase tracking-[0.18em] text-bone transition-colors duration-300 hover:border-ember-400"
                  >
                    Call {site.owner.phone}
                  </a>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-sand-dim">
                  Booking is a WhatsApp message to {site.owner.name} — no
                  payment online, nothing is sent until you press send.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── The other stays ── */}
      <section className="border-t border-bone/10 bg-ink py-20 md:py-28">
        <div className="mx-auto max-w-[100rem] px-6 md:px-10">
          <p className="t-eyebrow text-ember-500">Other stays</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {others.map((o) => (
              <a
                key={o.id}
                href={`/stays/${o.id}`}
                data-cursor="View"
                className="group relative block overflow-hidden rounded-sm"
              >
                <div className="relative aspect-16/9">
                  <Image
                    src={o.image}
                    alt={o.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-abyss/90 via-abyss/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                  <span className="font-display text-3xl text-bone">{o.name}</span>
                  <span className="font-display text-2xl text-ember-300">
                    &#8377;{o.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
