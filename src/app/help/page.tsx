import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function HelpCenterPage() {
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20"><h1 className="text-4xl font-bold text-[#172033]">Help Center</h1><p className="mt-6 text-[#64748B]">Help articles are being prepared. You can browse <Link href="/courses" className="text-[#FF6B35]">available courses</Link> in the meantime.</p></main><Footer /></div>;
}
