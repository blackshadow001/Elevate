"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  Search,
  Sparkles,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/data/blogPosts";

interface BlogExplorerProps {
  posts: BlogPost[];
}

export function BlogExplorer({ posts }: BlogExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const featuredPost = useMemo(
    () => posts.find((p) => p.featured) ?? posts[0],
    [posts]
  );

  const trendingPosts = useMemo(
    () => posts.filter((p) => p.trending).slice(0, 4),
    [posts]
  );

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesQuery =
        query === "" ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [posts, selectedCategory, searchQuery]);

  const archivePosts = useMemo(() => {
    if (selectedCategory === "All" && searchQuery.trim() === "") {
      return filteredPosts.filter((p) => p.id !== featuredPost?.id);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost, selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Category Tabs + Search Filter Toolbar */}
      <div className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm sticky top-[64px] z-20 -mx-4 px-4 sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:py-3 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="tablist"
            aria-label="Filter articles by topic"
            className="flex items-center gap-1 overflow-x-auto py-1 no-scrollbar"
          >
            {BLOG_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${
                    isSelected
                      ? "bg-[#172033] text-white"
                      : "text-[#475569] hover:bg-slate-100 hover:text-[#172033]"
                  }`}
                >
                  {cat}
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[#FF6B35]"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-72 shrink-0 pb-2 lg:pb-0">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Python, SQL, React..."
              aria-label="Search articles by keyword or tag"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#FFFDF9] py-2 pl-9 pr-3 text-sm text-[#172033] placeholder:text-[#94A3B8] focus:border-[#FF6B35] focus:outline-hidden focus:ring-2 focus:ring-[#FF6B35]/20"
            />
          </div>
        </div>
      </div>

      {/* Editorial Featured Spotlight + Trending Right Column (shown when browsing All without search) */}
      {selectedCategory === "All" && searchQuery.trim() === "" && featuredPost && (
        <section
          aria-label="Featured editorial spotlight"
          className="grid grid-cols-1 gap-8 lg:grid-cols-12"
        >
          {/* Main Featured Card */}
          <article className="group relative lg:col-span-8 flex flex-col overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-sm transition-all hover:border-[#FF6B35]/50">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover scale-[1.08] transition-transform duration-700 ease-out group-hover:scale-100 motion-reduce:transform-none opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#172033]/90 via-[#172033]/35 to-transparent" />
              <div className="absolute left-6 top-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Flagship Handbook</span>
                </span>
                <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#172033]">
                  {featuredPost.category}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="mb-2 flex items-center gap-3 text-xs font-medium text-slate-200">
                  <span>{featuredPost.level}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight text-balance">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
                  >
                    {featuredPost.title}
                  </Link>
                </h2>
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-[#475569] text-pretty">
                {featuredPost.excerpt}
              </p>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 rounded-2xl bg-[#FFFDF9] border border-[#F1F5F9] p-4">
                {featuredPost.keyTakeaways.slice(0, 2).map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-2 text-xs leading-relaxed text-[#334155]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF6B35]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F1F5F9] pt-5">
                <div className="flex items-center gap-3">
                  <Image
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-100"
                  />
                  <div>
                    <p className="text-sm font-bold text-[#172033]">
                      {featuredPost.author.name}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {featuredPost.author.role}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6B35] group-hover:translate-x-0.5 transition-transform">
                  <span>Read Full Handbook</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
            </div>
          </article>

          {/* Right Column: Trending Must-Reads + Practice Bridge */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#172033]">
                  <Flame className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" />
                  <span>Trending Now</span>
                </div>
                <TrendingUp className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
              </div>

              <ol className="divide-y divide-[#F1F5F9]">
                {trendingPosts.map((item, idx) => (
                  <li key={item.id} className="py-3.5 first:pt-1 last:pb-1">
                    <Link
                      href={`/blog/${item.slug}`}
                      className="group/item flex items-start gap-3 focus-visible:outline-2 focus-visible:outline-[#FF6B35]"
                    >
                      <span className="font-mono text-lg font-black leading-none text-[#FF6B35]/80">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">
                          {item.category} · {item.readTime}
                        </span>
                        <h3 className="text-sm font-bold leading-snug text-[#172033] group-hover/item:text-[#FF6B35] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex-1 flex flex-col justify-between rounded-3xl bg-[#172033] p-6 text-white shadow-sm">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FF8A5B]">
                  <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Hands-On Lab</span>
                </span>
                <h3 className="text-xl font-black leading-snug">
                  Turn Tutorials Into Solved Benchmarks
                </h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Pair every engineering guide with CodeArena algorithms, QueryMaster SQL puzzles, and live CloudStudio execution.
                </p>
              </div>
              <Link
                href="/practice"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
              >
                <span>Explore Practice Hub</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </section>
      )}

      {/* Editorial Grid Header */}
      <section aria-label="Technical articles archive" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#FF6B35]">
              {selectedCategory === "All"
                ? "Latest Guides & Playbooks"
                : `${selectedCategory} Archive`}
            </p>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-[#172033]">
              {searchQuery.trim()
                ? `Search results for "${searchQuery.trim()}"`
                : selectedCategory === "All"
                ? "In-Depth Engineering & Career Playbooks"
                : `${selectedCategory} Deep Dives`}
            </h2>
          </div>
          <span className="text-xs font-bold text-[#64748B]">
            Showing {archivePosts.length}{" "}
            {archivePosts.length === 1 ? "guide" : "guides"}
          </span>
        </div>

        {archivePosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-12 text-center">
            <BookOpen
              className="mx-auto mb-3 h-8 w-8 text-[#94A3B8]"
              aria-hidden="true"
            />
            <h3 className="text-lg font-bold text-[#172033]">
              No matching articles found
            </h3>
            <p className="mt-1 text-sm text-[#64748B]">
              Try clearing your search filter or switching back to all topics.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-5 inline-flex items-center rounded-xl bg-[#172033] px-4 py-2 text-xs font-bold text-white hover:bg-[#23314D]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {archivePosts.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#FF6B35]/50 hover:shadow-md"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-100 motion-reduce:transform-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="rounded-md bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-[#172033] shadow-xs">
                      {post.category}
                    </span>
                    <span className="rounded-md bg-[#172033]/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                      {post.level}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-2.5 flex items-center gap-3 text-xs font-medium text-[#64748B]">
                    <span>{post.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="mb-3 text-lg font-extrabold leading-snug text-[#172033] group-hover:text-[#FF6B35] transition-colors text-balance">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-[#64748B] text-pretty">
                    {post.excerpt}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-2 py-0.5 text-[11px] font-medium text-[#475569]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[#F1F5F9] pt-4">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={28}
                        height={28}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-[#172033]">
                        {post.author.name}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
                    >
                      <span>Read</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Mid-Page Learning & Enterprise Strip */}
      <section className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-gradient-to-br from-[#FFF8F2] via-white to-[#FFF3EB] p-8 sm:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B35]/30 bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#FF6B35]">
              Structured Skill Acceleration
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#172033] text-balance">
              Want structured video courses alongside these engineering guides?
            </h2>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-[#475569] text-pretty">
              Combine our in-depth editorial handbooks with guided instructor-led courses, verifiable certificates, and hands-on coding challenges.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#23314D]"
            >
              <span>Browse Courses</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/instructor/apply"
              className="inline-flex items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-bold text-[#172033] transition-colors hover:border-[#FF6B35] hover:text-[#FF6B35]"
            >
              <span>Teach on Elevate</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
