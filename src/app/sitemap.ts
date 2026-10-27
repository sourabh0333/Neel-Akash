import type { MetadataRoute } from "next";
import { absolute, lastModified, routes } from "@/lib/seo";

/**
 * /sitemap.xml — every page on the site, built at deploy time.
 *
 * Each entry carries what Google actually reads: the canonical, absolute
 * address; `lastmod` from the last commit that changed the page (left out
 * when unknown, never faked); and the photographs on the page as an image
 * sitemap, of which Google uses only <image:loc>. `priority` and
 * `changefreq` are deliberately absent — Google and Bing ignore both.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({
    url: absolute(r.path),
    lastModified: lastModified(r.sources),
    images: [...new Set(r.images)].map(absolute),
  }));
}
