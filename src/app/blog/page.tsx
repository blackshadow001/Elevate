import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogExplorer } from "@/components/blog/BlogExplorer";
import { mockBlogPosts } from "@/data/blogPosts";
import { BookOpen, Code2, Compass, Layers } from "lucide-react";

export const metadata: Metadata = {
  title:
    "Engineering Blog — Interview Playbooks, AI, Python & System Guides | Elevate",
  description:
    "Explore in-depth software engineering guides, Python interview handbooks, SQL optimization playbooks, AI RAG systems, and 2026 career roadmaps curated by Elevate.",
  alternates: { canonical: "https://elevate.courses/blog" },
  openGraph: {
    title: "Elevate Engineering Blog — Practical Guides & Interview Playbooks",
    description:
      "Technical deep dives, interview question handbooks with real code, and architecture guides for modern engineers.",
    url: "https://elevate.courses/blog",
    siteName: "Elevate",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://elevate.courses/branding/elevate-orange-ribbon-logo.png",
        width: 1119,
        height: 337,
        alt: "Elevate Engineering Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elevate Engineering Blog — Practical Guides & Interview Playbooks",
    description:
      "Technical deep dives, interview question handbooks with real code, and architecture guides for modern engineers.",
    images: ["https://elevate.courses/branding/elevate-orange-ribbon-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Elevate Engineering Blog",
  description:
    "In-depth technical tutorials, coding interview handbooks, architecture notes, and career roadmaps.",
  url: "https://elevate.courses/blog",
  publisher: {
    "@type": "EducationalOrganization",
    name: "Elevate",
    url: "https://elevate.courses",
  },
  blogPost: mockBlogPosts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `https://elevate.courses/blog/${post.slug}`,
    image: post.coverImage,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
  })),
};

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Editorial Masthead */}
        <section className="relative overflow-hidden bg-[#172033] text-white border-b border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(255, 107, 53, 0.35), transparent 45%), radial-gradient(circle at 85% 75%, rgba(56, 189, 248, 0.2), transparent 40%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-8 space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/35 bg-[#FF6B35]/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#FF8A5B]">
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>The Elevate Engineering Journal</span>
                </div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-balance leading-[1.1]">
                  Actionable guides for developers building what&apos;s next.
                </h1>
                <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                  Long-form technical playbooks, verified interview handbooks with runnable code examples, and clear architecture breakdowns authored by working engineers.
                </p>
              </div>

              <div className="lg:col-span-4 grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                <div className="space-y-1">
                  <Code2 className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" />
                  <p className="text-lg font-black">{mockBlogPosts.length}+</p>
                  <p className="text-[11px] font-medium text-slate-300">
                    Deep Guides
                  </p>
                </div>
                <div className="space-y-1">
                  <Layers className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  <p className="text-lg font-black">7</p>
                  <p className="text-[11px] font-medium text-slate-300">
                    Core Tracks
                  </p>
                </div>
                <div className="space-y-1">
                  <Compass className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <p className="text-lg font-black">100%</p>
                  <p className="text-[11px] font-medium text-slate-300">
                    Lab Linked
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Spotlight Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-300">
              <span className="font-extrabold uppercase tracking-wider text-white">
                Popular Tracks:
              </span>
              <Link
                href="/blog/python-interview-questions"
                className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-white transition-colors hover:bg-[#FF6B35]"
              >
                Python Interview Questions
              </Link>
              <Link
                href="/blog/sql-query-optimization-indexing-guide"
                className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-slate-200 transition-colors hover:bg-[#FF6B35] hover:text-white"
              >
                SQL Indexing Guide
              </Link>
              <Link
                href="/blog/building-production-rag-agents"
                className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-slate-200 transition-colors hover:bg-[#FF6B35] hover:text-white"
              >
                Production RAG Systems
              </Link>
              <Link
                href="/blog/aws-cloud-architect-career-roadmap"
                className="rounded-lg bg-white/10 px-3 py-1 font-semibold text-slate-200 transition-colors hover:bg-[#FF6B35] hover:text-white"
              >
                2026 Career Roadmap
              </Link>
            </div>
          </div>
        </section>

        {/* Interactive Explorer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <BlogExplorer posts={mockBlogPosts} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
