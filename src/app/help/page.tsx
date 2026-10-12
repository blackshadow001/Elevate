"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { mockFAQs } from "@/data/supportData";
import { Search, ChevronDown, HelpCircle, BookOpen, User, CreditCard, Award, Laptop } from "lucide-react";

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const categories = [
    { name: "All", icon: HelpCircle },
    { name: "Enrollment", icon: BookOpen },
    { name: "Certificates", icon: Award },
    { name: "Platform", icon: Laptop },
    { name: "General", icon: User },
  ];

  const filteredFaqs = mockFAQs.filter((f) => {
    const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1">
        {/* Navy Search Banner */}
        <section className="bg-[#172033] text-white py-16 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              Knowledge Base
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              How can we help you today?
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8]">
              Browse answers on courses, enrollments, certificates, and playback features.
            </p>

            <div className="pt-4 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles and help questions..."
                className="w-full bg-white text-[#172033] rounded-full pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6B35] shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Content Topics */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          {/* Category Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {categories.map((c) => {
              const Icon = c.icon;
              const isActive = selectedCategory === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#FF6B35] text-white shadow-sm"
                      : "bg-white border border-[#E5E7EB] text-[#172033] hover:border-[#FF6B35]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion Questions */}
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#E5E7EB] rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex items-center justify-between text-sm font-bold text-[#172033] hover:bg-[#FFFDF9]"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748B] transition-transform duration-200 shrink-0 ml-4 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-[#64748B] leading-relaxed border-t border-[#F1F5F9] pt-3 bg-[#FFFDF9]/40">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-xs text-[#64748B]">
                No help topics found matching &ldquo;{search}&rdquo;. Try another search or contact support.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
