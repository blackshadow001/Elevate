"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

interface TocItem {
  id: string;
  title: string;
}

export function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs"
      style={{ scrollTargetGroup: "auto" } as React.CSSProperties}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-xs font-extrabold uppercase tracking-widest text-[#172033]">
        <ListTree className="h-4 w-4 text-[#FF6B35]" aria-hidden="true" />
        <span>On This Page</span>
      </div>
      <ol className="space-y-1.5 text-sm">
        {items.map((item, idx) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveId(item.id)}
                className={`block border-l-2 py-1 pl-3 text-[13px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B35] ${
                  isActive
                    ? "border-[#FF6B35] font-bold text-[#172033]"
                    : "border-transparent font-medium text-[#64748B] hover:border-slate-300 hover:text-[#172033]"
                }`}
              >
                <span className="mr-1.5 font-mono text-[11px] text-[#FF6B35]">
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                {item.title}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
