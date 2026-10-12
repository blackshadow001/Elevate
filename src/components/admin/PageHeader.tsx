import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8]">
            <Link href="/control-center" className="hover:text-[#FF6B35] transition-colors">
              Admin
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="h-3 w-3 shrink-0 text-[#CBD5E1]" />
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[#FF6B35] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[#64748B]">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">
            {title}
          </h1>
          {badge}
        </div>

        {subtitle && (
          <p className="mt-1 text-sm text-[#64748B] max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
