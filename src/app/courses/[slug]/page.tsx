import { courseService } from "@/services/courseService";
import type { Metadata } from "next";

export const instant = false;
import { CourseDetailRoute } from "@/components/courses/CourseDetailRoute";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);
  if (!course) return { title: "Course not found — Elevate", robots: { index: false } };
  const description = (course.subtitle || course.description || "").slice(0, 160);
  const canonicalUrl = `https://elevate.courses/courses/${encodeURIComponent(course.slug)}`;
  const imageUrl = course.image
    ? (course.image.startsWith("http") ? course.image : `https://elevate.courses${course.image}`)
    : "https://elevate.courses/branding/elevate-orange-ribbon-logo.png";

  return {
    title: `${course.title} — Elevate`,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${course.title} — Elevate`,
      description,
      url: canonicalUrl,
      siteName: "Elevate",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} — Elevate`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await courseService.getCourseBySlug(slug);
  const relatedCourses = course ? (await courseService.getAllCourses())
    .filter((item) => item.id !== course.id && item.category === course.category)
    .sort((a, b) => Number(Boolean(course.subcategory) && b.subcategory === course.subcategory) - Number(Boolean(course.subcategory) && a.subcategory === course.subcategory))
    .slice(0, 3) : [];

  const canonicalUrl = course ? `https://elevate.courses/courses/${encodeURIComponent(course.slug)}` : "https://elevate.courses/courses";
  const imageUrl = course?.image
    ? (course.image.startsWith("http") ? course.image : `https://elevate.courses${course.image}`)
    : "https://elevate.courses/branding/elevate-orange-ribbon-logo.png";

  const structuredData = course ? [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "@id": `${canonicalUrl}#course`,
      name: course.title,
      description: course.subtitle || course.description,
      provider: {
        "@type": "EducationalOrganization",
        name: "Elevate",
        sameAs: "https://elevate.courses",
        logo: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png"
      },
      image: imageUrl,
      inLanguage: course.language === "Tamil" ? "ta" : (course.language === "Hindi" ? "hi" : "en"),
      educationalLevel: course.level || "Beginner",
      offers: {
        "@type": "Offer",
        price: course.price || 0,
        priceCurrency: "INR",
        category: (course.price === 0 || course.isFree) ? "Free" : "Paid",
        availability: "https://schema.org/InStock",
        url: canonicalUrl
      },
      author: {
        "@type": "Person",
        name: course.instructor?.name || "Elevate Senior Instructor"
      },
      aggregateRating: course.rating ? {
        "@type": "AggregateRating",
        ratingValue: course.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: Math.max(1, (course as { ratingCount?: number }).ratingCount || 15)
      } : undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://elevate.courses"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Courses",
          item: "https://elevate.courses/courses"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: course.category,
          item: `https://elevate.courses/courses?category=${encodeURIComponent(course.category)}`
        },
        {
          "@type": "ListItem",
          position: 4,
          name: course.title,
          item: canonicalUrl
        }
      ]
    }
  ] : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <CourseDetailRoute slug={slug} initialCourse={course} relatedCourses={relatedCourses} />
    </>
  );
}
