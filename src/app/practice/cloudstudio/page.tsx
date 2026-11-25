"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { runPythonScript } from "@/lib/pythonInterpreter";
import { stripTypeScriptTypes } from "@/lib/codeEvaluator";
import {
  Braces,
  ArrowLeft,
  Play,
  RotateCcw,
  Copy,
  Download,
  Terminal,
  Clock,
  Trash2,
  Check,
  Monitor,
} from "lucide-react";

type SupportedLanguage = "javascript" | "python" | "typescript" | "html";

const TEMPLATES: Record<SupportedLanguage, { label: string; code: string; stdin?: string }[]> = {
  javascript: [
    {
      label: "Fibonacci & Metrics",
      code: `// Elevate CloudStudio — JavaScript (ES6+)
function fibonacci(n) {
  const sequence = [0, 1];
  for (let i = 2; i < n; i++) {
    sequence.push(sequence[i - 1] + sequence[i - 2]);
  }
  return sequence;
}

console.log("Welcome to Elevate CloudStudio Compiler!");
console.log("First 10 Fibonacci numbers:", fibonacci(10));

const learners = [
  { name: "Karthik", track: "Full Stack", score: 98 },
  { name: "Priya", track: "AI & ML", score: 95 },
  { name: "Suresh", track: "Cloud Architecture", score: 92 }
];
learners.forEach(l => console.log(\`• \${l.name} (\${l.track}): \${l.score}%\`));
`,
    },
    {
      label: "Stdin I/O Reader",
      stdin: "Elevate LMS\n42",
      code: `// Read lines from Standard Input (stdin) using readLine()
const platform = readLine();
const num = Number(readLine());

console.log("Platform:", platform);
console.log("Double value:", num * 2);
`,
    },
  ],
  python: [
    {
      label: "Metrics Calculator",
      code: `# Elevate CloudStudio — Python 3 Live Interpreter
def calculate_metrics(values):
    total = sum(values)
    mean = total / len(values) if len(values) > 0 else 0
    return {
        "count": len(values),
        "total": total,
        "average": round(mean, 2)
    }

print("Running Python 3 Sandbox on Elevate CloudStudio...")
sample_scores = [88, 92, 79, 95, 100, 84]
metrics = calculate_metrics(sample_scores)

for key, val in metrics.items():
    print(f" - {key.capitalize()}: {val}")
`,
    },
    {
      label: "Stdin & Recursion",
      stdin: "6",
      code: `# Reads input() directly from stdin box below
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

raw = input()
n = int(raw) if raw else 5
print(f"Factorial of {n} is {factorial(n)}")
`,
    },
  ],
  typescript: [
    {
      label: "Typed Learner Profile",
      code: `// Elevate CloudStudio — TypeScript Compiler
interface LearnerProfile {
  id: string;
  name: string;
  enrolledTrack: string;
  gpa: number;
}

function formatSummary(profile: LearnerProfile): string {
  return \`\${profile.name} [\${profile.id}] — \${profile.enrolledTrack} (GPA: \${profile.gpa})\`;
}

const learner: LearnerProfile = {
  id: "ELV-2026-904",
  name: "Arun Kumar",
  enrolledTrack: "Software Architecture & Next.js",
  gpa: 3.9
};

console.log("TypeScript Transpiler Active");
console.log(formatSummary(learner));
`,
    },
  ],
  html: [
    {
      label: "Interactive UI Widget",
      code: `<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 90vh; background: #FFFDF9; margin: 0; }
      .card { background: white; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
      button { background: #FF6B35; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2 style="margin-top:0;color:#172033;">HTML / CSS / JS Sandbox</h2>
      <p id="msg" style="color:#64748B;">Edit markup or styles and click Run Code!</p>
      <button onclick="document.getElementById('msg').textContent='Clicked at ' + new Date().toLocaleTimeString()">Test Interaction</button>
    </div>
  </body>
</html>`,
    },
  ],
};

