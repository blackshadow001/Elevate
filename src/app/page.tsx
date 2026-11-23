import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { CareerPaths } from "@/components/home/CareerPaths";
import { Categories } from "@/components/home/Categories";
import { PopularCourses } from "@/components/home/PopularCourses";
import { CTA } from "@/components/home/CTA";
import { courseService } from "@/services/courseService";
import { listCatalogCategories } from "@/server/catalogCategories";
import type { Metadata } from "next";

export const instant = false;

const siteUrl = "https://elevate.courses";
const description = "Explore practical online courses in AI, technology, business, marketing, and more. Learn from experts on Elevate.";

export const metadata: Metadata = {
  title: "Elevate Courses | Online Learning in AI, Technology and Business",
  description,
  alternates: { canonical: siteUrl },
  openGraph: { title: "Elevate Courses | Online Learning", description, url: siteUrl },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Elevate",
    url: siteUrl,
    logo: `${siteUrl}/branding/elevate-orange-ribbon-logo.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Elevate",
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#organization` },
  },
];

export default async function HomePage() {
  const courses = await courseService.getAllCourses();
  const categories = listCatalogCategories();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Navbar />
      <main className="flex-1">
        <Hero courses={courses} />
        <Stats courses={courses} />
        <Categories courses={courses} categories={categories} />
        <PopularCourses courses={courses} />
        <CareerPaths courses={courses} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
