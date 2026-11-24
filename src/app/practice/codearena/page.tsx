"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  getElevate100PuzzleLevels, 
  ChessPuzzleLevel, 
  ChessCodePuzzle,
  INITIAL_USER_CHESS_STATE,
  ChessPuzzleUserState,
  ConceptTag
} from "@/lib/puzzleEngine";
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
  Sparkles,
  BookOpen,
  Map,
  X,
  Check
} from "lucide-react";

export default function CodeArenaPage() {
  const allLevels = getElevate100PuzzleLevels();

  // Load user progress from localStorage or default
  const [userState, setUserState] = useState<ChessPuzzleUserState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("elevate_chess_puzzles_progress");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_USER_CHESS_STATE;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("elevate_chess_puzzles_progress", JSON.stringify(userState));
    } catch (e) {}
  }, [userState]);

  const [currentLevelNum, setCurrentLevelNum] = useState<number>(userState.currentLevel || 1);
  const [currentPuzzleIdx, setCurrentPuzzleIdx] = useState<number>(0);
  const [showLevelMapModal, setShowLevelMapModal] = useState<boolean>(false);
  const [conceptFilter, setConceptFilter] = useState<string>("all");

  const currentLevel: ChessPuzzleLevel = allLevels[currentLevelNum - 1] || allLevels[0];
  const currentPuzzle: ChessCodePuzzle = currentLevel.puzzles[currentPuzzleIdx] || currentLevel.puzzles[0];

  const [selectedMoveOption, setSelectedMoveOption] = useState<string>("");
  const [customMoveInput, setCustomMoveInput] = useState<string>("");
  const [isInputModeCustom, setIsInputModeCustom] = useState<boolean>(false);

  const [moveStatus, setMoveStatus] = useState<"idle" | "evaluating" | "correct" | "blunder">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [ratingChange, setRatingChange] = useState<number | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [levelCompletedModal, setLevelCompletedModal] = useState<boolean>(false);

  // Reset puzzle input state on puzzle switch
  useEffect(() => {
    setSelectedMoveOption("");
    setCustomMoveInput("");
    setMoveStatus("idle");
    setFeedbackMessage("");
    setRatingChange(null);
    setShowHint(false);
    setShowAnalysis(false);
  }, [currentLevelNum, currentPuzzleIdx]);

  // Handle Level Selection
  const handleSelectLevel = (lvlNum: number) => {
    if (!userState.unlockedLevels.includes(lvlNum) && lvlNum > 1) return;
    setCurrentLevelNum(lvlNum);
    setCurrentPuzzleIdx(0);
    setShowLevelMapModal(false);
  };

  // Evaluate the move (like Chess.com)
  const handleSubmitMove = (chosenMove?: string) => {
    const move = (chosenMove !== undefined ? chosenMove : (isInputModeCustom ? customMoveInput : selectedMoveOption)).trim();
    if (!move) return;

    setMoveStatus("evaluating");

    setTimeout(() => {
      // Check if move matches expected or accepted alternatives
      const normalize = (s: string) => s.replace(/\s+/g, " ").replace(/['"]/g, '"').trim();
      const isCorrect = 
        normalize(move) === normalize(currentPuzzle.expectedLine) ||
        currentPuzzle.acceptedAlternatives.some(alt => normalize(move) === normalize(alt));

      if (isCorrect) {
        const ratingGain = 14;
        setMoveStatus("correct");
        setRatingChange(ratingGain);
        setFeedbackMessage("Excellent move! Puzzle solved (+14 Rating)");

        // Update user state
        setUserState((prev) => {
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

        // If this is the last puzzle in the level -> Level Completed!
        if (currentPuzzleIdx + 1 >= currentLevel.puzzleCount) {
          setTimeout(() => {
            handleCompleteLevel();
          }, 1200);
        } else {
          // Auto advance to next puzzle after 1.5s
          setTimeout(() => {
            setCurrentPuzzleIdx((prev) => prev + 1);
          }, 1500);
        }
      } else {
        const ratingLoss = -8;
        setMoveStatus("blunder");
        setRatingChange(ratingLoss);
        setFeedbackMessage("Blunder (-8 Rating). That move leads to an algorithmic defect. Try again or check the hint.");

        setUserState((prev) => ({
          ...prev,
          rating: Math.max(100, prev.rating + ratingLoss),
          streak: 0,
        }));
      }
    }, 250);
  };

  const handleCompleteLevel = () => {
    const nextLevel = currentLevelNum + 1;
    setUserState((prev) => {
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

  // Filtered levels for the Map Modal
  const filteredLevels = allLevels.filter((lvl) => {
    if (conceptFilter === "all") return true;
    return lvl.concept.toLowerCase().includes(conceptFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#172033]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col justify-between">
        {/* Top HUD: Chess.com Style Rating & Level Progress Bar */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl px-5 py-3.5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
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
                {currentLevel.title}
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

          {/* Center: Puzzle Progress Beads (● ● ● ○ ○ ○) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 select-none hidden sm:inline">
              Puzzle {currentPuzzleIdx + 1}/{currentLevel.puzzleCount}:
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
                    className={`w-3.5 h-3.5 rounded-full transition-all flex items-center justify-center text-[8px] font-bold ${
                      isCurrent
                        ? "ring-2 ring-[#FF6B35] bg-[#FF6B35] text-white scale-125"
                        : isSolved
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                    }`}
                    title={`Puzzle ${idx + 1}`}
                  >
                    {isSolved ? "✓" : idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Live Rating & Streak */}
          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B35] text-xs font-bold">
              <Flame className="w-4 h-4 fill-current animate-bounce" />
              <span>{userState.streak} Streak</span>
            </div>

            {/* Elo Rating Badge */}
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

        {/* Main Chess.com Style Puzzle Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
          {/* Left/Center 8 cols: The Board (Code Context & Move Choices) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* The Code Board */}
            <div
              className={`relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs flex flex-col min-h-[420px] ${
                moveStatus === "correct"
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : moveStatus === "blunder"
                  ? "border-rose-500 ring-2 ring-rose-500/20 animate-shake"
                  : "border-[#E5E7EB]"
              }`}
            >
              {/* Board Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-[#F8FAFC] border-b border-[#E5E7EB] text-xs font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-bold text-slate-700">elevate_tactics.py</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold">
                  Target Rating: {currentPuzzle.elo}
                </span>
              </div>

              {/* Code Surface */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="bg-[#0F172A] rounded-xl p-5 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed overflow-x-auto shadow-inner border border-slate-800">
                  <pre className="whitespace-pre-wrap">{currentPuzzle.codeContext}</pre>
                </div>

                {/* Tactical Prompt Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-orange-50 border border-orange-200/80 text-xs font-sans text-orange-950 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#172033] block text-xs">{currentPuzzle.title}</strong>
                    <p className="mt-0.5 text-slate-700 leading-normal">{currentPuzzle.prompt}</p>
                  </div>
                </div>
              </div>

              {/* Feedback Alert Overlay */}
              {moveStatus === "correct" && (
                <div className="px-5 py-3 bg-emerald-50 border-t border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {feedbackMessage}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold">Auto-advancing...</span>
                </div>
              )}

              {moveStatus === "blunder" && (
                <div className="px-5 py-3 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <span className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    {feedbackMessage}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setMoveStatus("idle"); setSelectedMoveOption(""); }}
                    className="text-xs underline text-rose-700 hover:text-rose-900 font-bold"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Tactical Move Selector (Choose Your Move like Chess.com) */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Find the Winning Move:
                  </span>
                </div>

                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={() => setIsInputModeCustom(!isInputModeCustom)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-[#FF6B35] transition-colors"
                >
                  {isInputModeCustom ? "Switch to Tactical Choices" : "Switch to Free Code Input"}
                </button>
              </div>

              {!isInputModeCustom ? (
                /* 4 Tactical Move Choices */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentPuzzle.options.map((option, idx) => {
                    const isSelected = selectedMoveOption === option;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={moveStatus === "evaluating"}
                        onClick={() => {
                          setSelectedMoveOption(option);
                          handleSubmitMove(option);
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left font-mono text-xs transition-all flex items-center justify-between group ${
                          isSelected
                            ? "bg-[#FF6B35] border-[#FF6B35] text-white shadow-md shadow-orange-500/20"
                            : "bg-white border-slate-200 text-slate-800 hover:border-[#FF6B35] hover:bg-orange-50/20 shadow-xs"
                        }`}
                      >
                        <span className="truncate pr-2">{option}</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-sans font-bold shrink-0 ${
                          isSelected ? "bg-white text-[#FF6B35]" : "bg-slate-100 text-slate-700 group-hover:bg-[#FF6B35] group-hover:text-white"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Free Input Area */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customMoveInput}
                    onChange={(e) => setCustomMoveInput(e.target.value)}
                    placeholder="Type the winning line of code here (e.g. left += 1; right -= 1)..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6B35] focus:bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmitMove();
                    }}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSubmitMove()}
                      className="px-5 py-2.5 rounded-xl bg-[#FF6B35] text-white text-xs font-bold hover:bg-[#E85D2A] transition-all shadow-md shadow-orange-500/20"
                    >
                      Play Move ↵
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right 4 cols: Chess.com Style Analysis HUD */}
          <div className="lg:col-span-4 space-y-4">
            {/* Action Bar */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tactical Tools
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Hint Button */}
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    showHint
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{showHint ? "Hide Hint" : "Get Hint"}</span>
                </button>

                {/* Analysis / Solution */}
                <button
                  type="button"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    showAnalysis
                      ? "bg-blue-100 border-blue-300 text-blue-900"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>{showAnalysis ? "Hide Solution" : "Move Analysis"}</span>
                </button>
              </div>

              {/* Hint Content */}
              {showHint && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed animate-in fade-in">
                  {currentPuzzle.hint}
                </div>
              )}

              {/* Analysis Content */}
              {showAnalysis && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed space-y-1.5 animate-in fade-in">
                  <div className="font-bold text-[#172033]">Winning Move:</div>
                  <div className="font-mono text-emerald-700 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                    {currentPuzzle.expectedLine}
                  </div>
                  <p className="text-[11px] text-slate-600 pt-1">{currentPuzzle.analysis}</p>
                </div>
              )}

              {/* Skip to Next Puzzle */}
              <button
                type="button"
                onClick={() => {
                  if (currentPuzzleIdx + 1 < currentLevel.puzzleCount) {
                    setCurrentPuzzleIdx(currentPuzzleIdx + 1);
                  } else {
                    handleCompleteLevel();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#172033] hover:bg-[#FF6B35] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Next Puzzle</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Level Stats Card */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Level Overview</span>
                <span className="text-[#FF6B35]">Level {currentLevelNum}/100</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                  <span className="text-slate-500">Concept</span>
                  <span className="font-bold text-[#172033] uppercase">{currentLevel.concept}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                  <span className="text-slate-500">Theme</span>
                  <span className="font-bold text-slate-700">{currentLevel.theme}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E7EB]">
                  <span className="text-slate-500">Difficulty</span>
                  <span className="font-bold text-amber-600">{currentLevel.difficulty}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Solved in Level</span>
                  <span className="font-bold text-emerald-600">
                    {currentLevel.puzzles.filter(p => userState.completedPuzzles[p.id]).length} / {currentLevel.puzzleCount}
                  </span>
                </div>
              </div>
            </div>
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
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Map className="w-5 h-5 text-[#FF6B35]" />
                <h3 className="text-lg font-bold text-[#172033]">100-Level Chess-Style Puzzle Journey</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLevelMapModal(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Concept Filter Pills */}
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

            {/* Level Grid (1 to 100) */}
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
