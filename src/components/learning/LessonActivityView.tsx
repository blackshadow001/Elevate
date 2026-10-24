"use client";

import { useState } from "react";
import { type AssignmentActivity, type QuizActivity } from "@/lib/lessonActivities";

export function LessonActivityView({ activity, courseId, lessonId, title, onCompleted }: {
  activity: QuizActivity | AssignmentActivity; courseId: string; lessonId: string; title: string;
  onCompleted: () => Promise<boolean>;
}) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [submission, setSubmission] = useState("");
  const [result, setResult] = useState<{ passed: boolean; scorePercent?: number; passingPercent?: number } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setError("");
    if (activity.kind === "quiz" && !activity.questions.every((_, index) => Number.isInteger(answers[index]))) {
      setError("Answer every question before submitting."); return;
    }
    if (activity.kind === "assignment" && submission.trim().length < 10) {
      setError("Write at least 10 characters before submitting."); return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/submit`, {
        method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: activity.kind === "quiz" ? answers : submission.trim() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Submission failed.");
      setResult(body.data);
      if (body.data.passed) await onCompleted();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Submission failed."); }
    finally { setSaving(false); }
  }

  return <div className="min-h-72 bg-[#172033] px-6 py-10 text-white sm:px-12">
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-xs font-bold uppercase tracking-wider text-[#FFB18F]">{activity.kind === "quiz" ? "Knowledge check" : "Assignment"}</p>
      <h2 className="text-2xl font-bold">{title}</h2>
      {activity.kind === "quiz" ? <>
        <p className="text-sm text-slate-300">Answer every question. A score of {activity.passingPercent}% is needed to complete this lesson.</p>
        {activity.questions.map((question, questionIndex) => <fieldset key={questionIndex} className="space-y-2 rounded-xl border border-white/15 p-4">
          <legend className="px-1 text-sm font-semibold">{questionIndex + 1}. {question.prompt}</legend>
          {question.options.map((option, optionIndex) => <label key={optionIndex} className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/5 p-2.5 text-sm hover:bg-white/10">
            <input type="radio" name={`quiz-${lessonId}-${questionIndex}`} checked={answers[questionIndex] === optionIndex} onChange={() => setAnswers((previous) => { const next = [...previous]; next[questionIndex] = optionIndex; return next; })} className="accent-[#FF6B35]" />
            {option}
          </label>)}
        </fieldset>)}
      </> : <>
        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-200">{activity.instructions}</p>
        <label htmlFor={`assignment-${lessonId}`} className="block text-sm font-semibold">Your response</label>
        <textarea id={`assignment-${lessonId}`} value={submission} onChange={(event) => setSubmission(event.target.value)} rows={6} maxLength={10_000} placeholder="Write your response here…" className="w-full rounded-xl border border-white/20 bg-white p-4 text-sm text-[#172033]" />
        <p className="text-xs text-slate-300">Submitting your written response marks the assignment complete.</p>
      </>}
      {result && <p role="status" className={`text-sm font-semibold ${result.passed ? "text-emerald-300" : "text-amber-300"}`}>
        {activity.kind === "quiz" ? `Score: ${result.scorePercent}%. ${result.passed ? "Passed and saved." : `You need ${result.passingPercent}% to pass. Review your answers and try again.`}` : "Assignment submitted and saved."}
      </p>}
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button type="button" onClick={submit} disabled={saving} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white hover:bg-[#E85D2A] disabled:opacity-50">{saving ? "Submitting…" : activity.kind === "quiz" ? "Submit quiz" : "Submit assignment"}</button>
    </div>
  </div>;
}
