"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  LockKeyhole,
} from "lucide-react";

type Project = { title: string; brief: string; requirements: string[] };
export type GuidedAssessment = {
  courseworkComplete: boolean;
  project: {
    id: string;
    status: string;
    feedback: string;
    project_url: string;
    repository_url: string;
  } | null;
  exam: { score: number; total: number; passed: number } | null;
  certificate: { id: string; issued_at: string } | null;
};
type Exam = {
  questions: { id: number; question: string }[];
  passingScore: number;
  total: number;
};

export function GuidedAssessmentPanel({
  slug,
  project,
  ready,
  initial,
}: {
  slug: string;
  project: Project;
  ready: boolean;
  initial: GuidedAssessment | null;
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
    fetch(`/api/learning-paths/${encodeURIComponent(slug)}/exam`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((body) => {
        if (!active || body.error) return;
        setExam(body.data);
        setAnswers(Array(body.data.total).fill(""));
        setAssessment(body.data.assessment);
      })
      .catch(() => {
        /* The learner can retry by refreshing. */
      });
    return () => {
      active = false;
    };
  }, [ready, slug]);

  async function submitProject() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/learning-paths/${encodeURIComponent(slug)}/project`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectUrl, repositoryUrl, notes }),
        }
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message || "Project could not be submitted."
        );
      setAssessment(body.data);
      setMessage("Project submitted for administrator review.");
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitExam() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `/api/learning-paths/${encodeURIComponent(slug)}/exam`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          body.error?.message || "Assessment could not be submitted."
        );
      setAssessment(body.data.assessment);
      setMessage(
        body.data.passed
          ? `You passed ${body.data.score}/${body.data.total}. Your certificate is issued after project approval.`
          : `You scored ${body.data.score}/${body.data.total}. Review the modules and try again.`
      );
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mt-8 space-y-6 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xs sm:p-8"
      aria-labelledby="certification-heading"
    >
      <div className="flex flex-col gap-4 border-b border-[#F1F5F9] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#E85D2A]">
            <Award className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2
              id="certification-heading"
              className="text-xl font-extrabold text-[#172033] sm:text-2xl"
            >
              Final project & certificate
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              Complete every module, submit a working capstone for human review, and pass the 12-question assessment to earn your Elevate certificate.
            </p>
          </div>
        </div>

        {!ready && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-[#64748B]">
            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
            Complete all steps to unlock
          </span>
        )}
      </div>

      {/* Balanced 2-Column Split on Desktop */}
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Capstone Project Card */}
        <div className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-extrabold text-[#172033] sm:text-lg">
              {project.title}
            </h3>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-[#D65B28]">
              Human reviewed
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#475569]">
            {project.brief}
          </p>

          <h4 className="mt-5 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
            Project requirements
          </h4>
          <ul className="mt-2.5 space-y-2 text-sm text-[#475569]">
            {project.requirements.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#E85D2A]"
                  aria-hidden="true"
                />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>

          {assessment?.project && (
            <div className="mt-5 rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm">
              <strong className="capitalize text-[#172033]">
                Review status: {assessment.project.status.replaceAll("_", " ")}
              </strong>
              {assessment.project.feedback && (
                <p className="mt-2 text-[#475569]">
                  Reviewer feedback: {assessment.project.feedback}
                </p>
              )}
              <a
                href={assessment.project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-semibold text-[#D65B28] underline"
              >
                Submitted project <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>
          )}

          {ready && assessment?.project?.status !== "approved" && (
            <div className="mt-5 grid gap-3 border-t border-[#E5E7EB] pt-5">
              <label className="text-xs font-bold uppercase tracking-wide text-[#172033]">
                Public project URL
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(event) => setProjectUrl(event.target.value)}
                  placeholder="https://your-project.example"
                  className="mt-1.5 block w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-normal focus:border-[#E85D2A]"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-[#172033]">
                Source repository URL
                <input
                  type="url"
                  value={repositoryUrl}
                  onChange={(event) => setRepositoryUrl(event.target.value)}
                  placeholder="https://github.com/you/project"
                  className="mt-1.5 block w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-normal focus:border-[#E85D2A]"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-[#172033]">
                What you built and tested (min 80 chars)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="mt-1.5 block w-full rounded-xl border border-[#CBD5E1] bg-white p-3.5 text-sm font-normal focus:border-[#E85D2A]"
                />
              </label>
              <button
                type="button"
                disabled={
                  busy || !projectUrl || !repositoryUrl || notes.trim().length < 80
                }
                onClick={() => void submitProject()}
                className="w-fit rounded-xl bg-[#172033] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#26344D] disabled:opacity-50"
              >
                {busy
                  ? "Submitting…"
                  : assessment?.project
                    ? "Resubmit project"
                    : "Submit project for review"}
              </button>
            </div>
          )}
        </div>

        {/* Assessment Card */}
        <div className="flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-[#FFFDF9] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-[#E85D2A]" aria-hidden="true" />
            <h3 className="text-base font-extrabold text-[#172033] sm:text-lg">
              Cumulative knowledge assessment
            </h3>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-[#64748B]">
            Answer 12 short questions covering all path chapters. Score at least 10/12 to pass (up to 5 attempts per day).
          </p>

          {assessment?.exam && (
            <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#172033]">
              Latest result: {assessment.exam.score}/{assessment.exam.total} ·{" "}
              <span
                className={
                  assessment.exam.passed ? "text-emerald-700" : "text-amber-700"
                }
              >
                {assessment.exam.passed ? "Passed" : "Review and retry"}
              </span>
            </div>
          )}

          {ready && exam && !assessment?.exam?.passed && (
            <div className="mt-5 space-y-4 border-t border-[#E5E7EB] pt-5">
              {exam.questions.map((question, index) => (
                <label
                  key={question.id}
                  className="block text-sm font-semibold text-[#172033]"
                >
                  {index + 1}. {question.question}
                  <input
                    value={answers[index] || ""}
                    onChange={(event) =>
                      setAnswers(
                        answers.map((answer, i) =>
                          i === index ? event.target.value : answer
                        )
                      )
                    }
                    autoComplete="off"
                    className="mt-1.5 block w-full rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-sm font-normal focus:border-[#E85D2A]"
                  />
                </label>
              ))}
              <button
                type="button"
                disabled={busy || answers.some((answer) => !answer.trim())}
                onClick={() => void submitExam()}
                className="rounded-xl bg-[#FF6B35] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E85D2A] disabled:opacity-50"
              >
                {busy ? "Checking…" : "Submit assessment"}
              </button>
            </div>
          )}

          {ready && !exam && (
            <p className="mt-4 text-sm text-[#64748B]">
              Sign in to load the assessment.
            </p>
          )}
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </p>
      )}
      {assessment?.certificate && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-bold text-emerald-900">Elevate certificate issued</p>
          <p className="mt-1 text-sm text-emerald-800">
            Your completed coursework, reviewed project and passing assessment are recorded.
          </p>
          <Link
            href={`/learning-paths/verify/${assessment.certificate.id}`}
            className="mt-3 inline-block text-sm font-bold text-emerald-900 underline"
          >
            View public verification
          </Link>
        </div>
      )}
    </section>
  );
}
