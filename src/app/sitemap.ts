import type { MetadataRoute } from "next";
import { LEARNING_ROADMAPS } from "@/lib/learningRoadmaps";
import { courseService } from "@/services/courseService";

const siteUrl = "https://elevate.courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await courseService.getAllCourses();
  const pages = ["", "/courses", "/career-paths", "/blog", "/about", "/faq", "/contact", "/instructor/apply"];

  return [
    ...pages.map((path) => ({ url: `${siteUrl}${path}` })),
    ...LEARNING_ROADMAPS.map((roadmap) => ({ url: `${siteUrl}/career-paths/${roadmap.slug}` })),
    ...courses.map((course) => ({ url: `${siteUrl}/courses/${encodeURIComponent(course.slug)}` })),
  ];
}
