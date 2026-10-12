"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Video, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  ArrowLeft,
  GraduationCap,
  Flame
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";

function InstructorStudioContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isReady } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/instructor", icon: LayoutDashboard },
    { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
    { label: "Create Course", href: "/instructor/courses/create", icon: PlusCircle },
    { label: "Live Classes", href: "/instructor/live-classes", icon: Video },
    { label: "Bootcamps", href: "/instructor/bootcamps", icon: Flame },
    { label: "Students", href: "/instructor/students", icon: Users },
    { label: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
    { label: "Messages", href: "/instructor/messages", icon: MessageSquare },
    { label: "Settings", href: "/instructor/settings", icon: Settings },
  ];

  const handleSwitchToLearner = () => {
    router.push("/dashboard");
  };

  if (pathname === "/instructor/apply") return <>{children}</>;
  const canAccess = isReady && isAuthenticated && (user.role === "instructor" || user.role === "admin");

  return (
    <>
    {!canAccess && <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center p-6 text-center">
      {isReady ? <>
        <Logo />
        <h1 className="mt-8 text-2xl font-bold text-[#172033]">Instructor access</h1>
        <p className="mt-2 text-sm text-[#64748B]">Sign in with an instructor account to open the Studio.</p>
        <Link href="/login" className="mt-5 px-6 py-3 rounded-xl bg-[#FF6B35] text-white text-sm font-bold">Instructor login →</Link>
      </> : <p>Loading Instructor Studio…</p>}
    </div>}
    <div className={`min-h-screen bg-[#F7F8FA] flex flex-col lg:flex-row ${canAccess ? "" : "hidden"}`} aria-hidden={!canAccess}>
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <Logo />
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase tracking-wider">
            Studio
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label={mobileSidebarOpen ? "Close Studio navigation" : "Open Studio navigation"}
          className="p-2 text-[#172033] hover:text-[#FF6B35] rounded-xl"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#172033] text-white flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Studio Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo href="/instructor" inverse size="compact" />
              <span className="px-1.5 py-0.5 rounded-md bg-[#FF6B35] text-white text-[9px] font-black uppercase tracking-widest">Studio</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close Studio navigation"
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instructor Profile Card */}
          <div className="bg-[#26344D]/70 p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
            <img
              src={user.role === "instructor" ? user.avatar : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"}
              alt="Instructor"
              className="w-10 h-10 rounded-xl object-cover border border-[#FF6B35]/40"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-white truncate">
                {user.role === "instructor" ? user.name : "John Doe"}
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                Lead Instructor
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/instructor"
                ? pathname === "/instructor"
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#FF6B35] text-white shadow-md shadow-orange-500/20 font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-white/10 space-y-2 bg-[#172033]">
          {/* Switch to Learner view */}
          <button
            type="button"
            onClick={handleSwitchToLearner}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold bg-[#26344D] hover:bg-[#344666] text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#FF6B35]" />
              <span>Learner View</span>
            </span>
            <span className="text-[10px] text-slate-300">View →</span>
          </button>

          {/* Back to public site */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
    </>
  );
}

export default function InstructorStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#172033]" />}>
      <InstructorStudioContent>{children}</InstructorStudioContent>
    </Suspense>
  );
}
