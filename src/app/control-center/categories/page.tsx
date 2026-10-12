"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderTree,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

interface CategoryStat {
  category: string;
  count: number;
  publishedCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.categoriesBreakdown) {
          setCategories(json.data.categoriesBreakdown);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace Taxonomy & Categories"
        subtitle="Distribution of courses across academic and industry domains in SQLite."
        breadcrumbs={[{ label: "Marketplace" }, { label: "Categories" }]}
      />

      {loading ? (
        <div className="py-20 text-center text-xs text-[#64748B]">Loading taxonomy…</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-xs text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs hover:border-[#CBD5E1] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF0EB] text-[#FF6B35]">
                  <Tag className="h-4 w-4" />
                </span>
                <span className="rounded-full bg-[#F1F5F9] px-2.5 py-0.5 text-[10px] font-bold text-[#64748B]">
                  {cat.publishedCount} Published
                </span>
              </div>

              <h3 className="mt-4 text-base font-black text-[#172033]">{cat.category}</h3>
              <p className="mt-1 text-xs text-[#64748B]">{cat.count} total offerings registered</p>

              <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <Link
                  href={`/control-center/courses?search=${encodeURIComponent(cat.category)}`}
                  className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] inline-flex items-center gap-1"
                >
                  <span>Filter Courses</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
