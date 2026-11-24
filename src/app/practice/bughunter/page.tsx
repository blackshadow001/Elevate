"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  FIXTHECODE_CHALLENGES, 
  FixTheCodeChallenge 
} from "@/data/practiceData";
import { 
  Bug, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Wrench,
  Check,
  Code2,
  Terminal,
  Filter
} from "lucide-react";

const SUPPORTED_LANGUAGES = ["All", "Python", "JavaScript", "Java", "C++", "TypeScript"] as const;

export default function BugHunterPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");

  const filteredChallenges = selectedLanguage === "All"
    ? FIXTHECODE_CHALLENGES
    : FIXTHECODE_CHALLENGES.filter(c => c.language.toLowerCase() === selectedLanguage.toLowerCase());

  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(FIXTHECODE_CHALLENGES[0].id);

  // Derive active challenge
  const activeChallenge = FIXTHECODE_CHALLENGES.find(c => c.id === selectedChallengeId) || filteredChallenges[0] || FIXTHECODE_CHALLENGES[0];

  const [code, setCode] = useState(activeChallenge.buggyCode);
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<{
    status: "idle" | "passed" | "failed";
    message?: string;
  }>({ status: "idle" });

  const handleChallengeChange = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
    const target = FIXTHECODE_CHALLENGES.find(c => c.id === challengeId);
    if (target) {
      setCode(target.buggyCode);
      setResult({ status: "idle" });
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const newFiltered = lang === "All"
      ? FIXTHECODE_CHALLENGES
      : FIXTHECODE_CHALLENGES.filter(c => c.language.toLowerCase() === lang.toLowerCase());
    
    if (newFiltered.length > 0) {
      setSelectedChallengeId(newFiltered[0].id);
      setCode(newFiltered[0].buggyCode);
      setResult({ status: "idle" });
    }
  };

  const handleReset = () => {
    setCode(activeChallenge.buggyCode);
    setResult({ status: "idle" });
  };

  const runTestFix = () => {
    setIsTesting(true);

    setTimeout(() => {
      try {
        const testOutcome = activeChallenge.testFunction(code);
        setResult({
          status: testOutcome.passed ? "passed" : "failed",
          message: testOutcome.message,
        });
      } catch (err: any) {
        setResult({
          status: "failed",
          message: err.message || "Execution exception thrown.",
        });
      } finally {
        setIsTesting(false);
      }
    }, 250);
  };

  const getLanguageColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case "python": return "bg-blue-50 text-blue-700 border-blue-200";
      case "javascript": return "bg-amber-50 text-amber-700 border-amber-200";
      case "typescript": return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "java": return "bg-orange-50 text-orange-700 border-orange-200";
      case "c++": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Breadcrumbs, Language Filter & Switcher */}
        <div className="flex flex-col gap-4 mb-6 pb-4 border-b border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/practice"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#FF6B35] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Practice Hub</span>
              </Link>
              <span className="text-[#CBD5E1]">/</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                  <Bug className="w-3.5 h-3.5" />
                  <span>BugHunter</span>
                </span>
                <span className="text-sm font-bold text-[#172033]">
                  {activeChallenge.title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="bug-select" className="text-xs font-semibold text-[#64748B]">
                Select Defect:
              </label>
              <select
                id="bug-select"
                value={activeChallenge.id}
                onChange={(e) => handleChallengeChange(e.target.value)}
                className="text-xs font-semibold bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#172033] focus:outline-none focus:border-[#FF6B35] shadow-xs"
              >
                {filteredChallenges.map((c, i) => (
                  <option key={c.id} value={c.id}>
                    [{c.language}] {c.title} ({c.difficulty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Language:</span>
            </span>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const count = lang === "All" 
                ? FIXTHECODE_CHALLENGES.length 
                : FIXTHECODE_CHALLENGES.filter(c => c.language.toLowerCase() === lang.toLowerCase()).length;
              const isActive = selectedLanguage === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? "bg-[#FF6B35] text-white border-[#FF6B35] shadow-xs" 
                      : "bg-white text-[#475569] border-[#E2E8F0] hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span>{lang}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Diagnostics Brief & Error Log */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs p-6 space-y-6 h-[720px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                  {activeChallenge.difficulty}
                </span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-md border ${getLanguageColor(activeChallenge.language)}`}>
                  {activeChallenge.language}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-[#172033] mt-2">{activeChallenge.title}</h1>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2">{activeChallenge.description}</p>
            </div>

            {/* Error Diagnostics Box */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Captured Production Error Log</span>
              </h3>
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 font-mono text-xs text-rose-900 leading-relaxed whitespace-pre-wrap">
                {activeChallenge.errorLog}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#FF6B35]" />
                <span>Your Debugging Goal</span>
              </h3>
              <ul className="text-xs text-[#475569] space-y-2 list-disc list-inside">
                <li>Identify the root cause of the logic or syntax defect in the editor.</li>
                <li>Refactor the implementation while preserving original function signatures.</li>
                <li>Verify your fix by running the unit test suite below.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Code Editor & Test Evaluation */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col h-[720px]">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-[#172033]">
                  {activeChallenge.language} Buggy Source
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset to Buggy State"
                  className="p-1.5 text-[#64748B] hover:text-[#FF6B35] rounded-lg hover:bg-slate-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isTesting}
                  onClick={runTestFix}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test My Fix</span>
                </button>
              </div>
            </div>

            {/* Code Textarea */}
            <div className="flex-1 bg-[#1E293B] text-slate-100 font-mono text-xs p-4 flex overflow-hidden">
              <div className="w-8 select-none text-right pr-2 text-slate-500 font-mono text-[11px] leading-relaxed border-r border-slate-800">
                {Array.from({ length: Math.max(12, code.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 pl-3 bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Test Result Bar */}
            <div className="border-t border-[#E5E7EB] bg-white p-4">
              {result.status === "passed" && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{result.message}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const curIdx = filteredChallenges.findIndex(c => c.id === activeChallenge.id);
                      const nextChallenge = filteredChallenges[(curIdx + 1) % filteredChallenges.length];
                      if (nextChallenge) handleChallengeChange(nextChallenge.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shrink-0 ml-3"
                  >
                    Next Defect →
                  </button>
                </div>
              )}

              {result.status === "failed" && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs font-semibold">
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{result.message}</span>
                </div>
              )}

              {result.status === "idle" && (
                <div className="text-xs text-[#94A3B8] font-mono bg-slate-50 p-3 rounded-xl border border-dashed border-slate-200">
                  Refactor the {activeChallenge.language} defect above and click &quot;Test My Fix&quot; to evaluate against the automated validation suite.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
