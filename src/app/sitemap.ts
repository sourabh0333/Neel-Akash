import type { MetadataRoute } from "next";
import { pages, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    ...pages.map((p) => ({
      url: `${site.url}${p.href}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
