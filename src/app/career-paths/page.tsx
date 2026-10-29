import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = { title: "Career Paths — Elevate" };
export default function CareerPathsPage() {
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20"><h1 className="text-4xl font-bold text-[#172033]">Career Paths</h1><p className="mt-6 text-[#64748B]">No career paths have been published yet.</p><Link href="/courses" className="mt-8 inline-block text-[#FF6B35] font-semibold">Browse available courses</Link></main><Footer /></div>;
}
