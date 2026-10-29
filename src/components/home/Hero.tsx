import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return <section className="bg-gradient-to-b from-[#FFFDF9] to-white py-20 lg:py-28"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="max-w-3xl"><h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#172033]">Learn skills. <span className="text-[#FF6B35]">Elevate your future.</span></h1><p className="mt-6 text-lg text-[#64748B]">Explore available courses and learn at your own pace.</p><Link href="/courses" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF6B35] px-8 py-3.5 font-semibold text-white">Explore Courses <ArrowRight className="h-4 w-4" /></Link></div></div></section>;
}
