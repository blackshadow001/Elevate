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
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { 
  Play, 
  Award, 
  Clock, 
  Flame, 
  BookCheck, 
  ArrowRight,
  Video,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const { user, isReady, isAuthenticated } = useAuth();
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
  const mockEnrolledCourses = learningState.enrolledCourses;
  const mockUserStats = {
    name: user.name.split(" ")[0],
    avatar: user.avatar,
    coursesCompleted: mockEnrolledCourses.filter((course) => course.progressPercent === 100).length,
    learningHours: 0,
    certificates: learningState.certificates.length,
    currentStreak: 0,
  };
  const myCertificates = learningState.certificates;

  if (!isReady || !isAuthenticated) {
    return <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center text-sm text-[#64748B]">Loading your dashboard…</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Welcome Banner */}
          <Reveal direction="down">
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {mockUserStats.avatar ? <img src={mockUserStats.avatar} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#FF6B35]" /> :
                  <span className="flex w-16 h-16 items-center justify-center rounded-2xl bg-[#FFF0EB] text-xl font-extrabold text-[#E85D2A]" aria-hidden="true">{mockUserStats.name.slice(0, 2).toUpperCase()}</span>}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
                    Good morning, {mockUserStats.name} 👋
                  </h1>
                  <p className="text-sm text-[#64748B] mt-1">
                    Continue learning and keep building your skills. Your progress is saved to your account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/live-classes"
                  className="inline-flex items-center gap-2 bg-[#172033] hover:bg-[#26344D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  <Video className="w-4 h-4 text-red-500" />
                  <span>Live Classes</span>
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-97"
                >
                  <span>Browse Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Learning Statistics Bar with Animated Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <Reveal direction="up" delay={0.05}>
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center shrink-0">
                  <BookCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#172033]">
                    <AnimatedNumber value={mockUserStats.coursesCompleted} duration={1500} />
                  </div>
                  <div className="text-xs font-semibold text-[#64748B]">
                    Courses Completed
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#172033]">
                    <AnimatedNumber value={mockUserStats.learningHours} suffix=" hrs" duration={1800} />
                  </div>
                  <div className="text-xs font-semibold text-[#64748B]">
                    Learning Hours
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#172033]">
                    <AnimatedNumber value={mockUserStats.certificates} duration={1400} />
                  </div>
                  <div className="text-xs font-semibold text-[#64748B]">
                    Certificates Earned
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.2}>
              <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-[#172033]">
                    <AnimatedNumber value={mockUserStats.currentStreak} suffix=" Days" duration={1600} />
                  </div>
                  <div className="text-xs font-semibold text-[#64748B]">
                    Current Streak 🔥
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Continue Learning Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#172033]">Continue Learning</h2>
              <span className="text-xs font-semibold text-[#64748B]">
                {mockEnrolledCourses.length} enrolled
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEnrolledCourses.map((enrolled, idx) => (
                <Reveal key={enrolled.courseId} direction="up" delay={0.1 * idx}>
                  <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full">
                    <div>
                      <div className="relative aspect-video bg-slate-100 group overflow-hidden">
                        <CourseThumbnail
                          category="Development"
                          title={enrolled.courseTitle}
                          imageUrl={enrolled.courseImage}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/learn/${enrolled.courseSlug}/${enrolled.lastLessonId}`}
                            className="w-12 h-12 rounded-full bg-[#FF6B35] text-white flex items-center justify-center shadow-md transform hover:scale-110 transition-transform"
                          >
                            <Play className="w-5 h-5 ml-0.5 fill-white" />
                          </Link>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-[#172033] text-sm leading-snug line-clamp-1">
                          {enrolled.courseTitle}
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          Current: <strong className="text-[#172033]">{enrolled.lastLessonTitle}</strong>
                        </p>

                        {/* Animated Progress Bar */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-[#64748B]">
                              Lesson {enrolled.completedLessons} of {enrolled.totalLessons}
                            </span>
                            <span className="text-[#FF6B35]">{enrolled.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#FF6B35] h-full rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${enrolled.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        href={`/learn/${enrolled.courseSlug}/${enrolled.lastLessonId}`}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#172033] hover:bg-[#FF6B35] text-white text-xs font-bold py-2.5 rounded-xl transition-colors active:scale-98"
                      >
                        <span>Continue Lesson →</span>
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            {mockEnrolledCourses.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-sm text-[#64748B]">
                <p>No courses enrolled yet. Choose a course to start your learning journey.</p>
                <Link href="/courses" className="inline-block mt-3 font-bold text-[#FF6B35]">Browse courses →</Link>
              </div>
            )}
          </div>

          {/* Upcoming Live Classes (Requirement 6) */}
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#172033] flex items-center gap-2">
                  <span>Upcoming Live Classes</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                </h2>
                <p className="text-xs text-[#64748B] mt-0.5">Interactive live sessions led by industry architects</p>
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
                        Demo Certificate
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
