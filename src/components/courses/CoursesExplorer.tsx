"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw 
} from "lucide-react";
import { Course } from "@/types";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCardSkeleton } from "@/components/ui/Skeleton";
import { CatalogArtwork } from "@/components/courses/CatalogArtwork";
import { Reveal } from "@/components/ui/Reveal";
import { catalogCategory } from "@/lib/catalogTaxonomy";
import { MICRO_COURSE_TOPICS } from "@/lib/microCourseTopics";

interface CoursesExplorerProps {
  initialCourses: Course[];
  initialCategories: Array<{ id: string; name: string; subcategories: string[] }>;
}

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const LANGUAGES = ["English", "Tamil", "Hindi"];
const RATINGS = [
  { label: "4.5 & up", value: 4.5 },
  { label: "4.0 & up", value: 4.0 },
];
const categoryKey = (value: string) => value.toLowerCase().replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function CoursesExplorer({ initialCourses, initialCategories }: CoursesExplorerProps) {
  const searchParams = useSearchParams();
  return <CoursesExplorerInner key={searchParams.toString()} initialCourses={initialCourses} initialCategories={initialCategories} initialCategory={searchParams.get("category")} initialSubcategory={searchParams.get("subcategory") || ""} initialSearch={searchParams.get("search") || ""} />;
}

