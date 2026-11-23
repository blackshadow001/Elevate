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
const description = "Elevate is an online learning platform offering courses, live classes, and career paths in AI, technology, and business. Learn from experts and elevate your future.";

export const metadata: Metadata = {
  title: "Elevate — Online Learning Platform | Courses & Career Paths",
  description,
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Elevate — Online Learning Platform",
    description,
    url: siteUrl,
    siteName: "Elevate",
    images: [{ url: `${siteUrl}/branding/elevate-orange-ribbon-logo.png`, width: 1119, height: 337, alt: "Elevate — Online Learning Platform" }],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Elevate",
    alternateName: [
      "Elevate Courses",
      "Elevate Learning",
      "Elevate LMS",
      "Elevate Online Learning Platform",
    ],
    url: siteUrl,
    description: "Elevate is an online learning platform offering courses, live classes, and career paths in AI, technology, and business.",
    publisher: { "@id": `${siteUrl}/#organization` },
    inLanguage: ["en", "ta"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/courses?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "Organization"],
    "@id": `${siteUrl}/#organization`,
    name: "Elevate",
    legalName: "Elevate Courses",
    alternateName: ["Elevate Learning", "Elevate LMS", "Elevate Platform"],
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/branding/elevate-orange-ribbon-logo.png`,
      width: 1119,
      height: 337,
    },
    image: `${siteUrl}/branding/elevate-orange-ribbon-logo.png`,
    description: "Elevate is an online learning platform offering courses, live learning, and career paths in AI, technology, and business.",
    slogan: "Learn from Experts. Elevate Your Future.",
    sameAs: [
      "https://twitter.com/elevatecourses",
      "https://www.youtube.com/@elevatecourses",
      "https://github.com/blackshadow001/Elevate",
    ],
    knowsAbout: [
      "Online Learning",
      "Artificial Intelligence",
      "Software Development",
      "Digital Marketing",
      "Business & Entrepreneurship",
      "Tamil Tech Education",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/#sitelinks`,
    name: "Elevate Platform Navigation",
    itemListElement: [
      {
        "@type": "SiteNavigationElement",
        position: 1,
        name: "Courses",
        description: "Browse online courses in AI, technology, and business on Elevate.",
        url: `${siteUrl}/courses`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 2,
        name: "Career Paths",
        description: "Curated learning roadmaps from foundational to advanced skills.",
        url: `${siteUrl}/career-paths`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 3,
        name: "Live Learning",
        description: "Interactive live classes and workshops with instructors.",
        url: `${siteUrl}/live`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 4,
        name: "About Elevate",
        description: "Learn about Elevate's mission and educational approach.",
        url: `${siteUrl}/about`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 5,
        name: "FAQ",
        description: "Answers to frequently asked questions about Elevate.",
        url: `${siteUrl}/faq`,
      },
      {
        "@type": "SiteNavigationElement",
        position: 6,
        name: "Contact",
        description: "Get in touch with the Elevate team.",
        url: `${siteUrl}/contact`,
      },
    ],
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
