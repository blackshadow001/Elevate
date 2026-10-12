import Link from "next/link";
import { 
  Code, 
  BarChart3, 
  Palette, 
  Cloud, 
  Briefcase, 
  Megaphone, 
  Sparkles, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { mockCategories } from "@/data/categories";

const iconMap: Record<string, React.ElementType> = {
  Code,
  BarChart3,
  Palette,
  Cloud,
  Briefcase,
  Megaphone,
  Sparkles,
  ShieldCheck,
};

export function Categories() {
  return (
    <section className="py-20 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
              Explore top categories
            </h2>
            <p className="mt-2 text-base text-[#64748B]">
              Find the right course for your career goals.
            </p>
          </div>
          <Link
            href="/courses"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6B35] hover:text-[#E85D2A] transition-colors"
          >
            <span>Browse all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockCategories.filter((cat) => cat.courseCount > 0).map((cat) => {
            const Icon = iconMap[cat.iconName] || Code;
            return (
              <Link
                key={cat.id}
                href={`/courses?category=${cat.slug}`}
                className="group p-6 bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${cat.colorAccent}15`, color: cat.colorAccent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-xs font-semibold text-[#64748B]">
                  <span>{cat.courseCount} {cat.courseCount === 1 ? "Course" : "Courses"}</span>
                  <span className="text-[#FF6B35] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
