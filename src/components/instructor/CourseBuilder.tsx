"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, CheckCircle2, ChevronRight, Video, FileText, HelpCircle, Save } from "lucide-react";

interface LessonDraft {
  id: string;
  title: string;
  duration: string;
  type: "video" | "reading" | "quiz";
}

interface SectionDraft {
  id: string;
  title: string;
  lessons: LessonDraft[];
}

export function CourseBuilder() {
  const [activeTab, setActiveTab] = useState<"basics" | "curriculum" | "pricing">("basics");
  const [title, setTitle] = useState("Advanced Next.js & AI Systems");
  const [subtitle, setSubtitle] = useState("Build production web applications with Next.js 15, Tailwind, and LLM integrations");
  const [category, setCategory] = useState("Development");
  const [level, setLevel] = useState("Intermediate");
  const [language, setLanguage] = useState("English");
  const [price, setPrice] = useState("1499");
  const [originalPrice, setOriginalPrice] = useState("2999");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [sections, setSections] = useState<SectionDraft[]>([
    {
      id: "sec-1",
      title: "01. Introduction & Modern Next.js Paradigms",
      lessons: [
        { id: "les-1", title: "Overview & Environment Config", duration: "12 mins", type: "video" },
        { id: "les-2", title: "Server Components vs Client Boundaries", duration: "25 mins", type: "video" },
      ],
    },
    {
      id: "sec-2",
      title: "02. AI Integrations & Tool Calling",
      lessons: [
        { id: "les-3", title: "Streaming LLM Tokens in UI", duration: "30 mins", type: "video" },
      ],
    },
  ]);

  const addSection = () => {
    const newSec: SectionDraft = {
      id: `sec-${Date.now()}`,
      title: `0${sections.length + 1}. New Curriculum Module`,
      lessons: [],
    };
    setSections([...sections, newSec]);
  };

  const addLesson = (secId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: [
              ...sec.lessons,
              {
                id: `les-${Date.now()}`,
                title: "New Lecture Lesson",
                duration: "15 mins",
                type: "video",
              },
            ],
          };
        }
        return sec;
      })
    );
  };

  const removeLesson = (secId: string, lesId: string) => {
    setSections(
      sections.map((sec) => {
        if (sec.id === secId) {
          return {
            ...sec,
            lessons: sec.lessons.filter((l) => l.id !== lesId),
          };
        }
        return sec;
      })
    );
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033]">Course Studio Builder</h1>
          <p className="text-xs text-[#64748B] mt-1">Design course modules, lectures, quizzes, and publish settings</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 bg-[#FF6B35] hover:bg-[#E85D2A] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{savedSuccess ? "Saved Successfully! ✓" : "Save Draft"}</span>
          </button>
        </div>
      </div>

      {/* Builder Step Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-3 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("basics")}
          className={`pb-2 transition-colors ${
            activeTab === "basics" ? "text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          1. Course Basics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("curriculum")}
          className={`pb-2 transition-colors ${
            activeTab === "curriculum" ? "text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          2. Curriculum & Lessons
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pricing")}
          className={`pb-2 transition-colors ${
            activeTab === "pricing" ? "text-[#FF6B35] border-b-2 border-[#FF6B35]" : "text-[#64748B] hover:text-[#172033]"
          }`}
        >
          3. Pricing & Launch
        </button>
      </div>

      {/* Tab 1: Basics */}
      {activeTab === "basics" && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
              Course Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
              Course Subtitle
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#172033] focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold text-[#172033]"
              >
                <option value="Development">Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="AI & ML">AI & ML</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold text-[#172033]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
                Primary Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold text-[#172033]"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Curriculum Builder */}
      {activeTab === "curriculum" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172033]">Curriculum Structure</h3>
            <button
              type="button"
              onClick={addSection}
              className="inline-flex items-center gap-1.5 bg-[#172033] hover:bg-[#FF6B35] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F7F8FA] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSections(
                        sections.map((s) => (s.id === section.id ? { ...s, title: val } : s))
                      );
                    }}
                    className="font-bold text-sm text-[#172033] bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 max-w-md focus:outline-none focus:border-[#FF6B35]"
                  />
                  <button
                    type="button"
                    onClick={() => addLesson(section.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Lesson</span>
                  </button>
                </div>

                {/* Lesson List */}
                <div className="space-y-2">
                  {section.lessons.map((les) => (
                    <div
                      key={les.id}
                      className="bg-white p-3 rounded-xl border border-[#E5E7EB] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-4 h-4 text-[#FF6B35]" />
                        <span className="font-semibold text-[#172033]">{les.title}</span>
                        <span className="text-[#64748B]">({les.duration})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLesson(section.id, les.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Delete lecture"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Pricing */}
      {activeTab === "pricing" && (
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
              Course Price (₹ INR)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#172033]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase mb-1.5">
              Original / Crossed-out Price (₹ INR)
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm text-[#172033]"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E7EB]">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-sm rounded-xl transition-colors"
            >
              Publish to Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
