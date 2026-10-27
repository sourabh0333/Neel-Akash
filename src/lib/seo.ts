import { execFileSync } from "node:child_process";
import { experiences, gallery, meals, photos, site, stays } from "./site";

/**
 * What search engines are told about each page: its address, where its
 * content comes from (to date it honestly) and the photographs on it.
 *
 * Google reads only `lastmod` from a sitemap — `priority` and `changefreq`
 * are ignored — and only trusts it while it stays accurate. So the date here
 * is the last commit that touched the files a page is built from, never
 * "today". When git history isn't available (a shallow clone, say), the
 * date is left out rather than guessed: no lastmod is better than a wrong one.
 */

type Route = {
  path: string;
  /** Files and folders this page is built from, relative to the repo root. */
  sources: string[];
  /** Image paths under /public shown on the page. */
  images: string[];
};

const DATA = "src/lib/site.ts";
const dishImages = meals.flatMap((m) => m.dishes.map((d) => d.image));
const galleryImages = gallery.map((g) => g.src);
const stayImages = stays.map((s) => s.image);
const dayImages = experiences.map((x) => x.image);

export const routes: Route[] = [
  {
    path: "/",
    sources: ["src/app/page.tsx", "src/components", DATA],
    images: ["/images/hero.jpg", ...galleryImages, ...stayImages, ...dayImages, ...dishImages],
  },
  {
    path: "/island",
    sources: ["src/app/island", "src/components/island", "src/components/Island.tsx", DATA],
    images: ["/images/g-1.jpg", ...galleryImages],
  },
  {
    path: "/stays",
    sources: ["src/app/stays/page.tsx", "src/components/stays", DATA],
    images: stayImages,
  },
  ...stays.map((s) => ({
    path: `/stays/${s.id}`,
    sources: ["src/app/stays/[slug]", "src/components/stays", DATA],
    images: [s.image, ...stayImages.filter((i) => i !== s.image)],
  })),
  {
    path: "/menu",
    sources: ["src/app/menu", "src/components/menu", "src/components/Kitchen.tsx", DATA],
    images: dishImages,
  },
  {
    path: "/gallery",
    sources: ["src/app/gallery", "src/components/gallery", DATA],
    images: photos.map((p) => p.src),
  },
  {
    path: "/days-here",
    sources: ["src/app/days-here", "src/components/days", "src/components/Experiences.tsx", DATA],
    images: dayImages,
  },
  {
    path: "/getting-here",
    sources: [
      "src/app/getting-here",
      "src/components/getting",
      "src/components/Journey.tsx",
      "src/components/route",
      DATA,
    ],
    images: ["/images/g-3.jpg", "/images/g-2.jpg"],
  },
  {
    path: "/contact",
    sources: [
      "src/app/contact",
      "src/components/contact",
      "src/components/Contact.tsx",
      "src/components/Testimonials.tsx",
      DATA,
    ],
    images: ["/images/xp-bonfire.jpg"],
  },
];

/** An absolute URL on the site — sitemaps and canonicals must never be relative. */
export const absolute = (path: string) => new URL(path, site.url).toString();

let shallow: boolean | undefined;

/** The last commit that touched any of `sources`, or undefined if unknown. */
export function lastModified(sources: string[]): Date | undefined {
  try {
    shallow ??=
      execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).trim() === "true";
    if (shallow) return undefined;
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...sources], {
      encoding: "utf8",
    }).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}
