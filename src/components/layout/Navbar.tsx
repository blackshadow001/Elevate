"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Search, 
  ChevronDown, 
  Menu, 
  X, 
  BookOpen, 
  Heart,
  Video,
  Award,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  Presentation,
  Code2,
  Terminal,
  Database,
  Bug,
  Braces,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { CATALOG_CATEGORIES } from "@/lib/catalogTaxonomy";
import { EXPLORE_MENU_SECTIONS } from "@/data/megaMenuData";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [activeExploreSection, setActiveExploreSection] = useState<string>("career");
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const practiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exploreTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
      if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
    };
  }, []);

  const handlePracticeMouseEnter = () => {
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
    setExploreOpen(false);
    setPracticeOpen(true);
  };

  const handlePracticeMouseLeave = () => {
    practiceTimeoutRef.current = setTimeout(() => {
      setPracticeOpen(false);
    }, 180);
  };

  const handleExploreMouseEnter = () => {
    if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
    if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current);
    setPracticeOpen(false);
    setExploreOpen(true);
  };

  const handleExploreMouseLeave = () => {
    exploreTimeoutRef.current = setTimeout(() => {
      setExploreOpen(false);
    }, 180);
  };
  const [catalogCategories, setCatalogCategories] = useState<{ id: string; name: string }[]>(CATALOG_CATEGORIES.map(({ name }) => ({ id: name, name })));
  useEffect(() => {
    let active = true;
    void fetch("/api/categories", { cache: "no-store" }).then((response) => response.ok ? response.json() : null)
      .then((body) => { if (active && Array.isArray(body?.data)) setCatalogCategories(body.data); }).catch(() => {});
    return () => { active = false; };
  }, []);
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
        setPracticeOpen(false);
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
              onMouseEnter={() => {
                setPracticeOpen(false);
                setExploreOpen(false);
              }}
              className={`hover:text-[#FF6B35] transition-colors py-1 ${
                pathname === "/courses" ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
              }`}
            >
              Courses
            </Link>

            {/* Practice Dropdown matching reference image */}
            <div 
              className="relative"
              onMouseEnter={handlePracticeMouseEnter}
              onMouseLeave={handlePracticeMouseLeave}
            >
              <button
                type="button"
                onClick={() => setPracticeOpen((prev) => !prev)}
                aria-expanded={practiceOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 hover:text-[#FF6B35] transition-colors py-1 focus:outline-none cursor-pointer ${
                  pathname.startsWith("/practice") ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
                }`}
              >
                <span>Practice</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${practiceOpen ? "rotate-180 text-[#FF6B35]" : ""}`} />
              </button>

              {practiceOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-full left-0 mt-2 w-[380px] sm:w-[410px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-2.5 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  <div className="space-y-1">
                    <Link
                      href="/practice/codearena"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#FFFDF9] hover:shadow-sm border border-transparent hover:border-orange-100/80 transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center shrink-0 text-blue-600 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Code2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                            CodeArena
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100/70 text-blue-700">100 Lvls</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          100 progressive coding challenges from beginner to DP
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/practice/webforge"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#FFFDF9] hover:shadow-sm border border-transparent hover:border-orange-100/80 transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center shrink-0 text-emerald-600 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                        <Terminal className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                            WebForge
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100/70 text-emerald-700">Sandbox</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          Frontend components & web UI challenges
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/practice/querymaster"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#FFFDF9] hover:shadow-sm border border-transparent hover:border-orange-100/80 transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100/80 flex items-center justify-center shrink-0 text-purple-600 group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                        <Database className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                            QueryMaster
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100/70 text-purple-700">SQL</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          Master relational queries, JOINs & analytics
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/practice/bughunter"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#FFFDF9] hover:shadow-sm border border-transparent hover:border-orange-100/80 transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center shrink-0 text-rose-600 group-hover:scale-105 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                        <Bug className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                            BugHunter
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100/70 text-rose-700">Debug</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          Find defects in production programs & submit fixes
                        </p>
                      </div>
                    </Link>

                    <Link
                      href="/practice/cloudstudio"
                      onClick={() => setPracticeOpen(false)}
                      className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-[#FFFDF9] hover:shadow-sm border border-transparent hover:border-orange-100/80 transition-all group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center shrink-0 text-amber-600 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                        <Braces className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#172033] group-hover:text-[#FF6B35] transition-colors">
                            CloudStudio
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100/70 text-amber-700">IDE</span>
                        </div>
                        <p className="text-xs text-[#64748B] leading-snug mt-0.5">
                          Run & test code in Python, JS, TS with stdin/stdout
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Footer link to Hub */}
                  <div className="mt-2 pt-2 border-t border-[#F1F5F9] px-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#64748B]">
                      5 Practice Tracks
                    </span>
                    <Link
                      href="/practice"
                      onClick={() => setPracticeOpen(false)}
                      className="text-xs font-bold text-[#FF6B35] hover:text-[#E85D2A] flex items-center gap-1 group/hub"
                    >
                      <span>Explore Practice Hub</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/hub:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/career-paths"
              onMouseEnter={() => {
                setPracticeOpen(false);
                setExploreOpen(false);
              }}
              className={`hover:text-[#FF6B35] transition-colors py-1 ${
                pathname.startsWith("/career-paths") ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
              }`}
            >
              Career Paths
            </Link>
            <Link 
              href="/personal-plan" 
              onMouseEnter={() => {
                setPracticeOpen(false);
                setExploreOpen(false);
              }}
              className={`py-1 transition-colors hover:text-[#FF6B35] ${pathname.startsWith("/personal-plan") ? "font-semibold text-[#FF6B35]" : "text-[#172033]"}`}
            >
              Personal Plan
            </Link>

            {/* Live Learning */}
            <Link
              href="/live"
              onMouseEnter={() => {
                setPracticeOpen(false);
                setExploreOpen(false);
              }}
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

            {/* Explore 2-Column Mega Dropdown (Matching Udemy Reference) */}
            <div 
              className="relative"
              onMouseEnter={handleExploreMouseEnter}
              onMouseLeave={handleExploreMouseLeave}
            >
              <button
                type="button"
                onClick={() => setExploreOpen((prev) => !prev)}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 hover:text-[#FF6B35] transition-colors py-1 focus:outline-none cursor-pointer ${
                  exploreOpen ? "text-[#FF6B35] font-semibold" : "text-[#172033]"
                }`}
              >
                <span>Explore</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${exploreOpen ? "rotate-180 text-[#FF6B35]" : ""}`} />
              </button>

              {exploreOpen && (
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute top-full -left-20 sm:left-0 mt-2 w-[620px] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden z-50 flex animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 divide-x divide-[#E5E7EB] before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                >
                  {/* Left Column: Categories and Goals (w-60) */}
                  <div className="w-60 bg-white py-3 overflow-y-auto max-h-[500px]">
                    {/* New & Featured */}
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      New & Featured
                    </div>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveExploreSection("google-ai")}
                      onClick={() => setActiveExploreSection("google-ai")}
                      className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors text-left ${
                        activeExploreSection === "google-ai"
                          ? "bg-purple-50 text-purple-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                          G
                        </span>
                        <span>Learn AI with Google</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>

                    <div className="h-px bg-slate-100 my-2 mx-3" />

                    {/* Explore by goal */}
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Explore by goal
                    </div>
                    {[
                      { id: "learn-ai", label: "Learn AI" },
                      { id: "career", label: "Launch a new career" },
                      { id: "certifications", label: "Prepare for a certification" },
                      { id: "practice", label: "Practice with Coding & Arenas" },
                      { id: "communities", label: "Elevate Communities" },
                    ].map((goal) => (
                      <button
                        key={goal.id}
                        type="button"
                        onMouseEnter={() => setActiveExploreSection(goal.id)}
                        onClick={() => setActiveExploreSection(goal.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors text-left ${
                          activeExploreSection === goal.id
                            ? "bg-purple-50 text-purple-700 font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{goal.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    ))}

                    <div className="h-px bg-slate-100 my-2 mx-3" />

                    {/* Categories */}
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Categories
                    </div>
                    {[
                      { id: "development", label: "Development" },
                      { id: "business", label: "Business" },
                      { id: "finance", label: "Finance & Accounting" },
                      { id: "it-software", label: "IT & Software" },
                      { id: "productivity", label: "Office Productivity" },
                      { id: "personal-dev", label: "Personal Development" },
                      { id: "design", label: "Design" },
                      { id: "marketing", label: "Marketing" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onMouseEnter={() => setActiveExploreSection(cat.id)}
                        onClick={() => setActiveExploreSection(cat.id)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-xs font-semibold transition-colors text-left ${
                          activeExploreSection === cat.id
                            ? "bg-purple-50 text-purple-700 font-bold"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{cat.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>
                    ))}
                  </div>

                  {/* Right Column: Dynamic Flyout Submenu (flex-1 p-5) */}
                  <div className="flex-1 bg-[#FAF9F6]/50 p-5 overflow-y-auto max-h-[500px]">
                    {(() => {
                      const currentSection = EXPLORE_MENU_SECTIONS[activeExploreSection] || EXPLORE_MENU_SECTIONS["career"];
                      return (
                        <>
                          <div className="mb-3.5 pb-2 border-b border-[#E5E7EB]">
                            <h4 className="text-sm font-black text-[#172033]">
                              {currentSection.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {currentSection.subTitle}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-1">
                            {currentSection.items.map((item, idx) => (
                              <Link
                                key={idx}
                                href={item.href}
                                onClick={() => setExploreOpen(false)}
                                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-[#FF6B35] hover:bg-white hover:shadow-xs transition-all group"
                              >
                                <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
                                {item.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#FF6B35]">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
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
            href="/wishlist"
            className="relative p-2 text-[#64748B] hover:text-[#FF6B35] transition-colors"
            title="Wishlist"
            aria-label="View wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in-75">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? <>
          {user.role === "learner" && <Link href="/instructor/apply" className="rounded-lg bg-[#FFF3EE] px-3 py-2 text-xs font-bold text-[#E85D2A] hover:bg-orange-100">Teach on Elevate</Link>}
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
              {user.avatar ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-[#E5E7EB]" /> :
                <span className="flex w-8 h-8 items-center justify-center rounded-full bg-[#FFF0EB] text-xs font-bold text-[#E85D2A]" aria-hidden="true">{user.name.trim().slice(0, 2).toUpperCase()}</span>}
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
                <Link
                  href="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#172033] hover:bg-[#F7F8FA] hover:text-[#FF6B35]"
                >
                  <UserIcon className="w-4 h-4 text-[#FF6B35]" />
                  <span>My Profile</span>
                </Link>
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
              <span>Explore Goals & Categories</span> <ChevronDown className={`w-4 h-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && (
              <div className="pl-3 py-2 flex flex-col gap-2.5 text-xs bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Goals & Accelerators</div>
                <Link href="/courses?search=Google+Cloud+AI" onClick={() => { setMobileMenuOpen(false); setExploreOpen(false); }} className="flex items-center gap-2 font-semibold text-purple-700">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-100 text-purple-700 text-[9px] font-bold flex items-center justify-center">G</span>
                  <span>Learn AI with Google</span>
                </Link>
                <Link href="/career-paths" onClick={() => { setMobileMenuOpen(false); setExploreOpen(false); }} className="font-semibold text-slate-800 hover:text-[#FF6B35]">
                  Launch a New Career (In-demand Careers)
                </Link>
                <Link href="/certificates" onClick={() => { setMobileMenuOpen(false); setExploreOpen(false); }} className="font-semibold text-slate-800 hover:text-[#FF6B35]">
                  Prepare for a Certification
                </Link>
                <Link href="/practice" onClick={() => { setMobileMenuOpen(false); setExploreOpen(false); }} className="font-semibold text-slate-800 hover:text-[#FF6B35]">
                  Practice with Coding & Arenas
                </Link>
                <div className="h-px bg-slate-200 my-1" />
                <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Categories</div>
                {["Development", "Business", "Finance & Accounting", "IT & Software", "Office Productivity", "Design", "Marketing"].map((name) => (
                  <Link key={name} href={`/courses?category=${encodeURIComponent(name)}`} onClick={() => { setMobileMenuOpen(false); setExploreOpen(false); }} className="text-slate-700 hover:text-[#FF6B35]">
                    {name}
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]"
            >
              Browse All Courses
            </Link>

            {/* Practice Mobile Drawer */}
            <button
              type="button"
              onClick={() => setMobilePracticeOpen(!mobilePracticeOpen)}
              aria-expanded={mobilePracticeOpen}
              className="py-2 text-left border-b border-[#F7F8FA] flex justify-between items-center"
            >
              <span className="flex items-center gap-2">
                <span>Practice</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#FF6B35]">5 Tracks</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobilePracticeOpen ? "rotate-180" : ""}`} />
            </button>
            {mobilePracticeOpen && (
              <div className="pl-3 py-2 space-y-2.5 border-b border-[#F7F8FA] bg-slate-50/70 rounded-xl p-2.5 text-sm">
                <Link
                  href="/practice/codearena"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#172033] hover:text-[#FF6B35]"
                >
                  <Code2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <div>CodeArena</div>
                    <div className="text-[10px] text-[#64748B] font-normal">100 levels of progressive coding challenges</div>
                  </div>
                </Link>
                <Link
                  href="/practice/webforge"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#172033] hover:text-[#FF6B35]"
                >
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div>WebForge</div>
                    <div className="text-[10px] text-[#64748B] font-normal">Frontend & backend sandboxes</div>
                  </div>
                </Link>
                <Link
                  href="/practice/querymaster"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#172033] hover:text-[#FF6B35]"
                >
                  <Database className="w-4 h-4 text-purple-600" />
                  <div>
                    <div>QueryMaster</div>
                    <div className="text-[10px] text-[#64748B] font-normal">Relational database SQL puzzles</div>
                  </div>
                </Link>
                <Link
                  href="/practice/bughunter"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#172033] hover:text-[#FF6B35]"
                >
                  <Bug className="w-4 h-4 text-rose-600" />
                  <div>
                    <div>BugHunter</div>
                    <div className="text-[10px] text-[#64748B] font-normal">Find & fix production defects</div>
                  </div>
                </Link>
                <Link
                  href="/practice/cloudstudio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 py-1 text-xs font-semibold text-[#172033] hover:text-[#FF6B35]"
                >
                  <Braces className="w-4 h-4 text-amber-600" />
                  <div>
                    <div>CloudStudio</div>
                    <div className="text-[10px] text-[#64748B] font-normal">Run & test code in Python, JS, TS</div>
                  </div>
                </Link>
                <Link
                  href="/practice"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block pt-1.5 text-[11px] font-bold text-[#FF6B35]"
                >
                  View All Practice Tracks →
                </Link>
              </div>
            )}
            <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA] flex items-center justify-between">
              <span>Wishlist</span><span className="text-xs text-[#64748B]">{wishlistIds.length}</span>
            </Link>
            <Link
              href="/career-paths"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]"
            >
              Career Paths
            </Link>
            <Link href="/personal-plan" onClick={() => setMobileMenuOpen(false)} className="border-b border-[#F7F8FA] py-2 hover:text-[#FF6B35]">Personal Plan</Link>
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
            {isAuthenticated && <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]">My Profile</Link>}
            {isAuthenticated && user.role === "learner" && <Link href="/certificates" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]">My Certificates</Link>}
            {isAuthenticated && user.role === "learner" && <Link href="/instructor/apply" onClick={() => setMobileMenuOpen(false)} className="py-2 hover:text-[#FF6B35] border-b border-[#F7F8FA]">Teach on Elevate</Link>}
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
