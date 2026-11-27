import { CheckCircle2, Code2, ListChecks, Play } from "lucide-react";

export type PracticeProgramData = {
  tools?: string;
  steps?: string[];
  code?: string;
  run?: string;
  expect?: string;
  challenge?: string;
};

export function PracticeProgram({ data, isLab }: { data: PracticeProgramData; isLab: boolean }) {
  if (!data.tools && !data.challenge && !data.steps?.length) return null;
  if (isLab) return <div className="mt-7 space-y-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-5 sm:p-6">
    <div className="flex items-center gap-2 text-sm font-extrabold text-[#172033]"><ListChecks className="h-5 w-5 text-[#E85D2A]" /> Try it yourself</div>
    <p className="text-sm leading-7 text-[#334155]">{data.challenge}</p>
    {data.expect && <p className="rounded-xl bg-white p-4 text-sm leading-6 text-[#475569]"><strong className="text-[#172033]">Check your result:</strong> {data.expect}</p>}
    <p className="text-xs text-[#64748B]">Use the program in the previous workshop as a starting point. Build this variation yourself, then describe what you ran and checked below.</p>
  </div>;

  return <div className="mt-7 space-y-5" aria-label="Workshop program and instructions">
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-[#172033]"><ListChecks className="h-5 w-5 text-[#E85D2A]" /> Follow these steps</h3>
      {data.tools && <p className="mt-3 text-sm text-[#475569]"><strong className="text-[#172033]">You need:</strong> {data.tools}</p>}
      <ol className="mt-4 space-y-3">{data.steps?.map((instruction, index) => <li key={index} className="flex gap-3 text-sm leading-6 text-[#334155]"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#172033] text-xs font-bold text-white">{index + 1}</span><span>{instruction}</span></li>)}</ol>
    </div>
    {data.code && <div className="min-w-0 overflow-hidden rounded-2xl border border-[#334155] bg-[#172033]">
      <div className="flex items-center gap-2 border-b border-white/15 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-200"><Code2 className="h-4 w-4 text-[#FFB18F]" /> Program to try</div>
      <pre className="max-h-[34rem] overflow-auto p-4 text-sm leading-6 text-slate-100"><code>{data.code}</code></pre>
    </div>}
    {data.run && <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-[#334155]"><Play className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" /><p><strong className="text-[#172033]">Run it:</strong> {data.run}</p></div>}
    {data.expect && <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-[#334155]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><p><strong className="text-[#172033]">Expected result:</strong> {data.expect}</p></div>}
    {data.challenge && <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-[#334155]"><strong className="text-[#172033]">Next challenge:</strong> {data.challenge}</div>}
  </div>;
}
