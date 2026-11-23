import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — Online Learning Platform`,
    short_name: brand.name,
    description: "Elevate is an online learning platform offering courses, live classes, and career paths in AI, technology, and business.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF9",
    theme_color: brand.orange,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
