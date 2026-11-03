"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Course } from "@/types";
import { LiveClass } from "@/data/liveClasses";
import { liveService } from "@/services/liveService";
import { useLearningState } from "@/lib/learningState";
import { useAuth } from "@/context/AuthContext";
import { CourseCard } from "@/components/courses/CourseCard";
import { MyLearningLibrary } from "@/components/learning/MyLearningLibrary";
import { Award, ArrowRight, Calendar } from "lucide-react";

export default function DashboardPage() {
  const { isReady, isAuthenticated } = useAuth();
  const router = useRouter();
  const learningState = useLearningState();
  const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [recommendationError, setRecommendationError] = useState(false);
  useEffect(() => {
    if (isReady && !isAuthenticated) router.replace("/login");
  }, [isReady, isAuthenticated, router]);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    liveService.getLiveClasses().then((items) => {
      if (active) setUpcomingClasses(items.filter((item) => item.status === "scheduled" || item.status === "live"));
    }).catch(() => { if (active) setUpcomingClasses([]); });
    return () => { active = false; };
  }, [isAuthenticated]);
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    fetch("/api/courses?sort=popular&pageSize=4", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((body) => {
        if (!active) return;
        const items = body.data?.items as Array<{
          id: string; slug: string; title: string; subtitle: string; description: string;
          category: string; level: Course["level"]; language: Course["language"];
          price: number; rating: number; ratingCount: number; studentsCount: number;
          durationSeconds: number; lessonCount: number; thumbnail: string | null;
          updatedAt: string; metadata?: { originalPrice?: number };
          instructor: { id: string; name: string; avatar: string | null };
        }> | undefined;
        setRecommendedCourses((items || []).map((item) => ({
          id: item.id, slug: item.slug, title: item.title, subtitle: item.subtitle,
          description: item.description, category: item.category, level: item.level,
          language: item.language, price: item.price, originalPrice: item.metadata?.originalPrice ?? item.price,
          rating: item.ratingCount ? item.rating : 0, ratingCount: item.ratingCount,
          studentsCount: item.studentsCount, duration: item.durationSeconds >= 3600
            ? `${Math.round(item.durationSeconds / 3600)} hours` : `${Math.max(1, Math.ceil(item.durationSeconds / 60))} mins`,
          totalLessons: item.lessonCount, image: item.thumbnail || "", updatedAt: item.updatedAt,
          instructor: { id: item.instructor.id, name: item.instructor.name, avatar: item.instructor.avatar || "",
            role: "Instructor", bio: "", rating: 0, studentsCount: 0, coursesCount: 0 },
          whatYouWillLearn: [], requirements: [], sections: [],
        })));
        setRecommendationError(false);
      })
      .catch(() => { if (active) setRecommendationError(true); });
    return () => { active = false; };
  }, [isAuthenticated]);

  const myCertificates = learningState.certificates;

  if (!isReady || !isAuthenticated) {
    return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-sm text-[#64748B]">Loading your dashboard…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />
      <MyLearningLibrary />

      <main id="learning-tools" className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Upcoming Live Classes (Requirement 6) */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
                  <span>Upcoming Live Classes</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">Live sessions scheduled on Elevate</p>
              </div>
              <Link href="/live" className="text-xs font-bold text-[#FF6B35] hover:underline">
                Explore Live Learning Hub →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingClasses.length === 0 && <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#64748B]">
                No live classes are scheduled right now. <Link href="/live" className="font-bold text-[#FF6B35]">Browse live learning</Link>.
              </div>}
              {upcomingClasses.slice(0, 2).map((live) => (
                <div
                  key={live.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        live.status === "live"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}>
                        {live.status === "live" ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span>LIVE NOW 🔴</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3" />
                            <span>{live.scheduledAt} · {live.startTime}</span>
                          </>
                        )}
                      </span>

                      <span className="text-xs font-medium text-[#64748B]">
                        {live.duration} mins
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#172033] leading-snug">
                      {live.title}
                    </h3>
                    <p className="text-xs text-[#64748B] line-clamp-2">
                      {live.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      {live.instructorAvatar ? <img
                        src={live.instructorAvatar}
                        alt={live.instructorName}
                        className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
                      /> : <span aria-hidden="true" className="w-8 h-8 rounded-full bg-[#172033] text-white text-xs font-bold flex items-center justify-center">{live.instructorName.charAt(0)}</span>}
                      <div>
                        <div className="text-xs font-bold text-[#172033]">{live.instructorName}</div>
                        <div className="text-[10px] text-[#64748B]">{live.instructorRole}</div>
                      </div>
                    </div>

                    <Link
                      href={`/live/classes/${live.id}`}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        live.status === "live"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-[#FF6B35] hover:bg-[#E85D2A] text-white"
                      }`}
                    >
                      <span>{live.status === "live" ? "Join Live Class" : "View Class"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Certificates (Requirement 6) */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#FF6B35]" />
                  <span>My Certificates</span>
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">Certificates earned by completing your courses</p>
              </div>
              <Link href="/certificates" className="text-xs font-bold text-[#FF6B35] hover:underline">
                View all ({myCertificates.length}) →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] bg-orange-50 px-2.5 py-1 rounded-md">
                        Certificate
                      </span>
                      <span className="font-mono text-xs font-semibold text-[#64748B]">
                        {cert.certificateId}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#172033] leading-snug">
                      {cert.courseTitle}
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Issued on <strong>{cert.completedAt}</strong> · Grade: <strong>{cert.grade}</strong>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1">
                      {cert.skillsAcquired.slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] bg-slate-50 border border-slate-200 text-[#172033] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/certificates/${cert.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-bold transition-colors"
                      >
                        <span>View & Download</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {myCertificates.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-sm text-[#64748B]">
                <p>No certificates earned yet. Complete every lesson in an enrolled course to unlock one.</p>
                <Link href="/courses" className="inline-block mt-3 font-bold text-[#FF6B35]">Explore courses →</Link>
              </div>
            )}
          </div>

          {/* Recommended For You */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#172033]">Explore More Courses</h2>
                <p className="text-xs text-[#64748B] mt-1">Explore more courses from the catalog</p>
              </div>
              <Link href="/courses" className="text-xs font-bold text-[#FF6B35] hover:underline">
                Explore all courses →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
            {recommendationError && <p className="text-sm text-[#64748B]">Unable to load more courses right now. Use Explore all courses to browse the catalog.</p>}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
