"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Star, 
  Clock, 
  BookOpen, 
  Heart, 
  ShoppingBag,
  Palette,
  Code,
  BarChart3,
  Sparkles,
  Cloud,
  ShieldCheck
} from "lucide-react";
import { Course } from "@/types";
import { formatINR } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className = "" }: CourseCardProps) {
  const router = useRouter();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(course.id);

  const handleCardClick = () => {
    router.push(`/courses/${course.slug}`);
  };

  return (
    <div
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleCardClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`View ${course.title}`}
      className={`group cursor-pointer bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#FF6B35]/40 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-200 flex flex-col h-full ${className}`}
    >
      {/* Course Image & Badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <CourseThumbnail
          category={course.category}
          title={course.title}
          imageUrl={course.image}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Bestseller Badge */}
        {course.isBestseller && (
          <span className="absolute top-3 left-3 z-10 bg-[#FF6B35] text-white text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
            Bestseller
          </span>
        )}

        {/* Trending Badge */}
        {!course.isBestseller && course.isTrending && (
          <span className="absolute top-3 left-3 z-10 bg-[#172033] text-white text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
            Trending
          </span>
        )}

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(course.id, course.title);
          }}
          className="absolute top-2 right-2 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#172033] hover:text-[#FF6B35] hover:bg-white shadow-sm transition-colors duration-150"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              wishlisted ? "fill-[#FF6B35] text-[#FF6B35] scale-110" : "text-[#172033]"
            }`}
          />
        </button>
      </div>

      {/* Course Details Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category Badge & Language */}
        <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF6B35] font-bold text-[11px] tracking-wide uppercase">
            {course.category === "Design" && <Palette className="w-3.5 h-3.5" />}
            {course.category === "Development" && <Code className="w-3.5 h-3.5" />}
            {course.category === "Data Science" && <BarChart3 className="w-3.5 h-3.5" />}
            {course.category === "AI & ML" && <Sparkles className="w-3.5 h-3.5" />}
            {course.category === "Cloud & DevOps" && <Cloud className="w-3.5 h-3.5" />}
            {course.category === "Cybersecurity" && <ShieldCheck className="w-3.5 h-3.5" />}
            {!["Design", "Development", "Data Science", "AI & ML", "Cloud & DevOps", "Cybersecurity"].includes(course.category) && (
              <BookOpen className="w-3.5 h-3.5" />
            )}
            <span>{course.category}</span>
          </span>
          <span className="bg-[#F7F8FA] px-2 py-0.5 rounded text-[11px] border border-[#E5E7EB]">
            {course.language}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[#172033] text-base leading-snug line-clamp-2 group-hover:text-[#FF6B35] transition-colors mb-2">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-xs text-[#64748B] mb-3 truncate">
          By {course.instructor.name}
        </p>

        {/* Rating & Students */}
        <div className="flex items-center gap-1.5 text-xs mb-3">
          <span className="font-bold text-[#172033]">{course.ratingCount ? course.rating.toFixed(1) : "New"}</span>
          <div className="flex items-center text-[#F59E0B]">
            <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
          </div>
          <span className="text-[#64748B]">
            ({course.ratingCount ? course.ratingCount.toLocaleString() : "No reviews yet"})
          </span>
          <span className="mx-1 text-slate-300">·</span>
          <span className="text-[#64748B] truncate">
            {course.studentsCount.toLocaleString()} learners
          </span>
        </div>

        {/* Duration & Lessons Meta */}
        <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4 pb-3 border-b border-[#E5E7EB]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.totalLessons} {course.totalLessons === 1 ? "lesson" : "lessons"}
          </span>
        </div>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg text-[#172033]">
              {formatINR(course.price)}
            </span>
            {course.originalPrice > course.price && (
              <span className="text-xs text-[#64748B] line-through">
                {formatINR(course.originalPrice)}
              </span>
            )}
          </div>

          <div
            className="w-9 h-9 rounded-xl bg-[#F7F8FA] group-hover:bg-[#FF6B35] text-[#172033] group-hover:text-white flex items-center justify-center transition-all duration-200"
            aria-label="View course details"
          >
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
