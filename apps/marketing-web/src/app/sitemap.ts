import type { MetadataRoute } from "next";
import { getMarketingEnv } from "@/config/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = getMarketingEnv();

  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-11-19T00:00:00.000Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
