import type { MetadataRoute } from "next";
import { getMarketingEnv } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = getMarketingEnv();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
