"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  IndianRupee,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";

interface OrderRow {
  id: string;
  status: string;
  totalMinor: number;
  currency: string;
  providerReference: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    instructorName: string;
  } | null;
}

interface OrderSummary {
  totalOrders: number;
  paidVolumeMinor: number;
  paidCount: number;
  pendingCount: number;
  refundedCount: number;
}
interface OrderDetail {
  order: { id: string; status: string; total_minor: number; currency: string; provider_reference: string | null; user_name: string; user_email: string; created_at: string };
  items: Array<{ id: string; course_title: string; price_minor: number }>;
  payments: Array<{ id: string; provider: string; status: string; amount_minor: number; verified_at: string | null }>;
}

const formatRupees = (minor: number) =>
  `₹${(minor / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to load orders");
      
      const ordersData = Array.isArray(json.data?.orders)
        ? json.data.orders
        : Array.isArray(json.data)
        ? json.data
        : [];
      
      setOrders(ordersData);
      setTotal(json.data?.pagination?.total || 0);
      if (json.data?.summary) {
        setSummary(json.data.summary);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error connecting to server");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadOrders);
  }, [statusFilter, search, page]);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const inspectOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, { credentials: "same-origin" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error?.message || "Unable to load order details.");
      setDetail(json.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load order details."); }
  };

  const filteredOrders = safeOrders;

  const totalVolume = summary?.paidVolumeMinor ?? safeOrders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + (o.totalMinor || 0), 0);

  const totalOrdersCount = summary?.totalOrders ?? safeOrders.length;
  const paidCount = summary?.paidCount ?? safeOrders.filter((o) => o.status === "paid").length;
  const paidRatio = totalOrdersCount > 0 ? Math.round((paidCount / totalOrdersCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Quotes & Status"
        subtitle="Persisted price quotes and order states. Payment capture and settlement require a payment provider."
        breadcrumbs={[{ label: "Commerce" }, { label: "Orders Ledger" }]}
      />

      {/* Top Ledger Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Recorded Paid Status Volume</span>
          <p className="mt-1 text-2xl font-black text-[#172033]">{formatRupees(totalVolume)}</p>
          <span className="text-[10px] text-[#64748B] font-semibold">Provider settlement is not configured</span>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Total Transactions</span>
          <p className="mt-1 text-2xl font-black text-[#172033]">{totalOrdersCount}</p>
          <span className="text-[10px] text-[#64748B]">Persisted order records</span>
        </div>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Recorded Paid Ratio</span>
          <p className="mt-1 text-2xl font-black text-[#FF6B35]">
            {paidRatio}%
          </p>
          <span className="text-[10px] text-[#64748B]">Based on stored status only</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or course title…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] pl-10 pr-4 py-2 text-xs text-[#172033] placeholder-[#94A3B8] focus:border-[#FF6B35] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3 py-2 text-xs font-semibold text-[#172033] focus:border-[#FF6B35] focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={loadOrders}
            className="rounded-xl border border-[#E5E7EB] p-2 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]"
            title="Refresh orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-xs">
        {loading && safeOrders.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#64748B]">Loading orders ledger…</div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-600">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#64748B]">No orders matching search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC] text-[#64748B]">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Order ID</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Customer</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Course Offering</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Total Amount</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Date</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#172033]">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#172033]">{order.user?.name || "Customer"}</span>
                        <span className="text-[10px] text-[#94A3B8]">{order.user?.email || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] max-w-xs">
                      {order.course?.title ? (
                        <div className="flex flex-col">
                          <span className="truncate font-semibold text-[#172033]">{order.course.title}</span>
                          {order.course.instructorName && (
                            <span className="text-[10px] text-[#94A3B8]">by {order.course.instructorName}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] italic">General Course Enrollment</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#172033] whitespace-nowrap">
                      {formatRupees(order.totalMinor)}
                    </td>
                    <td className="py-3.5 px-4 text-[#94A3B8] whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4"><button onClick={() => void inspectOrder(order.id)} className="font-bold text-[#FF6B35]">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {detail && <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-xs text-[#475569]"><div className="flex justify-between gap-3"><h2 className="text-base font-bold text-[#172033]">Order {detail.order.id}</h2><button onClick={() => setDetail(null)} aria-label="Close order details">Close</button></div><p className="mt-2">{detail.order.user_name} · {detail.order.user_email} · {detail.order.status}</p><p>Quote: {formatRupees(detail.order.total_minor)} {detail.order.currency} · Provider reference: {detail.order.provider_reference || "None"}</p><h3 className="mt-4 font-bold">Items</h3>{detail.items.map(item => <p key={item.id}>{item.course_title}: {formatRupees(item.price_minor)}</p>)}<h3 className="mt-4 font-bold">Payment records</h3>{detail.payments.length ? detail.payments.map(payment => <p key={payment.id}>{payment.provider} · {payment.status} · {formatRupees(payment.amount_minor)} · Verified: {payment.verified_at || "No"}</p>) : <p>No provider payment record exists.</p>}</section>}
      <div className="flex justify-end gap-3 text-xs text-[#64748B]"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="disabled:opacity-40">Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 25))}</span><button disabled={page * 25 >= total} onClick={() => setPage(page + 1)} className="disabled:opacity-40">Next</button></div>
    </div>
  );
}
