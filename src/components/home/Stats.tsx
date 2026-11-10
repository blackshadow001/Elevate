import { BookOpenCheck, GraduationCap, Layers3, UsersRound } from "lucide-react";
import type { Course } from "@/types";
import { LEARNING_ROADMAPS } from "@/lib/learningRoadmaps";
import { MICRO_COURSE_TOPICS } from "@/lib/microCourseTopics";

export function Stats({ courses }: { courses: Course[] }) {
  const instructors = new Set(courses.map((course) => course.instructor.id));
  const items = [
    { label: "Published courses", value: courses.length, Icon: BookOpenCheck },
    { label: "Active instructors", value: instructors.size, Icon: UsersRound },
    { label: "Guided roadmaps", value: LEARNING_ROADMAPS.length, Icon: Layers3 },
    { label: "Upcoming Tamil topics", value: MICRO_COURSE_TOPICS.length, Icon: GraduationCap },
  ];
  return <section aria-label="Elevate at a glance" className="border-b border-[#E5E7EB] bg-white py-10 sm:py-12">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 px-4 sm:px-6 lg:grid-cols-4 lg:gap-10 lg:px-8">
      {items.map(({ label, value, Icon }) => <div key={label} className="flex flex-col items-start">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-[#FFE2D3] bg-[#FFF4ED] text-[#E45D32]"><Icon aria-hidden="true" className="h-5 w-5" /></span>
        <strong className="mt-3 text-3xl font-extrabold tracking-tight text-[#172033] sm:text-4xl">{value}</strong>
        <span className="mt-0.5 text-sm font-medium text-[#64748B]">{label}</span>
      </div>)}
    </div>
  </section>;
}
