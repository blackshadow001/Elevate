import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockBlogPosts } from "@/data/blogPosts";
import { Clock } from "lucide-react";

export const metadata = {
  title: "Engineering Blog — Elevate",
  description: "Technical deep dives, architectural patterns, and engineering insights from Elevate instructors.",
};

export default function BlogIndexPage() {
  const featured = mockBlogPosts[0];
  const rest = mockBlogPosts.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
            Engineering & Product Insights
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            The Elevate Technical Blog
          </h1>
          <p className="text-sm text-[#64748B]">
            Articles on modern React architecture, RAG agents, full-stack performance, and design systems.
          </p>
        </div>

        {/* Featured Post Card */}
        {featured && (
          <div className="mb-14">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 overflow-hidden shadow-xs hover:shadow-xl transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-7 aspect-video lg:aspect-auto overflow-hidden bg-slate-100">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-[#FF6B35] tracking-wider">
                      {featured.category} · Featured Article
                    </span>
                    <h2 className="text-2xl font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                      {featured.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#64748B]">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={featured.author.avatar}
                        alt={featured.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-[#172033]">{featured.author.name}</div>
                        <div className="text-[10px] text-[#64748B]">{featured.publishedAt}</div>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Grid of Other Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-3xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-xs font-bold uppercase text-[#FF6B35]">
                    {post.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-[#F1F5F9] mt-4 flex items-center justify-between text-xs text-[#64748B]">
                <span>{post.publishedAt}</span>
                <span className="font-mono">{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