export default function CloudStudioPage() {
  const [language, setLanguage] = useState<SupportedLanguage>("javascript");
  const [templateIdx, setTemplateIdx] = useState(0);
  const [code, setCode] = useState<string>(TEMPLATES.javascript[0].code);
  const [stdin, setStdin] = useState("");
  const [outputLogs, setOutputLogs] = useState<string[]>([
    "Elevate CloudStudio Compiler Ready.",
    "Click 'Run Code' to execute your program.",
  ]);
  const [htmlPreview, setHtmlPreview] = useState<string>(TEMPLATES.html[0].code);
  const [isRunning, setIsRunning] = useState(false);
  const [runtimeMs, setRuntimeMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setTemplateIdx(0);
    const tpl = TEMPLATES[lang][0];
    setCode(tpl.code);
    setStdin(tpl.stdin || "");
    if (lang === "html") {
      setHtmlPreview(tpl.code);
    } else {
      setOutputLogs([`Switched to ${lang.toUpperCase()}. Click 'Run Code' to execute.`]);
    }
    setRuntimeMs(null);
  };

  const handleTemplateChange = (idx: number) => {
    setTemplateIdx(idx);
    const tpl = TEMPLATES[language][idx] || TEMPLATES[language][0];
    setCode(tpl.code);
    setStdin(tpl.stdin || "");
    setRuntimeMs(null);
  };

  const handleReset = () => {
    const tpl = TEMPLATES[language][templateIdx] || TEMPLATES[language][0];
    setCode(tpl.code);
    setStdin(tpl.stdin || "");
    setOutputLogs(["Code reset to template."]);
    setRuntimeMs(null);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = language === "javascript" ? "js" : language === "python" ? "py" : language === "typescript" ? "ts" : "html";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `main.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRun = () => {
    setIsRunning(true);
    const start = performance.now();
    const captured: string[] = [];

    setTimeout(() => {
      try {
        if (language === "html") {
          setHtmlPreview(code);
          const duration = Math.round(performance.now() - start);
          setRuntimeMs(duration < 1 ? 2 : duration);
          return;
        }

        if (language === "javascript" || language === "typescript") {
          const jsToRun = language === "typescript" ? stripTypeScriptTypes(code) : code;
          const stdinLines = stdin.split("\n");
          let stdinIdx = 0;
          const readLine = () => {
            const val = stdinLines[stdinIdx] ?? "";
            stdinIdx++;
            return val;
          };

          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          console.log = (...args: unknown[]) => {
            captured.push(
              args
                .map((a) => (typeof a === "object" && a !== null ? JSON.stringify(a, null, 2) : String(a)))
                .join(" ")
            );
          };
          console.error = (...args: unknown[]) => {
            captured.push("[ERROR] " + args.map((a) => String(a)).join(" "));
          };
          console.warn = (...args: unknown[]) => {
            captured.push("[WARN] " + args.map((a) => String(a)).join(" "));
          };

          try {
            new Function("readLine", "input", jsToRun)(readLine, readLine);
            if (captured.length === 0) {
              captured.push("(Program finished execution with no console output)");
            }
          } finally {
            console.log = originalLog;
            console.error = originalError;
            console.warn = originalWarn;
          }
        } else if (language === "python") {
          const pyRes = runPythonScript(code, stdin);
          if (pyRes.error) {
            captured.push(...pyRes.stdout, `[Python Error] ${pyRes.error}`);
          } else if (pyRes.stdout.length > 0) {
            captured.push(...pyRes.stdout);
          } else {
            captured.push("(Python script executed with no print output)");
          }
        }

        const duration = Math.round(performance.now() - start);
        setRuntimeMs(duration < 1 ? 2 : duration);
        setOutputLogs(captured);
      } catch (err: unknown) {
        setOutputLogs([`Runtime Exception: ${err instanceof Error ? err.message : String(err)}`]);
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Breadcrumbs & Controls */}
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Braces className="w-3.5 h-3.5" />
                <span>CloudStudio</span>
              </span>
              <span className="text-sm font-bold text-[#172033]">
                Multi-Language Online Compiler &amp; Playground
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172033] bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#64748B]" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172033] bg-white border border-[#E5E7EB] hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Download</span>
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={handleRun}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Code</span>
            </button>
          </div>
        </div>

        {/* Workspace: Editor + Terminal Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F8FAFC]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-[#64748B]">Runtime:</span>
                <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-semibold text-[#172033]">
                  {(["javascript", "python", "typescript", "html"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        language === lang
                          ? "bg-white text-[#FF6B35] shadow-xs"
                          : "text-[#64748B] hover:text-[#172033]"
                      }`}
                    >
                      {lang === "html" ? "HTML/CSS" : lang.toUpperCase()}
                    </button>
                  ))}
                </div>

                {TEMPLATES[language].length > 1 && (
                  <select
                    aria-label="Choose code template"
                    value={templateIdx}
                    onChange={(e) => handleTemplateChange(Number(e.target.value))}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[#172033] focus:outline-none focus:border-[#FF6B35] cursor-pointer"
                  >
                    {TEMPLATES[language].map((t, i) => (
                      <option key={t.label} value={i}>
                        Template: {t.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="button"
                onClick={handleReset}
                title="Reset to Template"
                className="p-1.5 text-[#64748B] hover:text-[#FF6B35] rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 bg-[#1E293B] text-slate-100 font-mono text-xs p-4 flex overflow-hidden">
              <div className="w-9 select-none text-right pr-3 text-slate-500 font-mono text-[11px] leading-relaxed border-r border-slate-800">
                {Array.from({ length: Math.max(16, code.split("\n").length) }).map((_, i) => (
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
          </div>

          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col h-[700px]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                {language === "html" ? (
                  <Monitor className="w-4 h-4 text-[#64748B]" />
                ) : (
                  <Terminal className="w-4 h-4 text-[#64748B]" />
                )}
                <span className="text-xs font-bold text-[#172033]">
                  {language === "html" ? "Live HTML Preview" : "Terminal Output"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {runtimeMs !== null && (
                  <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {runtimeMs} ms
                  </span>
                )}
                {language !== "html" && (
                  <button
                    type="button"
                    onClick={() => setOutputLogs([])}
                    title="Clear Output"
                    className="p-1 text-[#64748B] hover:text-rose-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {language === "html" ? (
              <iframe
                title="CloudStudio HTML Preview"
                srcDoc={htmlPreview}
                sandbox="allow-scripts allow-modals"
                className="flex-1 w-full border-none bg-white"
              />
            ) : (
              <>
                <div className="flex-1 bg-[#0F172A] p-4 text-emerald-400 font-mono text-xs overflow-y-auto space-y-1">
                  {outputLogs.map((log, i) => (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap leading-relaxed ${
                        log.startsWith("[ERROR]") || log.startsWith("[Python Error]") || log.startsWith("Runtime Exception")
                          ? "text-rose-400"
                          : ""
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {outputLogs.length === 0 && (
                    <div className="text-slate-600 italic">Terminal is empty.</div>
                  )}
                </div>

                <div className="border-t border-[#E5E7EB] p-3 bg-slate-50 space-y-1.5">
                  <label htmlFor="stdin-input" className="text-[11px] font-bold uppercase text-[#64748B]">
                    Standard Input (stdin — one line per readLine/input):
                  </label>
                  <textarea
                    id="stdin-input"
                    rows={2}
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Line 1&#10;Line 2"
                    className="w-full text-xs bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 font-mono text-[#172033] focus:outline-none focus:border-[#FF6B35] resize-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
