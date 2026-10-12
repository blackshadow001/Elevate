"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  BookOpen, 
  Layers, 
  Compass, 
  Sparkles, 
  Heart,
  Video,
  Award,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Presentation
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { wishlistIds } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header onKeyDown={(event) => {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    }} className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-[15px] font-medium text-[#172033]">
            <Link
              href="/courses"
              className={`hover:text-[#FF6B35] transition-colors py-1 ${
                pathname === "/courses" ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
              }`}
            >
              Courses
            </Link>

            <Link
              href="/career-paths"
              className={`hover:text-[#FF6B35] transition-colors py-1 ${
                pathname.startsWith("/career-paths") ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
              }`}
            >
              Career Paths
            </Link>

            {/* Live Learning */}
            <Link
              href="/live"
              className={`hover:text-[#FF6B35] transition-colors py-1 flex items-center gap-1.5 ${
                pathname.startsWith("/live") ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
              }`}
            >
              <span>Live Learning</span>
              <span className="relative flex h-2.5 w-2.5 items-center justify-center" title="Live Class Active Now">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Link>

            {/* Explore Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen(!exploreOpen)}
                onBlur={() => setTimeout(() => setExploreOpen(false), 200)}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
                className="flex items-center gap-1.5 hover:text-[#FF6B35] transition-colors py-1 focus:outline-none"
              >
                <span>Explore</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`} />
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/courses?category=development"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FFFDF9] hover:text-[#FF6B35] transition-colors text-sm font-medium text-[#172033]"
                  >
                    <BookOpen className="w-4 h-4 text-[#FF6B35]" />
                    <span>Software Development</span>
                  </Link>
                  <Link
                    href="/courses?category=data-science"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FFFDF9] hover:text-[#FF6B35] transition-colors text-sm font-medium text-[#172033]"
                  >
                    <Layers className="w-4 h-4 text-[#10B981]" />
                    <span>Data Science & Analytics</span>
                  </Link>
                  <Link
                    href="/courses?category=ai-ml"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FFFDF9] hover:text-[#FF6B35] transition-colors text-sm font-medium text-[#172033]"
                  >
                    <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                    <span>AI & Machine Learning</span>
                  </Link>
                  <Link
                    href="/career-paths"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#FFFDF9] hover:text-[#FF6B35] transition-colors text-sm font-medium text-[#172033]"
                  >
                    <Compass className="w-4 h-4 text-[#3B82F6]" />
                    <span>All Guided Paths</span>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses, skills, instructors..."
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-full pl-10 pr-4 py-2 text-sm text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#FF6B35] focus:bg-white transition-all shadow-inner"
            />
          </form>
        </div>

        {/* Right: Auth, Wishlist & Dashboard Links */}
        <div className="hidden lg:flex items-center gap-3.5">
          {/* Wishlist */}
          <Link
            href="/courses"
            className="relative p-2 text-[#64748B] hover:text-[#FF6B35] transition-colors"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in-75">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? <>
          {/* Conditional Role Links */}
          {user.role === "instructor" ? (
            <Link
              href="/instructor"
              className="inline-flex items-center gap-2 bg-[#172033] hover:bg-[#26344D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Presentation className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Instructor Studio</span>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#64748B] hover:text-[#172033] transition-colors px-2 py-1"
            >
              My Learning
            </Link>
          )}

          <div className="h-4 w-px bg-[#E5E7EB]" />

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 250)}
              aria-expanded={profileDropdownOpen}
              aria-haspopup="true"
              aria-label={`${user.name} account menu`}
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]"
              />
              <span className="text-xs font-bold text-[#172033] max-w-[100px] truncate">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1">
                {/* User info */}
                <div className="px-3 py-2 border-b border-[#F7F8FA]">
                  <div className="font-bold text-sm text-[#172033]">{user.name}</div>
                  <div className="text-xs text-[#64748B] truncate">{user.email}</div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      user.role === "instructor"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-50 text-[#FF6B35]"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Nav Links */}
                {user.role === "instructor" ? (
                  <>
                    <Link
                      href="/instructor"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA] hover:text-[#FF6B35]"
                    >
                      <Presentation className="w-4 h-4 text-[#FF6B35]" />
                      <span>Instructor Studio</span>
                    </Link>
                    <Link
                      href="/instructor/courses"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA]"
                    >
                      <BookOpen className="w-4 h-4 text-[#64748B]" />
                      <span>Manage Courses</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA] hover:text-[#FF6B35]"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#FF6B35]" />
                      <span>Learner Dashboard</span>
                    </Link>
                    <Link
                      href="/live-classes"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA]"
                    >
                      <Video className="w-4 h-4 text-red-500" />
                      <span>Live Classes</span>
                    </Link>
                    <Link
                      href="/certificates"
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA]"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>My Certificates</span>
                    </Link>
                  </>
                )}

                <div className="pt-1 border-t border-[#F7F8FA]">
                  <button
                    type="button"
                    onClick={async () => { if (await logout()) router.push("/login"); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </> : <>
            <Link href="/login" className="text-sm font-semibold text-[#172033] hover:text-[#FF6B35]">Login</Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-[#FF6B35] text-white text-xs font-bold hover:bg-[#E85D2A]">Sign Up</Link>
          </>}
        </div>

        {/* Mobile Buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#172033] hover:text-[#FF6B35] rounded-lg"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E7EB] px-5 py-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg pl-10 pr-4 py-2.5 text-sm"
            />
          </form>

          <div className="flex flex-col space-y-3 pt-2 font-medium text-[#172033]">
            <button type="button" onClick={() => setExploreOpen(!exploreOpen)} aria-expanded={exploreOpen} className="py-2 text-left border-b border-[#F7F8FA] flex justify-between items-center">
              Explore <ChevronDown className={`w-4 h-4 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && <div className="pl-4 flex flex-col gap-3 text-sm">
              <Link href="/courses?category=development" onClick={() => setMobileMenuOpen(false)}>Software Development</Link>
              <Link href="/courses?category=data-science" onClick={() => setMobileMenuOpen(false)}>Data Science & Analytics</Link>
              <Link href="/courses?category=ai-ml" onClick={() => setMobileMenuOpen(false)}>AI & Machine Learning</Link>
              <Link href="/career-paths" onClick={() => setMobileMenuOpen(false)}>All Guided Paths</Link>
            </div>}
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]"
            >
              Browse All Courses
            </Link>
            <Link
              href="/career-paths"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]"
            >
              Career Paths
            </Link>
            <Link
              href="/live"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA] flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <span>Live Learning</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 uppercase">Live</span>
            </Link>
            {isAuthenticated && <Link href={user.role === "instructor" ? "/instructor" : "/dashboard"} onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]">
              {user.role === "instructor" ? "Instructor Studio" : "My Learning"}
            </Link>}
            {isAuthenticated && user.role === "learner" && <Link href="/certificates" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]">My Certificates</Link>}
          </div>

          <div className="pt-4 flex flex-col gap-2.5">
            {!isAuthenticated ? <><Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-[#172033] border border-[#E5E7EB] rounded-lg hover:bg-[#F7F8FA]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-white bg-[#FF6B35] hover:bg-[#E85D2A] rounded-lg"
            >
              Sign Up Free
            </Link>
            </> : <button type="button" onClick={async () => { if (await logout()) { setMobileMenuOpen(false); router.push("/login"); } }} className="w-full text-center py-2.5 font-semibold text-[#172033] border border-[#E5E7EB] rounded-lg">Sign Out</button>}
          </div>
        </div>
      )}
    </header>
  );
}
