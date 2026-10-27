import type { Metadata } from "next";
import { site } from "./site";

/**
 * Every page's search and share metadata, built the same way.
 *
 * - `title` is the whole <title>: search phrase first, the promise after,
 *   about 45–60 characters so Google shows it uncut. It is absolute — it
 *   doesn't get " · Penguin Beach Camp" appended, because Google shows the
 *   site name above each result anyway and the room is better spent on
 *   what people search for.
 * - `description` is the snippet: 140–160 characters, the facts people
 *   compare camps on (price per head with food, distance, how to book).
 * - The same title and description are given to Open Graph and Twitter, so
 *   a link shared on WhatsApp or Facebook previews this page, not the home
 *   page; the canonical makes the page's one address explicit.
 * - The share card image is named explicitly. A page that sets its own
 *   `openGraph` replaces the layout's whole object, so without this every
 *   page but the home page would share with no picture at all.
 */

/** The 1200×630 share card drawn by src/app/opengraph-image.tsx. */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
};

export function pageMeta({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      url: path,
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SHARE_IMAGE] },
  };
}

/** BreadcrumbList structured data for a page below the home page. */
export function breadcrumbs(trail: { name: string; path: string }[]) {
  const all = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: new URL(c.path, site.url).toString(),
    })),
  };
}
