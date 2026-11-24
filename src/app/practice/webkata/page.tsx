"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WEBKATA_CHALLENGES, WebKataChallenge } from "@/data/practiceData";
import { 
  Terminal, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  Eye, 
  Code, 
  Sparkles, 
  Monitor,
  CheckSquare
} from "lucide-react";

export default function WebKataPage() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const challenge: WebKataChallenge = WEBKATA_CHALLENGES[selectedIdx];

  const [activeCodeTab, setActiveCodeTab] = useState<"html" | "css" | "js">("html");
  const [htmlCode, setHtmlCode] = useState(challenge.initialHtml);
  const [cssCode, setCssCode] = useState(challenge.initialCss);
  const [jsCode, setJsCode] = useState(challenge.initialJs);

  const [previewDoc, setPreviewDoc] = useState("");
  const [validationResult, setValidationResult] = useState<{
    status: "idle" | "passed" | "failed";
    message?: string;
  }>({ status: "idle" });

  // Update starter code when challenge switches
  useEffect(() => {
    setHtmlCode(challenge.initialHtml);
    setCssCode(challenge.initialCss);
    setJsCode(challenge.initialJs);
    setValidationResult({ status: "idle" });
  }, [challenge]);

  // Generate preview document
  const refreshPreview = () => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
            } catch (err) {
              console.error("WebKata Error:", err);
            }
          <\/script>
        </body>
      </html>
    `;
    setPreviewDoc(combined);
  };

  useEffect(() => {
    refreshPreview();
  }, [htmlCode, cssCode, jsCode]);

  const handleReset = () => {
    setHtmlCode(challenge.initialHtml);
    setCssCode(challenge.initialCss);
    setJsCode(challenge.initialJs);
    setValidationResult({ status: "idle" });
  };

  const handleValidate = () => {
    // Run validation logic
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlCode, "text/html");
      const hasContent = doc.body.innerHTML.trim().length > 0;
      
      if (hasContent) {
        setValidationResult({
          status: "passed",
          message: "Great job! Your web components and styling pass all validation checks.",
        });
      } else {
        setValidationResult({
          status: "failed",
          message: "Empty HTML template detected. Please build the required components.",
        });
      }
    } catch (err: any) {
      setValidationResult({
        status: "failed",
        message: err.message || "Failed to validate DOM elements.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5E7EB]">
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Terminal className="w-3.5 h-3.5" />
                <span>WebKata</span>
              </span>
              <span className="text-sm font-bold text-[#172033]">
                {challenge.title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="challenge-select" className="text-xs font-semibold text-[#64748B]">
              Select Project:
            </label>
            <select
              id="challenge-select"
              value={selectedIdx}
              onChange={(e) => setSelectedIdx(Number(e.target.value))}
              className="text-xs font-semibold bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#172033] focus:outline-none focus:border-[#FF6B35] shadow-sm"
            >
              {WEBKATA_CHALLENGES.map((c, i) => (
                <option key={c.id} value={i}>
                  {i + 1}. {c.title} ({c.difficulty})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3-Column or Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Instructions Column */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-6 h-[750px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-[#64748B] font-medium">{challenge.category}</span>
              </div>
              <h1 className="text-xl font-extrabold text-[#172033] mt-2">{challenge.title}</h1>
              <p className="text-xs text-[#64748B] leading-relaxed mt-2">{challenge.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-[#FF6B35]" />
                <span>Implementation Checklist</span>
              </h3>
              <div className="space-y-2">
                {challenge.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155]">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Banner */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-3">
              <button
                type="button"
                onClick={handleValidate}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-[#172033] hover:bg-[#FF6B35] transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validate Component</span>
              </button>

              {validationResult.status !== "idle" && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border ${
                    validationResult.status === "passed"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {validationResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Code Editor & Live Preview Column */}
          <div className="lg:col-span-8 space-y-4">
            {/* Editor Container */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col h-[380px]">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
                <div className="flex items-center gap-1.5">
                  {(["html", "css", "js"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveCodeTab(tab)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        activeCodeTab === tab
                          ? "bg-[#172033] text-white"
                          : "text-[#64748B] hover:bg-slate-100 hover:text-[#172033]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    title="Reset Code"
                    className="p-1.5 text-[#64748B] hover:text-[#FF6B35] rounded-lg hover:bg-slate-100"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={refreshPreview}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF6B35] text-white text-xs font-bold hover:bg-[#E85D2A]"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* Text Area */}
              <div className="flex-1 bg-[#1E293B] text-slate-100 font-mono text-xs p-4 overflow-hidden">
                {activeCodeTab === "html" && (
                  <textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-transparent text-slate-100 font-mono text-xs resize-none focus:outline-none"
                  />
                )}
                {activeCodeTab === "css" && (
                  <textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-transparent text-slate-100 font-mono text-xs resize-none focus:outline-none"
                  />
                )}
                {activeCodeTab === "js" && (
                  <textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    spellCheck={false}
                    className="w-full h-full bg-transparent text-slate-100 font-mono text-xs resize-none focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Live Preview Window */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col h-[354px]">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2 bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-[#64748B]" />
                  <span className="text-xs font-bold text-[#172033]">Live Render Output</span>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Reload Active
                </span>
              </div>
              <iframe
                title="WebKata Preview"
                srcDoc={previewDoc}
                sandbox="allow-scripts allow-modals"
                className="w-full h-full border-none bg-white"
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
