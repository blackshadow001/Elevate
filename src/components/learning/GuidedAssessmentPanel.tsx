"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CheckCircle2, ClipboardCheck, ExternalLink, LockKeyhole } from "lucide-react";

type Project = { title: string; brief: string; requirements: string[] };
export type GuidedAssessment = {
  courseworkComplete: boolean;
  project: { id: string; status: string; feedback: string; project_url: string; repository_url: string } | null;
  exam: { score: number; total: number; passed: number } | null;
  certificate: { id: string; issued_at: string } | null;
};
type Exam = { questions: { id: number; question: string }[]; passingScore: number; total: number };

export function GuidedAssessmentPanel({ slug, project, ready, initial }: {
  slug: string; project: Project; ready: boolean; initial: GuidedAssessment | null;
}) {
  const [assessment, setAssessment] = useState(initial);
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [projectUrl, setProjectUrl] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!ready) return;
    let active = true;
    fetch(`/api/learning-paths/${encodeURIComponent(slug)}/exam`, { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => {
        if (!active || body.error) return;
        setExam(body.data);
        setAnswers(Array(body.data.total).fill(""));
        setAssessment(body.data.assessment);
      }).catch(() => { /* The learner can retry by refreshing. */ });
    return () => { active = false; };
  }, [ready, slug]);

  async function submitProject() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/learning-paths/${encodeURIComponent(slug)}/project`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectUrl, repositoryUrl, notes }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Project could not be submitted.");
      setAssessment(body.data);
      setMessage("Project submitted for administrator review.");
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }

  async function submitExam() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/learning-paths/${encodeURIComponent(slug)}/exam`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Assessment could not be submitted.");
      setAssessment(body.data.assessment);
      setMessage(body.data.passed
        ? `You passed ${body.data.score}/${body.data.total}. Your certificate is issued after project approval.`
        : `You scored ${body.data.score}/${body.data.total}. Review the modules and try again.`);
    } catch (failure) { setError((failure as Error).message); }
    finally { setBusy(false); }
  }

  return <section className="mt-7 space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-8" aria-labelledby="certification-heading">
    <div className="flex items-start gap-3"><Award className="mt-1 h-6 w-6 shrink-0 text-[#E85D2A]" /><div>
      <h2 id="certification-heading" className="text-2xl font-extrabold text-[#172033]">Final project and certificate</h2>
      <p className="mt-2 text-sm leading-6 text-[#64748B]">Finish every module, submit a working project for review, and pass the cumulative knowledge assessment. The certificate becomes publicly verifiable after both checks pass.</p>
    </div></div>
    {!ready && <p className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-[#64748B]"><LockKeyhole className="h-4 w-4" /> Complete all course steps to unlock submissions.</p>}
    <div className="rounded-xl border border-[#E5E7EB] p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-bold text-[#172033]">{project.title}</h3><span className="text-xs font-bold text-[#64748B]">Human reviewed</span></div>
      <p className="mt-3 text-sm leading-6 text-[#475569]">{project.brief}</p>
      <h4 className="mt-5 text-sm font-bold text-[#172033]">Project requirements</h4><ul className="mt-2 space-y-2 text-sm text-[#475569]">{project.requirements.map((requirement) => <li key={requirement} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E85D2A]" />{requirement}</li>)}</ul>
      {assessment?.project && <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm"><strong className="capitalize">Review status: {assessment.project.status.replaceAll("_", " ")}</strong>{assessment.project.feedback && <p className="mt-2 text-[#475569]">Reviewer feedback: {assessment.project.feedback}</p>}
        <a href={assessment.project.project_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[#D65B28] underline">Submitted project <ExternalLink className="h-3 w-3" /></a></div>}
      {ready && assessment?.project?.status !== "approved" && <div className="mt-5 grid gap-3"><label className="text-sm font-bold">Public project URL<input type="url" value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} placeholder="https://your-project.example" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>
        <label className="text-sm font-bold">Source repository URL<input type="url" value={repositoryUrl} onChange={(event) => setRepositoryUrl(event.target.value)} placeholder="https://github.com/you/project" className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>
        <label className="text-sm font-bold">What you built and tested<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="mt-1 block w-full rounded-xl border p-3 font-normal" /></label>
        <button type="button" disabled={busy || !projectUrl || !repositoryUrl || notes.trim().length < 80} onClick={() => void submitProject()} className="w-fit rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{assessment?.project ? "Resubmit project" : "Submit project for review"}</button></div>}
    </div>
    <div className="rounded-xl border border-[#E5E7EB] p-5"><div className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-[#E85D2A]" /><h3 className="text-lg font-bold text-[#172033]">Cumulative knowledge assessment</h3></div>
      <p className="mt-2 text-sm text-[#64748B]">Answer all 12 short questions. At least 10 correct answers are needed to pass. You can make up to five attempts per day.</p>
      {assessment?.exam && <p className="mt-3 text-sm font-bold text-[#172033]">Latest result: {assessment.exam.score}/{assessment.exam.total} · {assessment.exam.passed ? "Passed" : "Review and retry"}</p>}
      {ready && exam && !assessment?.exam?.passed && <div className="mt-5 space-y-4">{exam.questions.map((question, index) => <label key={question.id} className="block text-sm font-semibold text-[#172033]">{index + 1}. {question.question}<input value={answers[index] || ""} onChange={(event) => setAnswers(answers.map((answer, i) => i === index ? event.target.value : answer))} autoComplete="off" className="mt-2 block w-full rounded-xl border p-3 font-normal" /></label>)}
        <button type="button" disabled={busy || answers.some((answer) => !answer.trim())} onClick={() => void submitExam()} className="rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Submit assessment</button></div>}
      {ready && !exam && <p className="mt-4 text-sm text-[#64748B]">Sign in to load the assessment.</p>}
    </div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    {assessment?.certificate && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-bold text-emerald-900">Elevate certificate issued</p><p className="mt-1 text-sm text-emerald-800">Your completed coursework, reviewed project and passing assessment are recorded.</p><Link href={`/learning-paths/verify/${assessment.certificate.id}`} className="mt-3 inline-block text-sm font-bold text-emerald-900 underline">View public verification</Link></div>}
  </section>;
}
