import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CareersPage() {
  return <div className="min-h-screen flex flex-col bg-[#FFFDF9]"><Navbar /><main className="flex-1 max-w-4xl w-full mx-auto px-4 py-20"><h1 className="text-4xl font-bold text-[#172033]">Careers at Elevate</h1><p className="mt-6 text-[#64748B]">There are no open positions at the moment.</p></main><Footer /></div>;
}
