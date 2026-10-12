import { Star, Quote } from "lucide-react";
import { mockTestimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-bold tracking-wider uppercase text-[#FF6B35] mb-2">
            Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            What our learners say
          </h2>
          <p className="mt-2 text-base text-[#64748B]">
            Real people who transformed their careers and leveled up their engineering craftsmanship.
          </p>
        </div>

        {/* Testimonials 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFFDF9] rounded-2xl border border-[#E5E7EB] p-6 flex flex-col justify-between hover:shadow-lg transition-shadow relative"
            >
              <div>
                <Quote className="w-8 h-8 text-[#FF6B35]/20 mb-3" />
                {/* Rating */}
                <div className="flex items-center gap-1 text-[#F59E0B] mb-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F59E0B]" />
                  ))}
                </div>

                <p className="text-sm text-[#172033] italic leading-relaxed mb-6">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* User Bio */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#E5E7EB]/60">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E7EB]"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">{item.name}</h4>
                  <p className="text-xs text-[#64748B]">
                    {item.role} · <span className="text-[#FF6B35] font-medium">{item.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
