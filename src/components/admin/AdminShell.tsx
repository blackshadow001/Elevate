"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  IndianRupee,
  Users,
  UserCog,
  GraduationCap,
  ShieldCheck,
  ShoppingBag,
  FolderTree,
  Radio,
  Award,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/ui/Logo";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "warning" | "info" | "neutral";
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/control-center", icon: LayoutDashboard },
    ],
  },
  {
    group: "MARKETPLACE",
    items: [
      { label: "Courses Catalog", href: "/control-center/courses", icon: BookOpen },
      { label: "Review Queue", href: "/control-center/courses/approvals", icon: ClipboardCheck },
      { label: "Categories", href: "/control-center/categories", icon: FolderTree },
    ],
  },
  {
    group: "PEOPLE",
    items: [
      { label: "All Users", href: "/control-center/users", icon: Users },
      { label: "Tutors", href: "/control-center/users?role=instructor", icon: GraduationCap },
      { label: "Learners", href: "/control-center/users?role=learner", icon: ShieldCheck },
      { label: "Admin Profiles", href: "/control-center/profiles", icon: UserCog },
    ],
  },
  {
    group: "COMMERCE",
    items: [
      { label: "Pricing & Margins", href: "/control-center/pricing", icon: IndianRupee },
      { label: "Orders & Sales", href: "/control-center/orders", icon: ShoppingBag },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { label: "Live Classes", href: "/control-center/operations/live", icon: Radio },
      { label: "Certificates", href: "/control-center/operations/certificates", icon: Award },
    ],
  },
  {
    group: "PLATFORM",
    items: [
      { label: "Settings & System", href: "/control-center/settings", icon: Settings },
    ],
  },
];

interface AdminLayoutContextType {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  pendingApprovalsCount: number;
}

const AdminContext = createContext<AdminLayoutContextType>({
  sidebarCollapsed: false,
  setSidebarCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
  pendingApprovalsCount: 0,
});

export const useAdminShell = () => useContext(AdminContext);

export default function AdminShell({
  children,
  adminUser,
}: {
  children: React.ReactNode;
  adminUser: { id: string; name: string; email: string; role: string; isSuperAdmin?: boolean };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const visibleGroups = adminUser.isSuperAdmin ? ADMIN_NAV_GROUPS : ADMIN_NAV_GROUPS.filter(group => group.group !== "PEOPLE");

  // Fetch pending review queue count for badge
  useEffect(() => {
    let active = true;
    fetch("/api/admin/analytics", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (active && data.data?.metrics?.pendingApprovalsCount !== undefined) {
          setPendingApprovals(data.data.metrics.pendingApprovalsCount);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  const handleSignOut = async () => {
    await logout();
    router.replace("/control-center/login");
    router.refresh();
  };

  return (
    <AdminContext.Provider
      value={{
        sidebarCollapsed: collapsed,
        setSidebarCollapsed: setCollapsed,
        mobileOpen,
        setMobileOpen,
        pendingApprovalsCount: pendingApprovals,
      }}
    >
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col antialiased text-[#172033]">
        {/* Top Operational Bar */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-6 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"
              aria-label="Open sidebar menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <Logo href="/control-center" />
              <span className="rounded-md bg-[#FFF0EB] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#FF6B35]">Control Center</span>
            </div>

            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex ml-4 p-1.5 rounded-lg text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#172033] transition-colors"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Quick links & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#FF6B35] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#FFF7F4]"
            >
              <span>View Live Platform</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Pending Approvals quick alert */}
            {pendingApprovals > 0 && (
              <Link
                href="/control-center/courses/approvals"
                className="flex items-center gap-1.5 text-xs font-bold text-[#E85D2A] bg-[#FFF0EB] border border-[#FFD8CA] px-2.5 py-1.5 rounded-lg hover:bg-[#FFE3D8] transition-colors"
                title={`${pendingApprovals} courses awaiting review`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B35] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B35]"></span>
                </span>
                <span>{pendingApprovals} to review</span>
              </Link>
            )}

            {/* Admin identity pill */}
            <div className="flex items-center gap-3 border-l border-[#E5E7EB] pl-3 sm:pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#172033] text-white font-bold text-xs uppercase shadow-xs">
                {adminUser.name.slice(0, 2)}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                {adminUser.isSuperAdmin ? <Link href="/control-center/profiles" title="Manage administrator profiles and password" className="text-xs font-bold text-[#172033] leading-none hover:text-[#FF6B35]">{adminUser.name}</Link>
                  : <span className="text-xs font-bold text-[#172033] leading-none">{adminUser.name}</span>}
                <span className="text-[10px] text-[#64748B] font-medium leading-tight mt-0.5">
                  {adminUser.isSuperAdmin ? "Super Admin" : "Administrator"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-2 rounded-xl text-[#64748B] hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Sign out of admin session"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex flex-1">
          {/* Desktop Persistent Sidebar */}
          <aside
            className={`hidden lg:flex flex-col shrink-0 border-r border-[#E5E7EB] bg-white transition-all duration-200 ${
              collapsed ? "w-16" : "w-64"
            }`}
          >
            <div className="flex-1 overflow-y-auto py-5 px-3 space-y-6">
              {visibleGroups.map((group) => (
                <div key={group.group}>
                  {!collapsed && (
                    <div className="px-3 mb-2 text-[10px] font-black tracking-wider text-[#94A3B8] uppercase">
                      {group.group}
                    </div>
                  )}
                  <nav className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === "/control-center"
                          ? pathname === "/control-center"
                          : pathname.startsWith(item.href.split("?")[0]) &&
                            (item.href.includes("?")
                              ? false
                              : true);
                      
                      const badgeCount =
                        item.href === "/control-center/courses/approvals" && pendingApprovals > 0
                          ? pendingApprovals
                          : item.badge;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                            isActive
                              ? "bg-[#172033] text-white shadow-xs"
                              : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"
                          } ${collapsed ? "justify-center px-0" : ""}`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#FF6B35]" : "text-[#64748B]"}`} />
                          {!collapsed && (
                            <span className="flex-1 truncate">{item.label}</span>
                          )}
                          {!collapsed && badgeCount !== undefined && (
                            <span
                              className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                isActive
                                  ? "bg-[#FF6B35] text-white"
                                  : "bg-[#FFF0EB] text-[#E85D2A]"
                              }`}
                            >
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Sidebar Footer info */}
            {!collapsed && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#FFFDF9]/60">
                <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-black text-[#172033]">SQLite Production DB</span>
                  </div>
                  <p className="mt-1 text-[10px] text-[#64748B]">
                    Engine: <code className="text-[#172033] font-mono">node:sqlite</code>
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-[#172033]/60 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#172033] text-[#FF6B35] font-black">
                        L
                      </span>
                      <span className="font-extrabold text-sm text-[#172033]">
                        {adminUser.isSuperAdmin ? "Super Admin Panel" : "Admin Panel"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
                    {visibleGroups.map((group) => (
                      <div key={group.group}>
                        <div className="px-2 mb-1.5 text-[10px] font-black tracking-wider text-[#94A3B8] uppercase">
                          {group.group}
                        </div>
                        <nav className="space-y-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              item.href === "/control-center"
                                ? pathname === "/control-center"
                                : pathname.startsWith(item.href.split("?")[0]);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold ${
                                  isActive
                                    ? "bg-[#172033] text-white"
                                    : "text-[#64748B] hover:bg-[#F8FAFC]"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                                <span className="flex-1">{item.label}</span>
                              </Link>
                            );
                          })}
                        </nav>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Workspace Stage */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
