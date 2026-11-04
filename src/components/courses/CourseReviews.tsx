"use client";

import { useEffect, useMemo, useState } from "react";

type Review = { id: string; rating: number; comment: string; createdAt: string; authorName: string };
type Summary = { total: number; average: number; distribution: number[] };

export function CourseReviews({ courseId, refreshKey = 0 }: { courseId: string; refreshKey?: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/courses/${encodeURIComponent(courseId)}/reviews`, { cache: "no-store" }),
      fetch(`/api/courses/${encodeURIComponent(courseId)}/review-summary`, { cache: "no-store" }),
    ]).then(async ([itemsResponse, summaryResponse]) => {
      if (!itemsResponse.ok || !summaryResponse.ok) throw new Error("Reviews are unavailable right now.");
      const [items, counts] = await Promise.all([itemsResponse.json(), summaryResponse.json()]);
      if (active) { setReviews(items.data || []); setSummary(counts.data); setError(""); }
    }).catch(() => { if (active) setError("Reviews are unavailable right now."); });
    return () => { active = false; };
  }, [courseId, refreshKey]);

  const visible = useMemo(() => reviews.filter((review) =>
    (!rating || review.rating === rating) && `${review.authorName} ${review.comment}`.toLowerCase().includes(search.toLowerCase().trim())),
  [reviews, rating, search]);

  return <section className="max-w-4xl space-y-6 text-[#172033]">
    <div><h3 className="text-xl font-extrabold">Learner reviews</h3><p className="mt-1 text-sm text-[#64748B]">Feedback from learners enrolled in this course.</p></div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {summary && <div className="grid gap-6 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] p-5 sm:grid-cols-[auto_1fr]">
      <div className="min-w-28"><strong className="text-5xl text-[#C96114]">{summary.total ? summary.average.toFixed(1) : "—"}</strong><p className="mt-1 text-sm font-bold">{summary.total.toLocaleString()} {summary.total === 1 ? "rating" : "ratings"}</p></div>
      <div className="space-y-2">{[5, 4, 3, 2, 1].map((stars) => <button key={stars} type="button" onClick={() => setRating(rating === stars ? 0 : stars)} aria-pressed={rating === stars} className="flex w-full items-center gap-3 text-xs hover:text-[#E85D2A]"><span className="w-8 shrink-0 text-left">{stars} ★</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#E5E7EB]"><span className="block h-full bg-[#F59E0B]" style={{ width: `${summary.total ? summary.distribution[stars - 1] / summary.total * 100 : 0}%` }} /></span><span className="w-10 text-right">{summary.total ? Math.round(summary.distribution[stars - 1] / summary.total * 100) : 0}%</span></button>)}</div>
    </div>}
    <div className="flex flex-wrap gap-3"><label className="sr-only" htmlFor={`review-search-${courseId}`}>Search reviews</label><input id={`review-search-${courseId}`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reviews" className="min-w-48 flex-1 rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm" /><label className="sr-only" htmlFor={`review-rating-${courseId}`}>Filter rating</label><select id={`review-rating-${courseId}`} value={rating} onChange={(event) => setRating(Number(event.target.value))} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm"><option value={0}>All ratings</option>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></div>
    {!summary && !error && <p role="status" className="text-sm text-[#64748B]">Loading reviews…</p>}
    {summary && (visible.length ? <div className="divide-y divide-[#E5E7EB]">{visible.map((review) => <article key={review.id} className="py-5"><div className="flex items-center gap-3"><span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-[#172033] font-bold text-white">{review.authorName.charAt(0).toUpperCase()}</span><div><p className="text-sm font-bold">{review.authorName}</p><p className="text-xs text-[#C96114]">{"★".repeat(review.rating)}<span className="ml-2 text-[#64748B]">{new Date(review.createdAt).toLocaleDateString()}</span></p></div></div>{review.comment && <p className="mt-3 whitespace-pre-line text-sm text-[#475569]">{review.comment}</p>}</article>)}</div> : <p className="rounded-xl border border-[#E5E7EB] p-5 text-sm text-[#64748B]">{summary.total ? "No reviews match your filters." : "No learner reviews yet."}</p>)}
    {summary && summary.total > reviews.length && <p className="text-xs text-[#64748B]">Showing the latest {reviews.length} reviews.</p>}
  </section>;
}