function CoursesExplorerInner({ initialCourses, initialCategories, initialCategory, initialSubcategory, initialSearch }: CoursesExplorerProps & { initialCategory: string | null; initialSubcategory: string; initialSearch: string }) {
  const router = useRouter();
  const allCourses = initialCourses;
  const categoryNames = initialCategories.map(({ name }) => name);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? categoryNames.filter((name) => categoryKey(name) === categoryKey(catalogCategory(initialCategory)) || categoryKey(name) === categoryKey(initialCategory)) : []
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcategory);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle helpers
  const toggleCategory = (cat: string) => {
    setSelectedSubcategory("");
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleLevel = (lvl: string) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategory("");
    setSelectedLevels([]);
    setSelectedLanguages([]);
    setSelectedRating(null);
    setSelectedType(null);
    setSearch("");
    router.replace("/courses");
  };

  // Filter & Sort Logic
  const filteredCourses = useMemo(() => {
    return allCourses
      .filter((course) => {
        // Search query
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = course.title.toLowerCase().includes(q);
          const matchInstructor = course.instructor.name.toLowerCase().includes(q);
          const matchSub = course.subtitle.toLowerCase().includes(q);
          const matchCat = course.category.toLowerCase().includes(q);
          const matchLearn = course.whatYouWillLearn.some((w) => w.toLowerCase().includes(q));
          if (!matchTitle && !matchInstructor && !matchSub && !matchCat && !matchLearn) return false;
        }

        // Category filter
        if (selectedCategories.length > 0) {
          const matchCat = selectedCategories.some(
            (c) => categoryKey(c) === categoryKey(course.category)
          );
          if (!matchCat) return false;
        }
        if (selectedSubcategory && course.subcategory !== selectedSubcategory) return false;

        // Level filter
        if (selectedLevels.length > 0) {
          if (!selectedLevels.includes(course.level)) return false;
        }

        // Language filter
        if (selectedLanguages.length > 0) {
          if (!selectedLanguages.includes(course.language)) return false;
        }

        // Rating filter
        if (selectedRating !== null) {
          if (course.rating < selectedRating) return false;
        }

        // Paid / Free
        if (selectedType === "Free" && course.price > 0) return false;
        if (selectedType === "Paid" && course.price === 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.studentsCount - a.studentsCount;
        if (sortBy === "newest") return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        return 0;
      });
  }, [
    allCourses,
    search,
    selectedCategories,
    selectedSubcategory,
    selectedLevels,
    selectedLanguages,
    selectedRating,
    selectedType,
    sortBy,
  ]);

  const upcomingTopics = useMemo(() => {
    const publishedTitles = new Set(allCourses.map((course) => course.title.trim().toLocaleLowerCase()));
    const query = search.trim().toLocaleLowerCase();
    return MICRO_COURSE_TOPICS.flatMap((topic) => {
      const category = initialCategories.find((item) => item.name === topic.category || item.id === categoryKey(topic.category));
      if (!category || publishedTitles.has(topic.title.toLocaleLowerCase())) return [];
      if (query && !`${topic.title} ${category.name} ${topic.subcategory}`.toLocaleLowerCase().includes(query)) return [];
      if (selectedCategories.length && !selectedCategories.includes(category.name)) return [];
      if (selectedSubcategory && selectedSubcategory !== topic.subcategory) return [];
      if (selectedLanguages.length && !selectedLanguages.includes("Tamil")) return [];
      if (selectedLevels.length || selectedRating !== null || selectedType === "Free") return [];
      return [{ ...topic, categoryName: category.name, categoryId: category.id }];
    }).sort((a, b) => sortBy === "price-low" ? a.suggestedPrice - b.suggestedPrice : sortBy === "price-high" ? b.suggestedPrice - a.suggestedPrice : 0);
  }, [allCourses, initialCategories, search, selectedCategories, selectedSubcategory, selectedLanguages, selectedLevels, selectedRating, selectedType, sortBy]);
  const [upcomingLimit, setUpcomingLimit] = useState(12);

  const activeFiltersCount =
    selectedCategories.length +
    (selectedSubcategory ? 1 : 0) +
    selectedLevels.length +
    selectedLanguages.length +
    (selectedRating ? 1 : 0) +
    (selectedType ? 1 : 0);

  return (
    <div className="py-10">
      {/* Search Header Banner */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
          All Courses
        </h1>
        <p className="mt-2 text-base text-[#64748B]">
          Learn something new. Build something useful.
        </p>

        {/* Big Search Bar */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
          <input
            type="text"
            aria-label="Search courses, skills, or instructors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for courses, skills, instructors..."
            className="w-full bg-white border border-[#E5E7EB] rounded-full pl-12 pr-10 py-3.5 text-sm text-[#172033] placeholder:text-[#64748B] focus:outline-none focus:border-[#FF6B35] shadow-sm transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      <section aria-label="Explore categories" className="mb-10 rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-bold uppercase tracking-widest text-[#D65B28]">Explore categories</p><h2 className="mt-1 text-2xl font-extrabold text-[#172033]">Browse every subject</h2><p className="mt-1 text-sm text-[#64748B]">See published courses and upcoming Tamil lessons in each category.</p></div>
          <span className="text-xs font-semibold text-[#64748B]">{allCourses.length} published · {MICRO_COURSE_TOPICS.length} planned</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {initialCategories.map(({ id, name }) => {
            const count = allCourses.filter((course) => course.category === name).length;
            const plannedTopics = MICRO_COURSE_TOPICS.filter((topic) => topic.category === name || id === categoryKey(topic.category));
            const active = selectedCategories.includes(name);
            return <button key={id} type="button" onClick={() => { setSelectedCategories(active ? [] : [name]); setSelectedSubcategory(""); }}
              aria-pressed={active} className={`group flex min-h-56 flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-[transform,box-shadow,border-color] duration-700 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(23,32,51,0.10)] motion-reduce:transform-none motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D65B28] ${active ? "border-[#FF6B35] ring-2 ring-[#FF6B35]/20" : "border-[#E1E6ED] hover:border-[#C6D0DF]"}`}>
              <CatalogArtwork categoryId={id} className="h-24 w-full" />
              <span className="flex flex-1 flex-col p-4">
                <span className="text-sm font-extrabold leading-snug text-[#172033]">{name}</span>
                <span className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#69778C]">{plannedTopics.slice(0, 2).map((topic) => topic.title).join(" · ") || "Explore courses in this subject"}</span>
                <span className="mt-auto border-t border-[#EDF0F4] pt-3 text-xs font-semibold text-[#56657B]">{count} live · {plannedTopics.length} planned</span>
              </span>
            </button>;
          })}
        </div>
        {selectedCategories.length === 1 && <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#E5E7EB] pt-4">
          <span className="mr-1 text-xs font-bold text-[#475569]">Explore topics</span>
          {(initialCategories.find((item) => item.name === selectedCategories[0])?.subcategories || []).map((name) => <button key={name} type="button" onClick={() => setSelectedSubcategory(selectedSubcategory === name ? "" : name)}
            aria-pressed={selectedSubcategory === name} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${selectedSubcategory === name ? "bg-[#172033] text-white" : "border border-[#D4DAE3] bg-white text-[#172033] hover:border-[#FF6B35]"}`}>{name}</button>)}
        </div>}
      </section>

      {allCourses.some((course) => course.language === "Tamil") && <section className="mb-10">
        <h2 className="text-xl font-extrabold text-[#172033]">Explore Tamil courses</h2>
        <p className="mt-1 text-sm text-[#64748B]">Published lessons taught in Tamil.</p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {allCourses.filter((course) => course.language === "Tamil").sort((a, b) => b.studentsCount - a.studentsCount).slice(0, 4).map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>}

      {upcomingTopics.length > 0 && <section aria-label="Upcoming micro-courses" className="mb-12 rounded-3xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D65B28]">In preparation</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#172033]">Coming soon in Tamil</h2>
            <p className="mt-2 max-w-2xl text-sm text-[#64748B]">Explore planned micro-courses. Prices shown are suggested starting prices; videos and final prices are confirmed before release.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#475569]">{upcomingTopics.length} {upcomingTopics.length === 1 ? "topic" : "topics"}</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {upcomingTopics.slice(0, upcomingLimit).map((topic) => <article key={topic.title} className="group flex min-h-72 flex-col overflow-hidden rounded-2xl border border-[#E2E7EE] bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-700 ease-out hover:-translate-y-0.5 hover:border-[#C6D0DF] hover:shadow-[0_16px_30px_rgba(23,32,51,0.10)] motion-reduce:transform-none motion-reduce:transition-none">
            <CatalogArtwork categoryId={topic.categoryId} topicTitle={topic.title} className="h-28 w-full" />
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2"><span className="rounded-full bg-[#FFF0E9] px-2.5 py-1 text-[11px] font-bold text-[#B84D25]">Coming soon</span><span className="text-xs font-semibold text-[#64748B]">Tamil</span></div>
              <h3 className="mt-4 text-base font-extrabold leading-snug text-[#172033]">{topic.title}</h3>
              <p className="mt-1 text-xs text-[#64748B]">{topic.categoryName} · {topic.subcategory}</p>
              <div className="mt-auto flex items-end justify-between border-t border-[#EEF0F3] pt-3"><span className="text-xs text-[#64748B]">Suggested price</span><span className="text-lg font-black text-[#172033]">₹{topic.suggestedPrice}</span></div>
            </div>
          </article>)}
        </div>
        {upcomingLimit < upcomingTopics.length && <button type="button" onClick={() => setUpcomingLimit((current) => current + 12)} className="mt-6 rounded-xl border border-[#D4DAE3] bg-white px-4 py-2 text-sm font-bold text-[#172033] hover:border-[#FF6B35]">Show more topics</button>}
      </section>}

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2 font-bold text-base text-[#172033]">
                <SlidersHorizontal className="w-4 h-4 text-[#FF6B35]" />
                <span>Filter By</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-[#FF6B35] hover:underline flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#172033]">Category</h3>
              <div className="space-y-2">
                {categoryNames.map((cat) => {
                  const checked = selectedCategories.some(
                    (c) => categoryKey(c) === categoryKey(cat)
                  );
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer hover:text-[#FF6B35] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-[#E5E7EB] text-[#FF6B35] focus:ring-[#FF6B35] w-4 h-4 accent-[#FF6B35]"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Level Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#172033]">Level</h3>
              <div className="space-y-2">
                {LEVELS.map((lvl) => {
                  const checked = selectedLevels.includes(lvl);
                  return (
                    <label
                      key={lvl}
                      className="flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer hover:text-[#FF6B35] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLevel(lvl)}
                        className="rounded border-[#E5E7EB] accent-[#FF6B35] w-4 h-4"
                      />
                      <span>{lvl}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Language Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#172033]">Language</h3>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => {
                  const checked = selectedLanguages.includes(lang);
                  return (
                    <label
                      key={lang}
                      className="flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer hover:text-[#FF6B35] select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLanguage(lang)}
                        className="rounded border-[#E5E7EB] accent-[#FF6B35] w-4 h-4"
                      />
                      <span>{lang}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#172033]">Rating</h3>
              <div className="space-y-2">
                {RATINGS.map((rat) => (
                  <label
                    key={rat.label}
                    className="flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer hover:text-[#FF6B35] select-none"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === rat.value}
                      onChange={() => setSelectedRating(rat.value)}
                      className="accent-[#FF6B35] w-4 h-4"
                    />
                    <span>⭐ {rat.label}</span>
                  </label>
                ))}
                {selectedRating !== null && (
                  <button
                    type="button"
                    onClick={() => setSelectedRating(null)}
                    className="text-xs text-[#FF6B35] hover:underline block pt-1"
                  >
                    Clear rating
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-bold text-[#172033]">Price</h3>
              {["Free", "Paid"].map((type) => (
                <label key={type} className="flex items-center gap-2.5 text-sm text-[#172033] cursor-pointer">
                  <input type="radio" name="price-desktop" checked={selectedType === type} onChange={() => setSelectedType(type)} className="accent-[#FF6B35] w-4 h-4" />
                  {type}
                </label>
              ))}
              {selectedType && <button type="button" onClick={() => setSelectedType(null)} className="text-xs text-[#FF6B35] hover:underline">Clear price</button>}
            </div>
          </div>
        </aside>

        {/* Right Content Area: Toolbar + Courses */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top Bar: Count & Sort */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#172033]">
                Showing <span className="text-[#FF6B35]">{filteredCourses.length}</span> of {allCourses.length} courses
              </span>

              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 text-xs font-bold text-[#172033] bg-[#F7F8FA] border border-[#E5E7EB] px-3 py-1.5 rounded-lg hover:border-[#FF6B35]"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B35]" />
                <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ""}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-[#64748B] font-medium whitespace-nowrap">Sort by:</span>
              <select
                aria-label="Sort courses"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#172033] focus:outline-none focus:border-[#FF6B35]"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div data-testid="catalog-results" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, idx) => (
                <Reveal key={course.id} direction="up" delay={0.04 * (idx % 3)}>
                  <CourseCard course={course} />
                </Reveal>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF6B35] mx-auto flex items-center justify-center text-2xl font-bold">
                🔍
              </div>
              <h3 className="text-xl font-bold text-[#172033]">{upcomingTopics.length ? "No published courses yet" : "No courses found"}</h3>
              <p className="text-sm text-[#64748B] max-w-md mx-auto">
                {upcomingTopics.length ? "The topics above are planned. Their videos will appear here after approval." : "We couldn't find any published or planned courses matching your criteria. Try another filter."}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 bg-[#FF6B35] text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-[#E85D2A] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset all filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Drawer Filter Dialog */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <h3 className="text-base font-bold text-[#172033]">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close filters"
                  className="p-1 text-slate-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category */}
              <div>
                <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2">Category</h4>
                <div className="space-y-2">
                  {categoryNames.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="accent-[#FF6B35]"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Level */}
              <div>
                <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2">Level</h4>
                <div className="space-y-2">
                  {LEVELS.map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(lvl)}
                        onChange={() => toggleLevel(lvl)}
                        className="accent-[#FF6B35]"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2">Rating</h4>
                {RATINGS.map((rating) => (
                  <label key={rating.value} className="flex items-center gap-2 text-sm py-1">
                    <input type="radio" name="rating-mobile" checked={selectedRating === rating.value} onChange={() => setSelectedRating(rating.value)} className="accent-[#FF6B35]" />
                    {rating.label}
                  </label>
                ))}
                {selectedRating !== null && <button type="button" onClick={() => setSelectedRating(null)} className="text-xs text-[#FF6B35]">Clear rating</button>}
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase text-[#64748B] mb-2">Price</h4>
                {["Free", "Paid"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm py-1">
                    <input type="radio" name="price-mobile" checked={selectedType === type} onChange={() => setSelectedType(type)} className="accent-[#FF6B35]" />
                    {type}
                  </label>
                ))}
                {selectedType && <button type="button" onClick={() => setSelectedType(null)} className="text-xs text-[#FF6B35]">Clear price</button>}
              </div>
            </div>

            <div className="pt-6 border-t border-[#E5E7EB] flex gap-2">
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-1/2 py-2.5 text-xs font-bold text-[#172033] border border-[#E5E7EB] rounded-lg"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 text-xs font-bold text-white bg-[#FF6B35] rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
