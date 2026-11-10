"use client";

import { Plus, Trash2 } from "lucide-react";
import { type LessonActivity, type MultipleChoiceQuestion } from "@/lib/lessonActivities";

const field = "w-full rounded-lg border border-[#E5E7EB] bg-[#F7F8FA] p-2.5 text-xs text-[#172033] focus:border-[#FF6B35] focus:bg-white focus:outline-none";

export function LessonActivityEditor({ activity, onChange }: { activity: LessonActivity; onChange: (activity: LessonActivity) => void }) {
  if (activity.kind === "assignment") return <div className="space-y-2">
    <label className="block text-xs font-bold text-[#172033]">Assignment instructions</label>
    <textarea value={activity.instructions} onChange={(event) => onChange({ ...activity, instructions: event.target.value })} rows={4} maxLength={5000} placeholder="Describe the task learners should submit as text" className={field} />
    <p className="text-[11px] text-[#64748B]">Learners submit a written response. Submission marks this lesson complete.</p>
  </div>;
  if (activity.kind === "resource") return <div className="grid gap-3 sm:grid-cols-2">
    <div><label className="mb-1 block text-xs font-bold">Resource name</label><input value={activity.label} onChange={(event) => onChange({ ...activity, label: event.target.value })} maxLength={200} placeholder="Worksheet or reference guide" className={field} /></div>
    <div><label className="mb-1 block text-xs font-bold">HTTPS link</label><input type="url" value={activity.url} onChange={(event) => onChange({ ...activity, url: event.target.value })} maxLength={2000} placeholder="https://example.com/resource" className={field} /></div>
    <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold">Description (optional)</label><textarea value={activity.description} onChange={(event) => onChange({ ...activity, description: event.target.value })} rows={2} maxLength={2000} className={field} /></div>
    <p className="text-[11px] text-[#64748B] sm:col-span-2">Learners can open the linked resource and mark this lesson complete.</p>
  </div>;

  const updateChoice = (questionIndex: number, transform: (question: MultipleChoiceQuestion) => MultipleChoiceQuestion) =>
    onChange({ ...activity, questions: activity.questions.map((item, index) =>
      index === questionIndex && item.type !== "fill_blank" ? transform(item) : item) });

  return <div className="space-y-4">
    <div className="flex items-center gap-3"><label className="text-xs font-bold">Passing score</label><input type="number" min={1} max={100} value={activity.passingPercent} onChange={(event) => onChange({ ...activity, passingPercent: Number(event.target.value) })} className={`${field} w-20`} /><span className="text-xs">%</span></div>
    {activity.questions.map((question, questionIndex) => <div key={questionIndex} className="space-y-2 rounded-xl border border-[#E5E7EB] bg-white p-3">
      <div className="flex items-center justify-between"><label className="text-xs font-bold">Question {questionIndex + 1}</label>{activity.questions.length > 1 && <button type="button" onClick={() => onChange({ ...activity, questions: activity.questions.filter((_, index) => index !== questionIndex) })} aria-label={`Remove question ${questionIndex + 1}`} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}</div>
      <label className="block text-xs font-bold">Question type
        <select value={question.type === "fill_blank" ? "fill_blank" : "multiple_choice"} onChange={(event) => onChange({ ...activity, questions: activity.questions.map((item, index) => index !== questionIndex ? item : event.target.value === "fill_blank"
          ? { type: "fill_blank", prompt: item.prompt, answer: "" }
          : { type: "multiple_choice", prompt: item.prompt, options: ["", "", "", ""], correctIndex: 0 }) })} className={`${field} mt-1`}>
          <option value="multiple_choice">Multiple choice</option><option value="fill_blank">Fill in the blank</option>
        </select>
      </label>
      <input value={question.prompt} onChange={(event) => onChange({ ...activity, questions: activity.questions.map((item, index) => index === questionIndex ? { ...item, prompt: event.target.value } : item) })} maxLength={500} placeholder="Write your question" className={field} />
      {question.type === "fill_blank" ? <div>
        <label className="block text-xs font-bold">Correct answer</label>
        <input value={question.answer} onChange={(event) => onChange({ ...activity, questions: activity.questions.map((item, index) => index === questionIndex ? { ...item, answer: event.target.value } : item) })} maxLength={300} placeholder="The word or phrase learners should enter" className={`${field} mt-1`} />
        <p className="mt-1 text-[11px] text-[#64748B]">Learners type the answer. Capitalization and extra spaces are ignored.</p>
      </div> : <>
      {question.options.map((option, optionIndex) => <div key={optionIndex} className="flex items-center gap-2">
        <span className="w-4 text-xs text-[#64748B]">{String.fromCharCode(65 + optionIndex)}</span>
        <input value={option} onChange={(event) => updateChoice(questionIndex, (item) => ({ ...item, options: item.options.map((old, optionNumber) => optionNumber === optionIndex ? event.target.value : old) }))} maxLength={300} placeholder={`Answer choice ${optionIndex + 1}`} className={field} />
        {question.options.length > 2 && <button type="button" onClick={() => updateChoice(questionIndex, (item) => ({ ...item, options: item.options.filter((_, number) => number !== optionIndex), correctIndex: item.correctIndex === optionIndex ? 0 : (item.correctIndex || 0) > optionIndex ? (item.correctIndex || 0) - 1 : item.correctIndex }))} aria-label={`Remove choice ${optionIndex + 1}`} className="text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>}
      </div>)}
      {question.options.length < 6 && <button type="button" onClick={() => updateChoice(questionIndex, (item) => ({ ...item, options: [...item.options, ""] }))} className="text-[11px] font-bold text-[#FF6B35]">+ Add choice</button>}
      <div className="flex items-center gap-2"><label className="text-xs font-bold">Correct answer</label><select value={question.correctIndex ?? 0} onChange={(event) => updateChoice(questionIndex, (item) => ({ ...item, correctIndex: Number(event.target.value) }))} className={`${field} w-32`}>{question.options.map((_, index) => <option key={index} value={index}>Choice {String.fromCharCode(65 + index)}</option>)}</select></div>
      </>}
    </div>)}
    {activity.questions.length < 20 && <button type="button" onClick={() => onChange({ ...activity, questions: [...activity.questions, { prompt: "", options: ["", "", "", ""], correctIndex: 0 }] })} className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35]"><Plus className="h-3.5 w-3.5" /> Add question</button>}
  </div>;
}
