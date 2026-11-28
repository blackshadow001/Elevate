import { CheckCircle2, Code2, ListChecks, Play } from "lucide-react";

export type PracticeProgramData = {
  tools?: string;
  steps?: string[];
  code?: string;
  run?: string;
  expect?: string;
  challenge?: string;
  choices?: string[];
  explanation?: string;
  tokens?: string[];
};

export function PracticeProgram({
  data,
  isLab,
}: {
  data: PracticeProgramData;
  isLab: boolean;
}) {
  if (!data.tools && !data.challenge && !data.steps?.length) return null;

  if (isLab) {
    return (
      <div className="mt-6 space-y-4 rounded-2xl border border-orange-200/80 bg-orange-50/60 p-5 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-extrabold text-[#172033]">
          <ListChecks className="h-5 w-5 text-[#E85D2A]" aria-hidden="true" />
          Try it yourself
        </div>
        <p className="text-sm leading-relaxed text-[#334155]">{data.challenge}</p>
        {data.expect && (
          <div className="rounded-xl border border-orange-200/60 bg-white p-4 text-sm leading-relaxed text-[#475569]">
            <strong className="text-[#172033]">Check your result:</strong>{" "}
            {data.expect}
          </div>
        )}
        <p className="text-xs text-[#64748B]">
          Build on the previous workshop program, test your variation locally, then describe what you ran below.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5" aria-label="Workshop program and instructions">
      <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7F8FA] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-[#172033]">
            <ListChecks className="h-5 w-5 text-[#E85D2A]" aria-hidden="true" />
            Follow these steps
          </h3>
          {data.tools && (
            <span className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#475569]">
              Tools: <strong className="text-[#172033]">{data.tools}</strong>
            </span>
          )}
        </div>
        <ol className="mt-4 space-y-3">
          {data.steps?.map((instruction, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm leading-relaxed text-[#334155]"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#172033] text-xs font-bold text-white">
                {index + 1}
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ol>
      </div>

      {data.code && (
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0F172A] shadow-sm">
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#172033] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200">
            <Code2 className="h-4 w-4 text-[#FFB18F]" aria-hidden="true" />
            Program to try
          </div>
          <pre
            role="region"
            aria-label="Workshop code snippet"
            tabIndex={0}
            className="max-h-[32rem] overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100"
          >
            <code>{data.code}</code>
          </pre>
        </div>
      )}

      {(data.run || data.expect) && (
        <div className="grid gap-3 md:grid-cols-2">
          {data.run && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-relaxed text-[#334155]">
              <Play
                className="mt-0.5 h-4 w-4 shrink-0 text-blue-700"
                aria-hidden="true"
              />
              <div>
                <strong className="block text-xs uppercase tracking-wider text-blue-900">
                  Run it
                </strong>
                <p className="mt-1">{data.run}</p>
              </div>
            </div>
          )}
          {data.expect && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-relaxed text-[#334155]">
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"
                aria-hidden="true"
              />
              <div>
                <strong className="block text-xs uppercase tracking-wider text-emerald-900">
                  Expected result
                </strong>
                <p className="mt-1">{data.expect}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {data.challenge && (
        <div className="rounded-xl border border-orange-200/80 bg-orange-50/70 p-4 text-sm leading-relaxed text-[#334155]">
          <strong className="text-[#172033]">Next challenge:</strong>{" "}
          {data.challenge}
        </div>
      )}
    </div>
  );
}
