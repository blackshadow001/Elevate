"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Application = {
  status: "pending" | "approved" | "rejected";
  subject: string;
  experience: string;
  coursePlan: string;
  portfolioUrl: string | null;
  adminNote: string | null;
  submittedAt: string;
} | null;

export function InstructorApplicationCard() {
  const { user, isAuthenticated, isReady } = useAuth();
  const [application, setApplication] = useState<Application>(null);
  const [loaded, setLoaded] = useState(false);
  const [subject, setSubject] = useState("");
  const [experience, setExperience] = useState("");
  const [coursePlan, setCoursePlan] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isReady || !isAuthenticated || user.role !== "learner") return;
    let active = true;
    fetch("/api/me/tutor-application", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) {
          throw new Error(
            body.error?.message || "Unable to load your application."
          );
        }
        if (!active) return;
        setApplication(body.data);
        if (body.data) {
          setSubject(body.data.subject);
          setExperience(body.data.experience);
          setCoursePlan(body.data.coursePlan);
          setPortfolioUrl(body.data.portfolioUrl || "");
        }
      })
      .catch((cause) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Unable to load your application."
          );
        }
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [isReady, isAuthenticated, user.id, user.role]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/me/tutor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          experience,
          coursePlan,
          portfolioUrl,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(
          body.error?.message || "Unable to submit your application."
        );
      }
      setApplication({
        status: "pending",
        subject,
        experience,
        coursePlan,
        portfolioUrl,
        adminNote: null,
        submittedAt: new Date().toISOString(),
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit your application."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-[#FFFDF9] p-6 shadow-sm sm:p-8">
      {!isReady ? (
        <p role="status" className="text-sm font-medium text-[#64748B]">
          Checking your account…
        </p>
      ) : !isAuthenticated ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[#172033]">
            Sign in to submit your application
          </h3>
          <p className="text-sm leading-relaxed text-[#64748B]">
            Applications link directly to your learner account so your course history stays intact once you unlock Instructor Studio.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A]"
            >
              Sign in to Continue
            </Link>
            <Link
              href="/register"
              className="inline-flex rounded-xl border border-[#CBD5E1] bg-white px-5 py-3 text-sm font-bold text-[#172033] transition-colors hover:border-[#FF6B35]"
            >
              Create Account
            </Link>
          </div>
        </div>
      ) : user.role !== "learner" ? (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-[#172033]">
            Your instructor account is active
          </h3>
          <p className="text-sm text-[#64748B]">
            You already have educator permissions enabled on Elevate.
          </p>
          <Link
            href="/instructor"
            className="mt-2 inline-flex items-center rounded-xl bg-[#172033] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#FF6B35]"
          >
            Open Instructor Studio →
          </Link>
        </div>
      ) : !loaded ? (
        <p role="status" className="text-sm font-medium text-[#64748B]">
          Loading your application status…
        </p>
      ) : application?.status === "pending" ? (
        <div role="status" className="space-y-3">
          <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Pending Review
          </span>
          <h3 className="text-xl font-bold text-[#172033]">
            Application under review
          </h3>
          <p className="text-sm leading-relaxed text-[#64748B]">
            Your proposal to teach <strong>{application.subject}</strong> was submitted. Our curriculum team reviews every proposal personally and updates this page with feedback.
          </p>
        </div>
      ) : application?.status === "approved" ? (
        <div role="status" className="space-y-3">
          <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Approved
          </span>
          <h3 className="text-xl font-bold text-[#172033]">
            Welcome aboard! Application approved
          </h3>
          <p className="text-sm text-[#64748B]">
            Sign in again to refresh your session and activate Instructor Studio.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex rounded-xl bg-[#FF6B35] px-5 py-3 text-sm font-bold text-white"
          >
            Sign in to Studio →
          </Link>
        </div>
      ) : (
        <>
          <h3 className="text-xl font-bold text-[#172033]">
            {application?.status === "rejected"
              ? "Update your instructor application"
              : "Apply to become an Elevate Instructor"}
          </h3>
          {application?.status === "rejected" && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Reviewer feedback:{" "}
              {application.adminNote ||
                "Please expand on your syllabus outline and try again."}
            </p>
          )}
          <p className="mt-2 text-sm text-[#64748B]">
            Applying as <strong>{user.name}</strong> ({user.email})
          </p>
          <form onSubmit={submit} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="teach-subject"
                className="mb-1.5 block text-sm font-semibold text-[#172033]"
              >
                What subject would you teach?
              </label>
              <input
                id="teach-subject"
                required
                minLength={3}
                maxLength={120}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-sm text-[#172033] focus:border-[#FF6B35] focus:outline-hidden"
                placeholder="For example, Python Backend Systems & Testing"
              />
            </div>
            <div>
              <label
                htmlFor="teach-experience"
                className="mb-1.5 block text-sm font-semibold text-[#172033]"
              >
                Your experience and qualifications
              </label>
              <textarea
                id="teach-experience"
                required
                minLength={30}
                maxLength={3000}
                rows={4}
                value={experience}
                onChange={(event) => setExperience(event.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-sm text-[#172033] focus:border-[#FF6B35] focus:outline-hidden"
                placeholder="Describe your industry background, shipped projects, and prior mentoring or workshop experience."
              />
            </div>
            <div>
              <label
                htmlFor="teach-plan"
                className="mb-1.5 block text-sm font-semibold text-[#172033]"
              >
                Your first course outline & outcome
              </label>
              <textarea
                id="teach-plan"
                required
                minLength={30}
                maxLength={3000}
                rows={4}
                value={coursePlan}
                onChange={(event) => setCoursePlan(event.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-sm text-[#172033] focus:border-[#FF6B35] focus:outline-hidden"
                placeholder="Who is this course designed for, what modules will you cover, and what portfolio outcome will learners build?"
              />
            </div>
            <div>
              <label
                htmlFor="teach-portfolio"
                className="mb-1.5 block text-sm font-semibold text-[#172033]"
              >
                Sample video, GitHub, or portfolio URL (optional)
              </label>
              <input
                id="teach-portfolio"
                type="url"
                maxLength={500}
                value={portfolioUrl}
                onChange={(event) => setPortfolioUrl(event.target.value)}
                className="w-full rounded-xl border border-[#CBD5E1] bg-white p-3 text-sm text-[#172033] focus:border-[#FF6B35] focus:outline-hidden"
                placeholder="https://..."
              />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#FF6B35] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#E85A2A] disabled:opacity-50"
            >
              {busy
                ? "Submitting…"
                : application?.status === "rejected"
                ? "Resubmit application"
                : "Submit application"}
            </button>
          </form>
        </>
      )}
      {error && (application?.status === "pending" || !loaded) && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
