import type { MetadataRoute } from "next";

const siteUrl = "https://elevate.courses";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/instructor/apply"],
      disallow: ["/api/", "/control-center/", "/dashboard", "/instructor/", "/learn/", "/login", "/signup", "/orders/", "/profile", "/wishlist"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
