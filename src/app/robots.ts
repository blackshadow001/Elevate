import type { MetadataRoute } from "next";

const siteUrl = "https://elevate.courses";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/courses",
          "/career-paths",
          "/live",
          "/practice",
          "/about",
          "/faq",
          "/contact",
          "/blog",
          "/instructor/apply",
          "/branding/",
          "/images/",
          "/home/",
          "/icon.svg",
        ],
        disallow: [
          "/api/",
          "/control-center/",
          "/admin/",
          "/dashboard",
          "/instructor/",
          "/learn/",
          "/login",
          "/signup",
          "/orders/",
          "/profile",
          "/wishlist",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/api/",
          "/control-center/",
          "/admin/",
          "/dashboard",
          "/instructor/",
          "/learn/",
          "/login",
          "/signup",
          "/orders/",
          "/profile",
          "/wishlist",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
