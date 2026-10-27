import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";

/**
 * /robots.txt — the whole site is open to crawlers, and the sitemap's
 * address is given here so every search engine can find it, not only the
 * ones it is submitted to by hand. (Google retired its sitemap "ping" URL in
 * 2023; robots.txt and Search Console are the ways in now.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absolute("/sitemap.xml"),
  };
}
