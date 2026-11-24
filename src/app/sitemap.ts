import type { MetadataRoute } from "next";
import { LEARNING_ROADMAPS } from "@/lib/learningRoadmaps";
import { courseService } from "@/services/courseService";

const siteUrl = "https://elevate.courses";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await courseService.getAllCourses();
  const now = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/career-paths`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/live`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/practice`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/practice/codekata`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/practice/webkata`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/practice/sqlkata`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/practice/fixthecode`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/practice/ide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/instructor/apply`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const roadmapRoutes: MetadataRoute.Sitemap = LEARNING_ROADMAPS.map((roadmap) => ({
    url: `${siteUrl}/career-paths/${roadmap.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${siteUrl}/courses/${encodeURIComponent(course.slug)}`,
    lastModified: new Date(course.updatedAt || now),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  return [...coreRoutes, ...roadmapRoutes, ...courseRoutes];
}
