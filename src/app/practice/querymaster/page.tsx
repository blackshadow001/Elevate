"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  SQLKATA_CHALLENGES,
  SQL_SAMPLE_TABLES,
  SchemaTableName,
  SqlKataChallenge,
} from "@/data/practiceData";
import { executeSqlQuery } from "@/lib/sqlEngine";
import {
  Database,
  ArrowLeft,
  Play,
  RotateCcw,
  Table,
  Clock,
  Columns3,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
} from "lucide-react";

const SCHEMA_TABLES: SchemaTableName[] = [
  "employees",
  "departments",
  "orders",
  "courses",
  "enrollments",
];

export default function QueryMasterPage() {
  const [activeSchemaTable, setActiveSchemaTable] = useState<SchemaTableName>("employees");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const challenge: SqlKataChallenge = SQLKATA_CHALLENGES[selectedIdx];

  const [query, setQuery] = useState(challenge.starterQuery);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const [executionResult, setExecutionResult] = useState<{
    status: "idle" | "success" | "error";
    message?: string;
    verification?: "passed" | "mismatch";
    runtimeMs?: number;
    rowCount?: number;
    columns: string[];
    rows: (string | number | boolean | null)[][];
  }>({
    status: "idle",
    columns: [],
    rows: [],
  });

  const tableChallenges = SQLKATA_CHALLENGES.map((c, idx) => ({ c, idx })).filter(
    ({ c }) => c.tableKey === activeSchemaTable
  );

  const handleSelectTable = (table: SchemaTableName) => {
    setActiveSchemaTable(table);
    const firstMatchIdx = SQLKATA_CHALLENGES.findIndex((c) => c.tableKey === table);
    const nextIdx = firstMatchIdx >= 0 ? firstMatchIdx : 0;
    setSelectedIdx(nextIdx);
    setQuery(SQLKATA_CHALLENGES[nextIdx].starterQuery);
    setShowHint(false);
    setExecutionResult({ status: "idle", columns: [], rows: [] });
  };

  const handleSelectChallengeIdx = (idx: number) => {
    setSelectedIdx(idx);
    setActiveSchemaTable(SQLKATA_CHALLENGES[idx].tableKey);
    setQuery(SQLKATA_CHALLENGES[idx].starterQuery);
    setShowHint(false);
    setExecutionResult({ status: "idle", columns: [], rows: [] });
  };

  const executeSql = (verifyAgainstSolution = false) => {
    setIsExecuting(true);
    const start = performance.now();

    setTimeout(() => {
      try {
        const result = executeSqlQuery(query, SQL_SAMPLE_TABLES);
        let verification: "passed" | "mismatch" | undefined = undefined;
        let message = "Query executed successfully.";

        if (verifyAgainstSolution) {
          const expected = executeSqlQuery(challenge.solutionQuery, SQL_SAMPLE_TABLES);
          const actualNorm = JSON.stringify(result.rows);
          const expectedNorm = JSON.stringify(expected.rows);
          const colsMatch =
            result.columns.length === expected.columns.length &&
            result.columns.every(
              (c, i) => c.toLowerCase() === expected.columns[i].toLowerCase()
            );

          if (colsMatch && actualNorm === expectedNorm) {
            verification = "passed";
            message = "Correct! Your SQL query output matches the expected result set.";
          } else {
            verification = "mismatch";
            message = `Query ran cleanly (${result.rows.length} rows), but the output differs from the expected task result (${expected.rows.length} rows, columns: ${expected.columns.join(", ")}).`;
          }
        }

        const runtimeMs = Math.max(2, Math.round(performance.now() - start));
        setExecutionResult({
          status: "success",
          message,
          verification,
          runtimeMs,
          rowCount: result.rows.length,
          columns: result.columns,
          rows: result.rows,
        });
      } catch (err: unknown) {
        setExecutionResult({
          status: "error",
          message: err instanceof Error ? err.message : "SQL Syntax Error.",
          columns: [],
          rows: [],
        });
      } finally {
        setIsExecuting(false);
      }
    }, 120);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header Breadcrumbs */}
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
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-100">
                <Database className="w-3.5 h-3.5" />
                <span>QueryMaster</span>
              </span>
              <span className="text-sm font-bold text-[#172033]">
                {challenge.title}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Task Description & Schema Explorer */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 space-y-6 h-[750px] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200">
                  {challenge.difficulty}
                </span>
                <span className="text-xs text-[#64748B] font-medium">{challenge.category}</span>
              </div>
              <h1 className="text-xl font-extrabold text-[#172033] mt-2">{challenge.title}</h1>
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#334155] leading-relaxed mt-3">
                {challenge.description}
              </div>

              {/* Tasks for selected table (if multiple) */}
              {tableChallenges.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tableChallenges.map(({ c, idx }) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectChallengeIdx(idx)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        idx === selectedIdx
                          ? "bg-purple-600 text-white shadow-xs"
                          : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Hint & Solution Controls */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showHint ? "Hide Hint" : "Show Hint"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuery(challenge.solutionQuery)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-[#172033] hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Load Solution</span>
                </button>
              </div>

              {showHint && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <strong>Hint:</strong> {challenge.hint}
                </div>
              )}
            </div>

            {/* Schema Explorer & Table Selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172033] flex items-center gap-1.5">
                <Columns3 className="w-4 h-4 text-purple-600" />
                <span>Available Schema Tables</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {SCHEMA_TABLES.map((table) => (
                  <button
                    key={table}
                    type="button"
                    onClick={() => handleSelectTable(table)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeSchemaTable === table
                        ? "bg-[#172033] text-white shadow-sm ring-2 ring-purple-500/30"
                        : "bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#172033]"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>{table}</span>
                  </button>
                ))}
              </div>

              {/* Table Preview */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white text-xs">
                <div className="bg-[#F8FAFC] px-3 py-2 border-b border-[#E2E8F0] font-bold text-[#172033] flex items-center justify-between">
                  <span>Schema: {activeSchemaTable}</span>
                  <span className="text-[11px] text-[#64748B] font-normal">
                    {SQL_SAMPLE_TABLES[activeSchemaTable].length} sample rows
                  </span>
                </div>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[#64748B] border-b border-slate-200">
                      <tr>
                        {Object.keys(SQL_SAMPLE_TABLES[activeSchemaTable][0]).map((col) => (
                          <th key={col} className="p-2 font-mono">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {SQL_SAMPLE_TABLES[activeSchemaTable].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          {Object.values(row).map((val, j) => (
                            <td key={j} className="p-2 text-[#334155]">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: SQL Editor & Result Grid */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col h-[750px]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-2.5 bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-[#172033]">SQL Query Terminal</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuery(challenge.starterQuery);
                    setExecutionResult({ status: "idle", columns: [], rows: [] });
                  }}
                  title="Reset Query"
                  className="p-1.5 text-[#64748B] hover:text-[#FF6B35] rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => executeSql(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#172033] bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run SQL</span>
                </button>
                <button
                  type="button"
                  disabled={isExecuting}
                  onClick={() => executeSql(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B35] hover:bg-[#E85D2A] shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Answer</span>
                </button>
              </div>
            </div>

            {/* SQL Input Area */}
            <div className="h-[280px] bg-[#1E293B] text-slate-100 font-mono text-xs p-4 flex">
              <div className="w-8 select-none text-right pr-2 text-slate-500 font-mono text-[11px] leading-relaxed border-r border-slate-800">
                {Array.from({ length: Math.max(10, query.split("\n").length) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                spellCheck={false}
                className="flex-1 pl-3 bg-transparent text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Execution Output Grid */}
            <div className="flex-1 border-t border-[#E5E7EB] bg-white flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#172033]">
                  <Table className="w-4 h-4 text-[#64748B]" />
                  <span>Query Results Grid</span>
                </div>
                {executionResult.status === "success" && (
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-[#64748B]">
                    <span>{executionResult.rowCount} rows</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-600" />
                      {executionResult.runtimeMs} ms
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {executionResult.status === "error" && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{executionResult.message}</span>
                  </div>
                )}

                {executionResult.status === "success" && executionResult.verification && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      executionResult.verification === "passed"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    {executionResult.verification === "passed" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{executionResult.message}</span>
                  </div>
                )}

                {executionResult.status === "success" && executionResult.rows.length > 0 && (
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-[#172033] text-white font-mono uppercase text-[11px]">
                      <tr>
                        {executionResult.columns.map((col) => (
                          <th key={col} className="p-2.5 font-bold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {executionResult.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-orange-50/50">
                          {row.map((val, j) => (
                            <td key={j} className="p-2.5 text-[#172033]">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {executionResult.status === "success" && executionResult.rows.length === 0 && (
                  <div className="p-6 text-center text-xs text-[#64748B] bg-slate-50 rounded-xl border border-slate-200">
                    Query executed cleanly and returned 0 matching rows.
                  </div>
                )}

                {executionResult.status === "idle" && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#94A3B8] text-xs">
                    <Database className="w-8 h-8 mb-2 text-slate-300" />
                    <span>Run any SQL query above (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`, `ORDER BY`, `LIMIT`) to see real executed results.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
