import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { ArticleToc } from "@/components/blog/ArticleToc";
import { mockBlogPosts } from "@/data/blogPosts";
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Calendar,
  ChevronDown,
  Clock,
  HelpCircle,
  Lightbulb,
  BadgeCheck,
  Tag,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return mockBlogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found | Elevate Blog",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${post.title} | Elevate Engineering Blog`,
    description: post.excerpt,
    keywords: post.tags,
    alternates: { canonical: `https://elevate.courses/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://elevate.courses/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

const DIFFICULTY_STYLES = {
  Foundational: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-50 text-amber-800 border-amber-200",
  Senior: "bg-purple-50 text-purple-700 border-purple-200",
} as const;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = mockBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = mockBlogPosts
    .filter((p) => p.id !== post.id)
    .sort((a, b) =>
      a.category === post.category ? -1 : b.category === post.category ? 1 : 0
    )
    .slice(0, 3);

  const tocItems = [
    ...post.sections.map((s) => ({ id: s.id, title: s.title })),
    ...(post.faqs.length > 0
      ? [{ id: "frequently-asked-questions", title: "Frequently Asked Questions" }]
      : []),
  ];

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.coverImage,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      keywords: post.tags.join(", "),
      author: {
        "@type": "Person",
        name: post.author.name,
        jobTitle: post.author.role,
      },
      publisher: {
        "@type": "EducationalOrganization",
        name: "Elevate",
        url: "https://elevate.courses",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://elevate.courses/blog/${post.slug}`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://elevate.courses",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Engineering Blog",
          item: "https://elevate.courses/blog",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `https://elevate.courses/blog/${post.slug}`,
        },
      ],
    },
  ];

  if (post.faqs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1">
        {/* Editorial Article Hero Header */}
        <header className="bg-[#172033] text-white border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pb-16">
            {/* Accessible Breadcrumbs */}
            <nav aria-label="Breadcrumbs" className="mb-6">
              <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                <li>
                  <Link href="/" className="hover:text-white hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-500">
                  /
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white hover:underline">
                    Engineering Blog
                  </Link>
                </li>
                <li aria-hidden="true" className="text-slate-500">
                  /
                </li>
                <li className="max-w-xs sm:max-w-md truncate">
                  <Link
                    href={`/blog/${post.slug}`}
                    aria-current="page"
                    className="font-bold text-[#FF8A5B] hover:underline"
                  >
                    {post.category}
                  </Link>
                </li>
              </ol>
            </nav>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#FF6B35] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
                    {post.category}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200">
                    {post.level}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-[#FF8A5B]" aria-hidden="true" />
                    {post.readTime}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black leading-[1.14] tracking-tight text-balance">
                  {post.title}
                </h1>

                <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300 text-pretty">
                  {post.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <Image
                      src={post.author.avatar}
                      alt={post.author.name}
                      width={42}
                      height={42}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FF6B35]/50"
                    />
                    <div>
                      <p className="text-sm font-bold text-white">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-slate-400">{post.author.role}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block h-6 w-px bg-white/15" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#FF8A5B]" aria-hidden="true" />
                    <span>Updated {post.updatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-lg">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100 motion-reduce:transform-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Two-Column Editorial Reading Shell */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 items-start">
            {/* Main Article Column */}
            <article className="lg:col-span-8 min-w-0 space-y-10">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden">
                <ArticleToc items={tocItems} />
              </div>

              {/* Key Takeaways Executive Summary */}
              <div className="rounded-2xl border border-[#FF6B35]/25 bg-gradient-to-br from-[#FFF8F2] to-white p-6 sm:p-7 shadow-xs">
                <div className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                  <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Key Takeaways</span>
                </div>
                <ul className="space-y-2.5">
                  {post.keyTakeaways.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-sm sm:text-[15px] leading-relaxed text-[#1E293B]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B35]" />
                      <span className="text-pretty">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dynamic Content Sections */}
              <div className="space-y-12">
                {post.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    tabIndex={-1}
                    className="scroll-mt-24 space-y-5 focus:outline-hidden"
                  >
                    <div className="space-y-1.5 border-b border-[#E5E7EB] pb-3">
                      {section.categoryLabel && (
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF6B35]">
                          {section.categoryLabel}
                        </span>
                      )}
                      <h2 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-[#172033] text-balance">
                        {section.title}
                      </h2>
                    </div>

                    <div className="max-w-[68ch] space-y-4 text-[16px] leading-[1.75] text-[#334155]">
                      {section.paragraphs.map((paragraph, idx) => (
                        <p key={idx} className="text-pretty">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.callout && (
                      <div className="flex items-start gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-950">
                        <Lightbulb
                          className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
                          aria-hidden="true"
                        />
                        <div>
                          <span className="font-extrabold uppercase tracking-wider text-amber-800 text-xs block mb-0.5">
                            {section.callout.label}
                          </span>
                          <p>{section.callout.text}</p>
                        </div>
                      </div>
                    )}

                    {section.bullets && section.bullets.length > 0 && (
                      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {section.bullets.map((b, i) => (
                          <li
                            key={i}
                            className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs"
                          >
                            {b.title && (
                              <h3 className="text-sm font-bold text-[#172033] mb-1">
                                {b.title}
                              </h3>
                            )}
                            <p className="text-sm leading-relaxed text-[#475569]">
                              {b.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.code && (
                      <CodeBlock
                        language={section.code.language}
                        filename={section.code.filename}
                        snippet={section.code.snippet}
                        output={section.code.output}
                      />
                    )}

                    {/* Categorized Q&A Interview Blocks */}
                    {section.qaItems && section.qaItems.length > 0 && (
                      <div className="space-y-6 pt-2">
                        {section.qaItems.map((qa) => (
                          <div
                            key={qa.number}
                            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-3.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-[#FF6B35]">
                                Question {String(qa.number).padStart(2, "0")}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                  DIFFICULTY_STYLES[qa.difficulty]
                                }`}
                              >
                                {qa.difficulty}
                              </span>
                            </div>
                            <h3 className="text-lg font-extrabold leading-snug text-[#172033]">
                              {qa.question}
                            </h3>
                            <p className="max-w-[68ch] text-[15px] leading-relaxed text-[#475569] text-pretty">
                              {qa.answer}
                            </p>
                            {qa.code && (
                              <CodeBlock
                                language={qa.code.language}
                                snippet={qa.code.snippet}
                                output={qa.code.output}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* Accessible Native <details> FAQ Section */}
              {post.faqs.length > 0 && (
                <section
                  id="frequently-asked-questions"
                  tabIndex={-1}
                  aria-labelledby="article-faq-heading"
                  className="scroll-mt-24 space-y-5 pt-4 focus:outline-hidden"
                >
                  <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
                    <HelpCircle
                      className="h-5 w-5 text-[#FF6B35]"
                      aria-hidden="true"
                    />
                    <h2
                      id="article-faq-heading"
                      className="text-2xl font-black tracking-tight text-[#172033]"
                    >
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {post.faqs.map((faq) => (
                      <details
                        key={faq.question}
                        className="group rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-xs open:border-[#FF6B35]/40"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm sm:text-base font-bold text-[#172033] marker:hidden">
                          <span>{faq.question}</span>
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-[#64748B] transition-transform duration-200 group-open:rotate-180 group-open:text-[#FF6B35]"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="mt-3 border-t border-[#F1F5F9] pt-3 text-sm leading-relaxed text-[#475569] text-pretty">
                          {faq.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              {/* Author Spotlight Card */}
              <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-2xl object-cover ring-2 ring-[#FF6B35]/20 shrink-0"
                  />
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF6B35]">
                      Written By
                    </span>
                    <h3 className="text-lg font-extrabold text-[#172033]">
                      {post.author.name}{" "}
                      <span className="text-sm font-medium text-[#64748B]">
                        · {post.author.role}
                      </span>
                    </h3>
                    <p className="text-sm leading-relaxed text-[#475569]">
                      {post.author.bio}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Right Sticky Sidebar: ToC + Tailored Practice CTA + Tags */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="hidden lg:block">
                <ArticleToc items={tocItems} />
              </div>

              {/* Tailored Practice Conversion Box */}
              <div className="rounded-2xl bg-[#172033] p-6 text-white shadow-sm space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35]/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF8A5B]">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{post.practiceCta.badge}</span>
                </span>
                <h3 className="text-xl font-black leading-snug">
                  {post.practiceCta.title}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  {post.practiceCta.description}
                </p>
                <Link
                  href={post.practiceCta.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
                >
                  <span>{post.practiceCta.label}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {/* Topics & Tags */}
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#172033]">
                  <Tag className="h-3.5 w-3.5 text-[#FF6B35]" aria-hidden="true" />
                  <span>Topics Covered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-xs font-semibold text-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Continue Reading Strip */}
        <section className="border-t border-[#E5E7EB] bg-white py-14 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
                  Keep Learning
                </span>
                <h2 className="text-2xl font-black tracking-tight text-[#172033]">
                  Recommended Next Handbooks
                </h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#172033] hover:text-[#FF6B35]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>All Articles</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] p-5 transition-all hover:-translate-y-0.5 hover:border-[#FF6B35]/50 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-[#64748B]">
                    <span className="text-[#FF6B35] uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <span>{rel.readTime}</span>
                  </div>
                  <h3 className="mb-2 text-base font-extrabold leading-snug text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                    {rel.title}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-[#64748B] flex-1">
                    {rel.excerpt}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#172033] group-hover:text-[#FF6B35]">
                    <span>Read Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
