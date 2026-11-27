import Link from "next/link";
import { connection } from "next/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { verifyGuidedCompletion } from "@/server/guidedPaths";

export default async function VerifyPathCompletionPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  let record: ReturnType<typeof verifyGuidedCompletion> | null = null;
  try { record = verifyGuidedCompletion((await params).id); } catch { /* Show a neutral invalid result. */ }
  return <div className="flex min-h-screen flex-col bg-[#FFFDF9]"><Navbar /><main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16"><div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-[#E85D2A]">Elevate learning path</p><h1 className="mt-3 text-3xl font-black text-[#172033]">Completion verification</h1>{record ? <div className="mt-7 space-y-3 text-sm text-[#475569]"><p className="font-bold text-emerald-700">Valid completion record</p><p>Learner: <strong>{String(record.learnerName)}</strong></p><p>Path: <strong>{String(record.pathTitle)}</strong></p><p>Completed: {String(record.issued_at)}</p><p className="break-all text-xs">Record ID: {String(record.id)}</p><p className="pt-3 text-xs">This verifies a saved learning-path completion. It is not a digitally signed PDF certificate.</p></div> : <p className="mt-7 text-sm text-red-700">No matching completion record was found.</p>}<Link href="/learning-paths" className="mt-8 inline-block text-sm font-bold text-[#D65B28]">Explore learning paths →</Link></div></main><Footer /></div>;
}
