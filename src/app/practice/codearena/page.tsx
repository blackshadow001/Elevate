"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  getElevate100PuzzleLevels, 
  CodingChallenge, 
  ChallengeLevel,
  INITIAL_USER_CHALLENGE_STATE,
  ChallengeUserState,
  TestCase
} from "@/lib/puzzleEngine";
import { evaluateChallengeCode, EvaluationOutcome, SupportedLanguage } from "@/lib/codeEvaluator";
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight,
  Flame, 
  Trophy, 
  HelpCircle, 
  Lightbulb, 
  Star, 
  Lock, 
  Unlock, 
  Layers, 
  Code2, 
  BadgeCheck,
  BookOpen,
  Map,
  X,
  Check,
  FileCode,
  History,
  MessageSquare,
  Terminal,
  Settings,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown
} from "lucide-react";

export default function CodeArenaPage() {
  const allLevels = getElevate100PuzzleLevels();

  // Load user progress from localStorage or default
  const [userState, setUserState] = useState<ChallengeUserState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("elevate_coding_challenges_progress") || localStorage.getItem("elevate_chess_puzzles_progress");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USER_CHALLENGE_STATE;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("elevate_coding_challenges_progress", JSON.stringify(userState));
    } catch (e) {}
  }, [userState]);

  const [currentLevelNum, setCurrentLevelNum] = useState<number>(userState.currentLevel || 1);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState<number>(0);
  const [showLevelMapModal, setShowLevelMapModal] = useState<boolean>(false);
  const [conceptFilter, setConceptFilter] = useState<string>("all");

  const currentLevel: ChallengeLevel = allLevels[currentLevelNum - 1] || allLevels[0];
  const currentPuzzle: CodingChallenge = currentLevel.puzzles[currentPuzzleIdx] || currentLevel.puzzles[0];

  // HackerRank Workspace State
  const [activeLeftTab, setActiveLeftTab] = useState<"problem" | "submissions" | "discussions" | "editorial">("problem");
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("python");
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("dark");
  const [userCode, setUserCode] = useState<string>("");
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState<number>(0);
  const [evaluationOutcome, setEvaluationOutcome] = useState<EvaluationOutcome | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [levelCompletedModal, setLevelCompletedModal] = useState<boolean>(false);
  const [editorialRevealed, setEditorialRevealed] = useState<boolean>(false);

  // Submissions history
  const [submissionsHistory, setSubmissionsHistory] = useState<{
    id: string;
    timestamp: string;
    status: "Passed" | "Failed";
    language: string;
    runtime: string;
  }[]>([]);

  // Initialize or reset starter code when switching puzzle or language
  useEffect(() => {
    const starter = currentPuzzle.starterBoilerplate[selectedLanguage] || currentPuzzle.starterBoilerplate.python;
    setUserCode(starter);
    setEvaluationOutcome(null);
    setRatingChange(null);
    setEditorialRevealed(false);
    setActiveTestCaseTab(0);
  }, [currentLevelNum, currentPuzzleIdx, selectedLanguage]);

  // Handle Level Selection
  const handleSelectLevel = (lvlNum: number) => {
    if (!userState.unlockedLevels.includes(lvlNum) && lvlNum > 1) return;
    setCurrentLevelNum(lvlNum);
    setCurrentPuzzleIdx(0);
    setShowLevelMapModal(false);
  };

  // Run Code (Runs against visible sample testcases 0 & 1)
  const handleRunCode = () => {
    setIsEvaluating(true);
    setIsConsoleOpen(true);

    setTimeout(() => {
      const sampleTestCases = currentPuzzle.testCases.filter(tc => !tc.isHidden);
      const outcome = evaluateChallengeCode(
        userCode,
        selectedLanguage,
        currentPuzzle.functionName,
        sampleTestCases
      );
      setEvaluationOutcome(outcome);
      setIsEvaluating(false);
    }, 450);
  };

  // Submit Code (Runs against ALL testcases including hidden ones)
  const handleSubmitCode = () => {
    setIsEvaluating(true);
    setIsConsoleOpen(true);

    setTimeout(() => {
      const outcome = evaluateChallengeCode(
        userCode,
        selectedLanguage,
        currentPuzzle.functionName,
        currentPuzzle.testCases
      );
      setEvaluationOutcome(outcome);
      setIsEvaluating(false);

      // Record submission
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSubmissionsHistory(prev => [
        {
          id: Math.random().toString(36).substring(7),
          timestamp: nowStr,
          status: outcome.allPassed ? "Passed" : "Failed",
          language: selectedLanguage.toUpperCase(),
          runtime: `${Math.floor(Math.random() * 20 + 15)} ms`,
        },
        ...prev,
      ]);

      if (outcome.allPassed) {
        const ratingGain = 14;
        setRatingChange(ratingGain);

        setUserState((prev: ChallengeUserState) => {
          const newStreak = prev.streak + 1;
          const newRating = prev.rating + ratingGain;
          const newSolvedCount = prev.solvedPuzzlesCount + 1;
          const newCompleted = { ...prev.completedPuzzles, [currentPuzzle.id]: true };

          return {
            ...prev,
            rating: newRating,
            streak: newStreak,
            bestStreak: Math.max(prev.bestStreak, newStreak),
            solvedPuzzlesCount: newSolvedCount,
            completedPuzzles: newCompleted,
          };
        });

        // Check if level cleared
        if (currentPuzzleIdx + 1 >= currentLevel.puzzleCount) {
          setTimeout(() => {
            handleCompleteLevel();
          }, 1200);
        }
      } else {
        const ratingLoss = -8;
        setRatingChange(ratingLoss);
        setUserState((prev: ChallengeUserState) => ({
          ...prev,
          rating: Math.max(100, prev.rating + ratingLoss),
          streak: 0,
        }));
      }
    }, 600);
  };

  const handleCompleteLevel = () => {
    const nextLevel = currentLevelNum + 1;
    setUserState((prev: ChallengeUserState) => {
      const newUnlocked = prev.unlockedLevels.includes(nextLevel)
        ? prev.unlockedLevels
        : [...prev.unlockedLevels, nextLevel];
      const newStars = { ...prev.starsMap, [currentLevelNum]: 3 };

      return {
        ...prev,
        unlockedLevels: newUnlocked,
        starsMap: newStars,
      };
    });

    setLevelCompletedModal(true);
  };

  const handleNextLevelFromModal = () => {
    setLevelCompletedModal(false);
    if (currentLevelNum < 100) {
      setCurrentLevelNum(currentLevelNum + 1);
      setCurrentPuzzleIdx(0);
    }
  };

  const filteredLevels = allLevels.filter((lvl) => {
    if (conceptFilter === "all") return true;
    return lvl.concept.toLowerCase().includes(conceptFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#172033]">
      <Navbar />

      <main className="flex-1 max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 w-full flex flex-col justify-between">
        {/* Top HUD: HackerRank Rating & 100-Level Roadmap */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3.5 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Level Info & Map Trigger */}
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              title="Practice Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
                  Level {currentLevelNum} of 100
                </span>
                <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[10px] font-mono text-[#FF6B35] border border-orange-200/80">
                  {currentLevel.concept.toUpperCase()}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-[#172033] truncate max-w-[280px] sm:max-w-md">
                {currentPuzzle.title}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setShowLevelMapModal(true)}
              className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B35]/10 border border-[#FF6B35]/25 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white transition-all shadow-xs"
            >
              <Map className="w-3.5 h-3.5" />
              <span>100 Levels Map</span>
            </button>
          </div>

          {/* Center: Puzzle Progress Beads */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 select-none hidden sm:inline">
              Challenge {currentPuzzleIdx + 1}/{currentLevel.puzzleCount}:
            </span>
            <div className="flex items-center gap-1.5">
              {currentLevel.puzzles.map((p, idx) => {
                const isSolved = userState.completedPuzzles[p.id];
                const isCurrent = idx === currentPuzzleIdx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentPuzzleIdx(idx)}
                    className={`w-4 h-4 rounded-full transition-all flex items-center justify-center text-[9px] font-bold ${
                      isCurrent
                        ? "ring-2 ring-[#FF6B35] bg-[#FF6B35] text-white scale-125"
                        : isSolved
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                    }`}
                    title={`Challenge ${idx + 1}`}
                  >
                    {isSolved ? "✓" : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Live Rating & Streak */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B35] text-xs font-bold">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>{userState.streak} Streak</span>
            </div>

            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Elo Rating</div>
                <div className="text-sm font-black text-[#172033] font-mono flex items-center gap-1">
                  <span>{userState.rating}</span>
                  {ratingChange !== null && (
                    <span
                      className={`text-xs font-bold animate-in fade-in duration-200 ${
                        ratingChange > 0 ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {ratingChange > 0 ? `+${ratingChange}` : ratingChange}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main HackerRank Split Problem Solving Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[760px] items-stretch">
          
          {/* Left Column (5 cols): Problem Description, Tabs & Constraints */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden">
            {/* HackerRank Tab Bar */}
            <div className="flex items-center border-b border-[#E5E7EB] bg-[#F8FAFC] px-3">
              {[
                { id: "problem", label: "Problem", icon: FileCode },
                { id: "submissions", label: "Submissions", icon: History },
                { id: "discussions", label: "Discussions", icon: MessageSquare },
                { id: "editorial", label: "Editorial", icon: Lightbulb },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeLeftTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLeftTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                      isActive
                        ? "border-[#FF6B35] text-[#FF6B35] bg-white"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700 leading-relaxed max-h-[720px]">
              {activeLeftTab === "problem" && (
                <>
                  {/* Title & Metadata */}
                  <div>
                    <h2 className="text-lg font-black text-[#172033] tracking-tight">
                      {currentPuzzle.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {currentLevel.difficulty}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span className="font-mono text-slate-600">Target Rating: {currentPuzzle.elo}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-slate-500 font-semibold">Max Score: 100</span>
                    </div>
                  </div>

                  {/* Problem Statement Narrative */}
                  <div className="space-y-3">
                    <p className="whitespace-pre-line text-slate-800 font-normal leading-relaxed text-[13px]">
                      {currentPuzzle.problemStatement}
                    </p>
                  </div>

                  {/* Example Box */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Example
                    </h4>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-mono text-xs">
                      <div><strong className="text-slate-600 font-sans">Input: </strong> {currentPuzzle.example.input}</div>
                      <div><strong className="text-slate-600 font-sans">Output: </strong> <span className="text-emerald-700 font-bold">{currentPuzzle.example.output}</span></div>
                      <p className="font-sans text-[11px] text-slate-600 pt-1 border-t border-slate-200 mt-1">
                        {currentPuzzle.example.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Function Description */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Function Description
                    </h4>
                    <p className="text-[12px] text-slate-700">
                      Complete the function <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-orange-700 font-bold">{currentPuzzle.functionDescription.name}</code> in the editor below.
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px]">
                      <div className="font-semibold text-slate-700">Parameters:</div>
                      {currentPuzzle.functionDescription.parameters.map((p, i) => (
                        <div key={i} className="pl-2 font-mono text-slate-600">
                          • {p.type} <span className="font-bold text-slate-800">{p.name}</span>
                        </div>
                      ))}
                      <div className="font-semibold text-slate-700 pt-1">Returns:</div>
                      <div className="pl-2 text-slate-600">
                        • {currentPuzzle.functionDescription.returns}
                      </div>
                    </div>
                  </div>

                  {/* Constraints */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Constraints
                    </h4>
                    <ul className="space-y-1 list-disc pl-5 text-[12px] font-mono text-slate-700">
                      {currentPuzzle.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Input / Output Format */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Input Format</h4>
                      <p className="text-[12px] text-slate-700 mt-1">{currentPuzzle.inputFormat}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Output Format</h4>
                      <p className="text-[12px] text-slate-700 mt-1">{currentPuzzle.outputFormat}</p>
                    </div>
                  </div>

                  {/* Sample Test Case 0 */}
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Sample Test Case 0</h4>
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-sans font-bold text-slate-500 uppercase">Sample Input</div>
                        <div className="mt-1 text-slate-800">{currentPuzzle.testCases[0]?.input}</div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-sans font-bold text-slate-500 uppercase">Sample Output</div>
                        <div className="mt-1 text-emerald-700 font-bold">{currentPuzzle.testCases[0]?.expectedOutput}</div>
                      </div>
                    </div>
                    {currentPuzzle.testCases[0]?.explanation && (
                      <p className="text-[11px] text-slate-600 italic">
                        Explanation: {currentPuzzle.testCases[0].explanation}
                      </p>
                    )}
                  </div>
                </>
              )}

              {activeLeftTab === "submissions" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#172033]">Submission History</h3>
                  {submissionsHistory.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
                      No submissions recorded yet for this challenge. Click "Submit Code" to test against all test cases.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {submissionsHistory.map((sub) => (
                        <div key={sub.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className={`font-bold ${sub.status === "Passed" ? "text-emerald-600" : "text-rose-600"}`}>
                              {sub.status === "Passed" ? "✓ Accepted" : "✗ Wrong Answer"}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-0.5">{sub.timestamp} · {sub.language}</div>
                          </div>
                          <span className="font-mono text-slate-600 text-[11px]">{sub.runtime}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeLeftTab === "discussions" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#172033]">Community Discussions</h3>
                  <div className="space-y-3">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">Deepak S. · 2 days ago</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">O(N) Solution</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Remember to consider when characters at multiple adjacent indices are identical. You can remove any of the duplicates!
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">Ananya R. · 4 days ago</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Corner Case</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Make sure to handle the case where the difference happens at the very end of the string.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeLeftTab === "editorial" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[#172033]">Editorial & Algorithmic Analysis</h3>
                  {!editorialRevealed ? (
                    <div className="p-6 text-center bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-3">
                      <Lightbulb className="w-8 h-8 text-amber-500 mx-auto" />
                      <div>
                        <h4 className="font-bold text-amber-900">Are you sure you want to reveal the hint?</h4>
                        <p className="text-[11px] text-amber-700 mt-1">Try to solve the challenge on your own first to maximize problem-solving muscle memory.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditorialRevealed(true)}
                        className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-xs"
                      >
                        Reveal Editorial Hint
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in">
                      <div className="font-bold text-[#172033]">Algorithmic Invariant:</div>
                      <p className="text-slate-700">{currentPuzzle.hint}</p>
                      <div className="pt-2 border-t border-slate-200">
                        <div className="font-bold text-[#172033]">Complexity Target:</div>
                        <p className="text-slate-600 text-[11px]">{currentPuzzle.analysis}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): HackerRank Code Editor & Test Cases Console */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col overflow-hidden">
            {/* Editor Top Toolbar */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#FF6B35]"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java 17</option>
                    <option value="cpp">C++17</option>
                  </select>
                </div>

                {/* Theme Toggle */}
                <button
                  type="button"
                  onClick={() => setEditorTheme(editorTheme === "dark" ? "light" : "dark")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white"
                >
                  {editorTheme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{editorTheme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const starter = currentPuzzle.starterBoilerplate[selectedLanguage] || currentPuzzle.starterBoilerplate.python;
                    setUserCode(starter);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Code</span>
                </button>
              </div>
            </div>

            {/* Code Editor Surface with Line Numbers */}
            <div className={`relative flex-1 flex flex-col font-mono text-xs overflow-hidden ${
              editorTheme === "dark" ? "bg-[#0F172A] text-slate-100" : "bg-white text-slate-900"
            }`}>
              <div className="flex-1 flex overflow-hidden">
                {/* Line Numbers Gutter */}
                <div className={`py-4 px-3 select-none text-right font-mono text-xs ${
                  editorTheme === "dark" ? "bg-[#090D16] text-slate-600 border-r border-slate-800" : "bg-slate-50 text-slate-400 border-r border-slate-200"
                }`}>
                  {Array.from({ length: Math.max(18, userCode.split("\n").length + 2) }).map((_, i) => (
                    <div key={i} className="leading-5 h-5">{i + 1}</div>
                  ))}
                </div>

                {/* Editable Code Textarea */}
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  className={`w-full h-full p-4 font-mono text-xs leading-5 focus:outline-none resize-none overflow-auto whitespace-pre bg-transparent ${
                    editorTheme === "dark" ? "text-emerald-400" : "text-slate-900"
                  }`}
                  placeholder="// Complete the function below..."
                />
              </div>

              {/* Bottom Action Bar: Run Code & Submit Code (HackerRank Style) */}
              <div className={`p-3 border-t flex items-center justify-between ${
                editorTheme === "dark" ? "bg-[#090D16] border-slate-800" : "bg-[#F8FAFC] border-slate-200"
              }`}>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Test Cases Console</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isConsoleOpen ? "rotate-180" : ""}`} />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Run Code */}
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={handleRunCode}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Code</span>
                  </button>

                  {/* Submit Code */}
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={handleSubmitCode}
                    className="px-5 py-2 rounded-xl bg-[#FF6B35] text-white hover:bg-[#E85D2A] font-bold text-xs transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5"
                  >
                    <span>Submit Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Test Cases Console Drawer (HackerRank Style) */}
            {isConsoleOpen && (
              <div className="border-t border-[#E5E7EB] bg-white p-4 space-y-3 max-h-60 overflow-y-auto">
                <div className="flex items-center justify-between">
                  {/* Testcase Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {currentPuzzle.testCases.map((tc, idx) => {
                      const res = evaluationOutcome?.results.find(r => r.testCaseId === tc.id);
                      return (
                        <button
                          key={tc.id}
                          type="button"
                          onClick={() => setActiveTestCaseTab(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                            activeTestCaseTab === idx
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {res && (
                            <span className={res.status === "passed" ? "text-emerald-400" : "text-rose-400"}>
                              {res.status === "passed" ? "✓" : "✗"}
                            </span>
                          )}
                          <span>Testcase {tc.id} {tc.isHidden ? "(Hidden)" : ""}</span>
                        </button>
                      );
                    })}
                  </div>

                  {evaluationOutcome && (
                    <div className="text-xs font-bold flex items-center gap-3">
                      {evaluationOutcome.allPassed ? (
                        <>
                          <span className="text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>All {evaluationOutcome.totalCount} Testcases Passed!</span>
                          </span>
                          {currentPuzzleIdx + 1 < currentLevel.puzzleCount && (
                            <button
                              type="button"
                              onClick={() => setCurrentPuzzleIdx(currentPuzzleIdx + 1)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Next Challenge →
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          <span>Failed ({evaluationOutcome.passedCount}/{evaluationOutcome.totalCount} passed)</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Testcase Details */}
                {(() => {
                  const currentTC = currentPuzzle.testCases[activeTestCaseTab] || currentPuzzle.testCases[0];
                  const res = evaluationOutcome?.results.find(r => r.testCaseId === currentTC.id);

                  return (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs font-mono">
                      {currentTC.isHidden && !evaluationOutcome?.allPassed ? (
                        <div className="p-4 text-center text-slate-500 font-sans">
                          🔒 Hidden test case (Executed on "Submit Code" to test algorithm edge conditions).
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Input</span>
                            <div className="mt-1 text-slate-800 break-all">{currentTC.input}</div>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Your Output</span>
                            <div className={`mt-1 font-bold break-all ${
                              res?.status === "passed" ? "text-emerald-600" : res?.status === "error" ? "text-rose-600" : "text-slate-800"
                            }`}>
                              {res?.actualOutput || "(Click 'Run Code' to test)"}
                            </div>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Expected Output</span>
                            <div className="mt-1 text-emerald-700 font-bold break-all">{currentTC.expectedOutput}</div>
                          </div>
                        </div>
                      )}

                      {res && (
                        <div className="text-[11px] font-sans text-slate-500 pt-1 flex justify-between">
                          <span>Status: <strong className={res.status === "passed" ? "text-emerald-600" : "text-rose-600"}>{res.status.toUpperCase()}</strong></span>
                          <span>Execution Time: {res.runtimeMs} ms</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Level Completed Celebration Modal */}
      {levelCompletedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-md w-full p-7 text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <div className="flex justify-center gap-1.5 text-amber-400 mb-2">
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
                <Star className="w-6 h-6 fill-current" />
              </div>
              <h2 className="text-2xl font-black text-[#172033]">Level {currentLevelNum} Cleared!</h2>
              <p className="text-xs text-slate-500 mt-1">{currentLevel.title}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex justify-around">
              <div>
                <div className="text-slate-500">New Rating</div>
                <div className="text-lg font-black text-[#172033] font-mono">{userState.rating}</div>
              </div>
              <div>
                <div className="text-slate-500">Stars Earned</div>
                <div className="text-lg font-black text-amber-500 font-mono">⭐⭐⭐</div>
              </div>
              <div>
                <div className="text-slate-500">Next Unlock</div>
                <div className="text-lg font-black text-emerald-600 font-mono">Level {currentLevelNum + 1}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextLevelFromModal}
              className="w-full py-3.5 rounded-xl bg-[#FF6B35] hover:bg-[#E85D2A] text-white font-bold text-sm transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2"
            >
              <span>Continue to Level {currentLevelNum + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 100 Levels Map Modal */}
      {showLevelMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-[#E5E7EB] rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Map className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="text-lg font-bold text-[#172033]">100-Level Coding Challenge Roadmap</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelMapModal(false)}
                aria-label="Close level roadmap"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 border-b border-[#E5E7EB] bg-slate-50/50 flex gap-2 overflow-x-auto text-xs">
              {[
                { id: "all", label: "All 100 Levels" },
                { id: "python beginner", label: "Python Basics (1-10)" },
                { id: "arrays", label: "Arrays & Pointers (11-20)" },
                { id: "hash maps", label: "Hash Maps (21-30)" },
                { id: "stacks", label: "Stacks & Queues (31-40)" },
                { id: "nodes", label: "Nodes (41-50)" },
                { id: "search", label: "Search & Binary (51-60)" },
                { id: "trees", label: "Binary Trees (61-80)" },
                { id: "algorithms", label: "Graphs & DFS (81-90)" },
                { id: "dynamic programming", label: "Grandmaster DP (91-100)" },
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setConceptFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    conceptFilter === f.id
                      ? "bg-[#FF6B35] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {filteredLevels.map((lvl) => {
                const isUnlocked = userState.unlockedLevels.includes(lvl.levelNumber) || lvl.levelNumber === 1;
                const isCurrent = lvl.levelNumber === currentLevelNum;
                const stars = userState.starsMap[lvl.levelNumber] || 0;

                return (
                  <button
                    key={lvl.levelNumber}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => handleSelectLevel(lvl.levelNumber)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                      isCurrent
                        ? "bg-orange-50 border-2 border-[#FF6B35] text-[#FF6B35] shadow-xs"
                        : isUnlocked
                        ? "bg-white border-slate-200 text-slate-800 hover:border-[#FF6B35] hover:shadow-xs"
                        : "bg-slate-50 border-slate-100 text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold">
                        Lvl {lvl.levelNumber}
                      </span>
                      {isUnlocked ? (
                        <div className="flex text-amber-500 text-[10px]">
                          {stars > 0 ? "⭐".repeat(stars) : <span className="text-slate-400 text-[9px]">unlocked</span>}
                        </div>
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-bold line-clamp-1 text-[#172033]">
                        {lvl.theme}
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                        {lvl.baseElo} Elo
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
