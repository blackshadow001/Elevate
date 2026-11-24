import type { MetadataRoute } from "next";

const siteUrl = "https://elevate.courses";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
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
          "/instructor/analytics",
          "/instructor/bootcamps/",
          "/instructor/courses/",
          "/instructor/live-classes/",
          "/instructor/messages",
          "/instructor/settings",
          "/instructor/students",
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
        allow: [
          "/",
          "/instructor/apply",
          "/branding/",
          "/images/",
          "/icon.svg",
        ],
        disallow: [
          "/api/",
          "/control-center/",
          "/admin/",
          "/dashboard",
          "/instructor/analytics",
          "/instructor/bootcamps/",
          "/instructor/courses/",
          "/instructor/live-classes/",
          "/instructor/messages",
          "/instructor/settings",
          "/instructor/students",
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
