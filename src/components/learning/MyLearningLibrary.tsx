"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowRight, BookOpen, Flame, ListPlus, Search, Undo2 } from "lucide-react";
import { CourseThumbnail } from "@/components/courses/CourseThumbnail";
import { useLearningState } from "@/lib/learningState";

type Library = {
  lists: Array<{ id: string; name: string; courseIds: string[] }>;
  archivedCourseIds: string[];
  weekly: { completedLessons: number; goal: number; streakWeeks: number };
};
type Tab = "all" | "lists" | "archived";

export function MyLearningLibrary() {
  const { enrolledCourses, loading, error } = useLearningState();
  const [library, setLibrary] = useState<Library | null>(null);
  const [libraryError, setLibraryError] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [selectedList, setSelectedList] = useState("");
  const [newListName, setNewListName] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [instructor, setInstructor] = useState("");
  const [progress, setProgress] = useState("");
  const [sort, setSort] = useState("recent");
  const [busy, setBusy] = useState(false);

  async function loadLibrary() {
    const response = await fetch("/api/me/library", { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || "Unable to load your library.");
    setLibrary(body.data);
    setSelectedList((current) => current && body.data.lists.some((list: Library["lists"][number]) => list.id === current)
      ? current : body.data.lists[0]?.id || "");
  }
  useEffect(() => {
    let active = true;
    fetch("/api/me/library", { cache: "no-store" }).then(async (response) => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to load your library.");
      if (active) { setLibrary(body.data); setSelectedList(body.data.lists[0]?.id || ""); }
    }).catch((reason) => { if (active) setLibraryError(reason instanceof Error ? reason.message : "Unable to load your library."); });
    return () => { active = false; };
  }, []);
  async function act(action: string, fields: Record<string, string>) {
    setBusy(true);
    setLibraryError("");
    try {
      const response = await fetch("/api/me/library", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...fields }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Unable to update your library.");
      if (action === "create-list") { setNewListName(""); setSelectedList(body.data.listId); }
      await loadLibrary();
    } catch (reason) { setLibraryError(reason instanceof Error ? reason.message : "Unable to update your library."); }
    finally { setBusy(false); }
  }

  const archived = useMemo(() => new Set(library?.archivedCourseIds || []), [library]);
  const currentList = library?.lists.find((list) => list.id === selectedList);
  const categories = [...new Set(enrolledCourses.map((course) => course.category).filter(Boolean))].sort();
  const instructors = [...new Set(enrolledCourses.map((course) => course.instructorName).filter(Boolean))].sort();
  const visible = enrolledCourses.filter((course) => {
    if (tab === "archived" ? !archived.has(course.courseId) : archived.has(course.courseId)) return false;
    if (tab === "lists" && !currentList?.courseIds.includes(course.courseId)) return false;
    if (category && course.category !== category) return false;
    if (instructor && course.instructorName !== instructor) return false;
    if (progress === "not-started" && course.progressPercent !== 0) return false;
    if (progress === "in-progress" && (course.progressPercent === 0 || course.progressPercent === 100)) return false;
    if (progress === "completed" && course.progressPercent !== 100) return false;
    return `${course.courseTitle} ${course.instructorName}`.toLowerCase().includes(query.trim().toLowerCase());
  }).sort((a, b) => sort === "title" ? a.courseTitle.localeCompare(b.courseTitle)
    : sort === "progress" ? b.progressPercent - a.progressPercent
    : b.enrolledAt.localeCompare(a.enrolledAt));
  const week = library?.weekly;
  const percent = week ? Math.min(100, Math.round(week.completedLessons / week.goal * 100)) : 0;

  return <section className="bg-white" aria-label="My learning library">
    <div className="bg-[#171820] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <h1 className="text-4xl sm:text-5xl font-bold">My learning</h1>
        <nav aria-label="Learning sections" className="mt-7 flex gap-6 overflow-x-auto whitespace-nowrap text-sm">
          <button type="button" onClick={() => setTab("all")} className={`pb-4 ${tab === "all" ? "border-b-2 border-white font-bold" : "text-slate-300"}`}>All courses</button>
          <button type="button" onClick={() => setTab("lists")} className={`pb-4 ${tab === "lists" ? "border-b-2 border-white font-bold" : "text-slate-300"}`}>My Lists</button>
          <Link href="/wishlist" className="pb-4 text-slate-300 hover:text-white">Wishlist</Link>
          <Link href="/certificates" className="pb-4 text-slate-300 hover:text-white">Certifications</Link>
          <button type="button" onClick={() => setTab("archived")} className={`pb-4 ${tab === "archived" ? "border-b-2 border-white font-bold" : "text-slate-300"}`}>Archived</button>
          <a href="#learning-tools" className="pb-4 text-slate-300 hover:text-white">Learning tools</a>
        </nav>
      </div>
    </div>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="rounded-2xl border border-[#D9DCE8] p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div><h2 className="text-xl font-bold text-[#172033]">{week?.streakWeeks ? "Keep your weekly streak going" : "Start a weekly streak"}</h2><p className="mt-1 text-sm text-[#64748B]">Complete {week?.goal ?? 3} lessons in a week to build a streak.</p></div>
        <div className="flex items-center gap-7"><div className="flex items-center gap-2"><Flame className="h-7 w-7 text-[#FF6B35]" /><div><strong className="text-xl">{week?.streakWeeks ?? 0}</strong> <span className="text-sm">weeks</span><p className="text-xs text-[#64748B]">Current streak</p></div></div><div className="flex items-center gap-3"><div role="progressbar" aria-valuenow={week?.completedLessons ?? 0} aria-valuemin={0} aria-valuemax={week?.goal ?? 3} aria-label="Weekly lesson goal" className="grid h-14 w-14 place-items-center rounded-full" style={{ background: `conic-gradient(#FF6B35 ${percent}%, #E5E7EB 0)` }}><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-xs font-bold">{percent}%</span></div><div className="text-sm"><strong>{week?.completedLessons ?? 0}/{week?.goal ?? 3}</strong> lessons<p className="text-xs text-[#64748B]">This week</p></div></div></div>
      </div>
      {libraryError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{libraryError}</p>}
      {tab === "lists" && <div className="rounded-2xl border border-[#E5E7EB] p-5 space-y-4"><h2 className="font-bold text-[#172033]">My Lists</h2><form onSubmit={(event) => { event.preventDefault(); if (newListName.trim()) void act("create-list", { name: newListName }); }} className="flex flex-wrap gap-2"><label htmlFor="new-list-name" className="sr-only">New list name</label><input id="new-list-name" value={newListName} onChange={(event) => setNewListName(event.target.value)} maxLength={60} placeholder="Name a new list" className="min-w-0 flex-1 rounded-lg border border-[#D9DCE8] px-3 py-2 text-sm" /><button type="submit" disabled={busy || !newListName.trim()} className="rounded-lg bg-[#172033] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Create list</button></form>{library?.lists.length ? <div className="flex flex-wrap gap-2">{library.lists.map((list) => <button type="button" key={list.id} onClick={() => setSelectedList(list.id)} className={`rounded-full px-4 py-2 text-sm ${selectedList === list.id ? "bg-[#FF6B35] text-white" : "bg-[#F7F8FA] text-[#172033]"}`}>{list.name} ({list.courseIds.length})</button>)}</div> : <p className="text-sm text-[#64748B]">No lists yet. Create one to organize enrolled courses.</p>}{currentList && <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={busy} onClick={() => { const name = prompt("Rename list", currentList.name); if (name?.trim()) void act("rename-list", { listId: currentList.id, name }); }} className="text-sm font-semibold text-[#172033] underline disabled:opacity-50">Rename list</button><button type="button" disabled={busy} onClick={() => { if (confirm(`Delete “${currentList.name}”? Courses and progress will remain in your library.`)) void act("delete-list", { listId: currentList.id }); }} className="text-sm font-semibold text-red-600 underline disabled:opacity-50">Delete list</button></div>}</div>}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="learning-category">Category</label><select id="learning-category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-2 text-sm"><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><label className="sr-only" htmlFor="learning-progress">Progress</label><select id="learning-progress" value={progress} onChange={(event) => setProgress(event.target.value)} className="rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-2 text-sm"><option value="">Any progress</option><option value="not-started">Not started</option><option value="in-progress">In progress</option><option value="completed">Completed</option></select><label className="sr-only" htmlFor="learning-instructor">Instructor</label><select id="learning-instructor" value={instructor} onChange={(event) => setInstructor(event.target.value)} className="rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-2 text-sm"><option value="">All instructors</option>{instructors.map((item) => <option key={item}>{item}</option>)}</select></div><div className="flex items-center gap-2"><label htmlFor="learning-search" className="sr-only">Search my courses</label><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" /><input id="learning-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search my courses" className="w-full rounded-lg border border-[#D9DCE8] py-2 pl-9 pr-3 text-sm" /></div></div></div>
      <div className="flex items-center justify-between gap-3"><strong className="text-sm text-[#172033]">{visible.length} {visible.length === 1 ? "course" : "courses"}</strong><label className="text-sm text-[#64748B]">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)} className="ml-1 rounded-lg border border-[#D9DCE8] p-2 text-[#172033]"><option value="recent">Recently enrolled</option><option value="title">Title</option><option value="progress">Most progress</option></select></label></div>
      {loading || (!library && !libraryError) ? <div role="status" className="rounded-2xl border border-[#E5E7EB] p-10 text-sm text-[#64748B]">Loading your courses…</div> : error || !library ? <p role="alert" className="text-sm text-red-700">{error || libraryError}</p> : visible.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{visible.map((course) => <article key={course.courseId} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white"><Link href={`/courses/${course.courseSlug}`} aria-label={`View details for ${course.courseTitle}`}><CourseThumbnail category={course.category} title={course.courseTitle} imageUrl={course.courseImage} /></Link><div className="p-5 space-y-3"><p className="text-xs font-semibold text-[#FF6B35]">{course.category}</p><h3 className="font-bold text-[#172033] line-clamp-2"><Link href={`/courses/${course.courseSlug}`} className="hover:text-[#E85D2A]">{course.courseTitle}</Link></h3><p className="text-xs text-[#64748B]">{course.instructorName}</p><div className="flex justify-between text-xs"><span>{course.completedLessons} of {course.totalLessons} lessons</span><strong>{course.progressPercent}%</strong></div><div role="progressbar" aria-valuenow={course.progressPercent} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.courseTitle} progress`} className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]"><div className="h-full bg-[#FF6B35]" style={{ width: `${course.progressPercent}%` }} /></div><div className="flex flex-wrap items-center gap-2 pt-1"><Link href={course.lastLessonId ? `/learn/${course.courseSlug}/${course.lastLessonId}` : `/courses/${course.courseSlug}`} className="inline-flex items-center gap-1 rounded-lg bg-[#172033] px-3 py-2 text-xs font-bold text-white">{course.progressPercent === 100 ? "Review" : "Continue"}<ArrowRight className="h-3 w-3" /></Link><button type="button" disabled={busy} onClick={() => void act(archived.has(course.courseId) ? "unarchive" : "archive", { courseId: course.courseId })} className="inline-flex items-center gap-1 rounded-lg border border-[#D9DCE8] px-3 py-2 text-xs font-semibold text-[#172033] disabled:opacity-50">{archived.has(course.courseId) ? <Undo2 className="h-3 w-3" /> : <Archive className="h-3 w-3" />}{archived.has(course.courseId) ? "Restore" : "Archive"}</button></div>{library.lists.length > 0 && <div className="flex items-center gap-2"><ListPlus className="h-4 w-4 text-[#64748B]" /><label htmlFor={`course-list-${course.courseId}`} className="sr-only">Add {course.courseTitle} to a list</label><select id={`course-list-${course.courseId}`} disabled={busy} value="" onChange={(event) => { if (event.target.value) void act("add-to-list", { listId: event.target.value, courseId: course.courseId }); }} className="min-w-0 flex-1 rounded-lg border border-[#D9DCE8] p-2 text-xs"><option value="">Add to list…</option>{library.lists.filter((list) => !list.courseIds.includes(course.courseId)).map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></div>}{tab === "lists" && currentList && <button type="button" disabled={busy} onClick={() => void act("remove-from-list", { listId: currentList.id, courseId: course.courseId })} className="text-xs text-red-600 underline disabled:opacity-50">Remove from this list</button>}</div></article>)}</div> : <div className="rounded-2xl border border-[#E5E7EB] p-10 text-center"><BookOpen className="mx-auto h-8 w-8 text-[#94A3B8]" /><p className="mt-3 text-sm text-[#64748B]">{tab === "archived" ? "No archived courses." : tab === "lists" ? "No courses in this list. Add an enrolled course from All courses." : enrolledCourses.length ? "No courses match these filters." : "You have not enrolled in a course yet."}</p>{!enrolledCourses.length && <Link href="/courses" className="mt-3 inline-block text-sm font-bold text-[#FF6B35]">Browse courses</Link>}</div>}
    </div>
  </section>;
}
