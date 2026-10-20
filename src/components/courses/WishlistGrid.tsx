"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { useWishlist } from "@/context/WishlistContext";

type SavedCourse = { id: string; slug: string; title: string; category: string; thumbnail: string | null;
  priceMinor: number; currency: string; instructorName: string; available: boolean };

export function WishlistGrid({ initialCourses }: { initialCourses: SavedCourse[] }) {
  const [courses, setCourses] = useState(initialCourses);
  const [pendingId, setPendingId] = useState("");
  const { toggleWishlist } = useWishlist();

  const remove = async (course: SavedCourse) => {
    if (pendingId) return;
    setPendingId(course.id);
    const saved = await toggleWishlist(course.id, course.title, false);
    if (saved) setCourses((items) => items.filter((item) => item.id !== course.id));
    setPendingId("");
  };

  if (!courses.length) return <div className="rounded-3xl border border-[#E5E7EB] bg-white px-6 py-14 text-center shadow-xs">
    <Heart className="mx-auto h-9 w-9 text-[#FF6B35]" aria-hidden="true" />
    <h2 className="mt-4 text-xl font-bold text-[#172033]">Your wishlist is empty</h2>
    <p className="mt-2 text-sm text-[#64748B]">Courses you save with the heart button will appear here.</p>
    <Link href="/courses" className="mt-5 inline-flex rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white hover:bg-[#E85D2A]">Browse courses</Link>
  </div>;

  return <>
    <p className="mb-5 text-sm font-medium text-[#64748B]">{courses.length} saved {courses.length === 1 ? "course" : "courses"}</p>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => <article key={course.id} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        <div className="relative aspect-video bg-slate-100">
          <CourseThumbnail category={course.category} title={course.title} imageUrl={course.thumbnail || ""} />
          <button type="button" disabled={Boolean(pendingId)} onClick={() => void remove(course)}
            aria-label={`Remove ${course.title} from wishlist`}
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#FF6B35] shadow-sm hover:bg-orange-50 disabled:opacity-50">
            <Heart className="h-5 w-5 fill-current" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-2 p-5">
          <p className="text-xs font-bold uppercase text-[#FF6B35]">{course.category}</p>
          <h2 className="text-base font-bold text-[#172033]">{course.title}</h2>
          <p className="text-xs text-[#64748B]">By {course.instructorName}</p>
          <div className="flex items-center justify-between gap-3 pt-3">
            <span className="font-bold text-[#172033]">{course.priceMinor === 0 ? "Free" :
              new Intl.NumberFormat("en-IN", { style: "currency", currency: course.currency }).format(course.priceMinor / 100)}</span>
            {course.available ? <Link href={`/courses/${course.slug}`} className="rounded-xl bg-[#172033] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#FF6B35]">View course</Link>
              : <span className="text-xs font-semibold text-[#64748B]">Currently unavailable</span>}
          </div>
        </div>
      </article>)}
    </div>
  </>;
}
