import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockBlogPosts } from "@/data/blogPosts";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = mockBlogPosts.find((item) => item.slug === slug);
  if (!post) return { title: "Article not found — Elevate", robots: { index: false } };
  return {
    title: `${post.title} — Elevate`,
    description: post.excerpt,
    alternates: { canonical: `https://elevate.courses/blog/${encodeURIComponent(post.slug)}` },
  };
}

export async function generateStaticParams() {
  return mockBlogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase text-[#FF6B35] tracking-wider">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#172033] leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-[#64748B] pt-2">
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-semibold text-[#172033]">{post.author.name}</span>
            </div>
            <span>·</span>
            <span>{post.publishedAt}</span>
            <span>·</span>
            <span className="font-mono">{post.readTime}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-lg bg-slate-100">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 sm:p-12 shadow-xs space-y-6 text-[#172033] leading-relaxed text-base">
          <p className="text-lg font-medium text-[#64748B] italic">
            {post.excerpt}
          </p>

          <div className="border-t border-[#F1F5F9] pt-6 space-y-4 whitespace-pre-line text-sm sm:text-base">
            {post.content}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
