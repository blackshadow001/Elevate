import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";
import { courseService } from "@/services/courseService";
import { listCatalogCategories } from "@/server/catalogCategories";
import type { Metadata } from "next";

export const instant = false;

export const metadata: Metadata = {
  title: "All Courses — Elevate",
  description: "Browse published online courses and upcoming topics across AI, technology, business, marketing, and more on Elevate.",
  alternates: { canonical: "https://elevate.courses/courses" },
  openGraph: {
    title: "All Courses — Elevate",
    description: "Browse published online courses and upcoming topics across AI, technology, business, marketing, and more on Elevate.",
    url: "https://elevate.courses/courses",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Courses Catalog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Courses — Elevate",
    description: "Browse published online courses and upcoming topics across AI, technology, business, marketing, and more on Elevate.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

export default async function CoursesPage() {
  const courses = await courseService.getAllCourses();
  const categories = listCatalogCategories();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Courses — Elevate",
    description: "Browse published online courses across AI, software development, data science, and business.",
    url: "https://elevate.courses/courses",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: courses.slice(0, 30).map((course, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Course",
          name: course.title,
          description: course.subtitle || course.description,
          url: `https://elevate.courses/courses/${encodeURIComponent(course.slug)}`,
          provider: {
            "@type": "Organization",
            name: "Elevate"
          }
        }
      }))
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Suspense fallback={<div className="py-20 text-center font-medium text-[#64748B]">Loading courses...</div>}>
          <CoursesExplorer initialCourses={courses} initialCategories={categories} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
