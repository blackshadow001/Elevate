"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Pencil, Plus, Tag } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";

type Category = { id: string; name: string; subcategories: string[]; courseCount: number; publishedCount: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subcategories, setSubcategories] = useState("");

  async function load() {
    const response = await fetch("/api/admin/categories", { credentials: "same-origin", cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "Unable to load categories.");
    setCategories(body.data);
  }

  useEffect(() => { void load().catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load categories.")).finally(() => setLoading(false)); }, []);

  function resetForm() { setEditingId(null); setName(""); setSubcategories(""); }
  function edit(category: Category) {
    setEditingId(category.id); setName(category.name); setSubcategories(category.subcategories.join("\n"));
    setError(""); setSuccess("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try {
      const response = await fetch(editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories", {
        method: editingId ? "PATCH" : "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), subcategories: subcategories.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean) }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to save category.");
      await load(); resetForm(); setSuccess("Category saved. It is now available in the catalog and tutor course form.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save category."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    <PageHeader title="Course categories" subtitle="Add categories and organize them with subcategories. Published courses appear automatically."
      breadcrumbs={[{ label: "Marketplace" }, { label: "Categories" }]} />
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {success && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</p>}
    <form onSubmit={(event) => void save(event)} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-[#172033]">{editingId ? "Edit category" : "Add category"}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-[#172033]">Category name
          <input required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)}
            placeholder="e.g. AI & Generative AI" className="mt-1 block w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5" />
        </label>
        <label className="text-sm font-semibold text-[#172033]">Subcategories (one per line)
          <textarea rows={3} value={subcategories} onChange={(event) => setSubcategories(event.target.value)}
            placeholder="AI Fundamentals&#10;Language Models" className="mt-1 block w-full rounded-xl border border-[#CBD5E1] px-3 py-2.5" />
        </label>
      </div>
      <div className="mt-4 flex gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#172033] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Plus className="h-4 w-4" />{editingId ? "Save changes" : "Add category"}</button>
        {editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-bold">Cancel</button>}</div>
    </form>
    {loading ? <p className="py-12 text-sm text-[#64748B]">Loading categories…</p> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => <article key={category.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFF0EB] text-[#FF6B35]"><Tag className="h-4 w-4" /></span>
          <span className="rounded-full bg-[#F1F5F9] px-2.5 py-1 text-xs font-bold text-[#64748B]">{category.publishedCount} published</span></div>
        <h3 className="mt-4 text-base font-extrabold text-[#172033]">{category.name}</h3>
        <p className="mt-1 text-xs text-[#64748B]">{category.courseCount} total courses</p>
        <p className="mt-3 min-h-9 text-xs leading-relaxed text-[#475569]">{category.subcategories.join(" · ") || "No subcategories yet"}</p>
        <div className="mt-4 flex items-center justify-between border-t border-[#E5E7EB] pt-4">
          <Link href={`/control-center/courses?search=${encodeURIComponent(category.name)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#D65B28]">Courses <ArrowRight className="h-3 w-3" /></Link>
          <button type="button" onClick={() => edit(category)} className="inline-flex items-center gap-1 text-xs font-bold text-[#172033]"><Pencil className="h-3 w-3" /> Edit</button>
        </div>
      </article>)}
    </div>}
  </div>;
}
