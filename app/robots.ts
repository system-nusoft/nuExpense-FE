import type { MetadataRoute } from "next";

const SITE_URL = "https://zingg.nusoft.co";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/expenses",
        "/categories",
        "/settings",
        "/scan",
        "/onboarding",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
