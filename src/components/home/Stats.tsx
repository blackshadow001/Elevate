export function Stats({ courseCount }: { courseCount: number }) {
  return <section className="border-y border-[#E5E7EB] bg-white py-8"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-[#64748B]"><strong className="text-2xl text-[#172033]">{courseCount}</strong> {courseCount === 1 ? "published course" : "published courses"}</div></section>;
}
