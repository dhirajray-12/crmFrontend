// frontend/src/pages/Adminpage/AdminPages/IBWithdrawalManagement.tsx
import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ChangeEvent } from "react";
import axios from "axios";
import { useToastStore } from "@/Store/toast.store";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  Eye,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  AlertCircle,
  FileText,
  Hash,
  MessageSquare,
  Users,
  XCircle,
  Wallet,
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ── Interfaces ──
interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  country?: string;
  phone?: string;
}

interface IBConfiguration {
  _id: string;
  IBbalance: number;
  referralCode: string;
  level?: number;
}

interface IBWithdrawal {
  _id: string;
  userId: User;
  ibConfigurationId: IBConfiguration;
  amount: number;
  paymentMethod: string;
  paymentDetails: any;
  withdrawalMethod?: string;
  bankDetails?: Record<string, unknown>;
  walletDetails?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt?: string;
  approvedAt?: string;
  approvedBy?: User;
  adminNotes?: string;
  rejectedReason?: string;
  transactionId?: string;
}

interface WithdrawalStats {
  totalRequests: number;
  totalAmount: number;
  byStatus: {
    [key: string]: { count: number; amount: number };
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  status: string;
  page: number;
  limit: number;
}

interface ApproveFormData {
  adminNotes: string;
  transactionId: string;
}

interface RejectFormData {
  rejectedReason: string;
  adminNotes: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  withdrawals?: IBWithdrawal[];
  withdrawal?: IBWithdrawal;
  stats?: WithdrawalStats;
  pagination?: PaginationInfo;
  data?: T;
}

// ── Helpers ──
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const formatDetailLabel = (key: string): string =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const parsePaymentDetails = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const formatDetailValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "")
    return "Not provided";
  if (Array.isArray(value))
    return value.length > 0
      ? value.map((i) => formatDetailValue(i)).join(", ")
      : "Not provided";
  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(
      ([, v]) =>
        v !== null &&
        v !== undefined &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0),
    );
    return entries.length > 0
      ? entries
          .map(([k, v]) => `${formatDetailLabel(k)}: ${formatDetailValue(v)}`)
          .join(" | ")
      : "Not provided";
  }
  return String(value);
};

// ── Shared field style ──
const fieldCls =
  "w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:outline-none focus:border-accent transition-colors resize-none";

// ── Status helpers ──
const statusConfig = {
  pending: {
    bg: "bg-surface-strong text-heading",
    dot: "bg-accent",
    label: "Pending",
  },
  approved: {
    bg: "bg-[#5a7a5a] text-[#edfaed]",
    dot: "bg-[#8ab88a]",
    label: "Approved",
  },
  rejected: {
    bg: "bg-[#7a3a3a] text-heading",
    dot: "bg-[#c47a7a]",
    label: "Rejected",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = statusConfig[status as keyof typeof statusConfig] || {
    bg: "bg-surface-strong text-heading",
    dot: "bg-accent",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const IBWithdrawalManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<IBWithdrawal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    page: 1,
    limit: 10,
  });
  const [approveFormData, setApproveFormData] = useState<ApproveFormData>({
    adminNotes: "",
    transactionId: "",
  });
  const [rejectFormData, setRejectFormData] = useState<RejectFormData>({
    rejectedReason: "",
    adminNotes: "",
  });

  const addToast = useToastStore((state) => state.addToast);
  const ibWithdrawalActionGuard = useActionGuard({
    isBusy: actionLoading,
    warningMessage:
      "A withdrawal decision is already being processed. Please wait before clicking again.",
  });

  // ── API ──
  const getAllWithdrawalsAPI = async (f: Filters) => {
    const params = new URLSearchParams({
      status: f.status,
      page: f.page.toString(),
      limit: f.limit.toString(),
    });
    const r = await axios.get<ApiResponse<any>>(
      `${API_URL}/admin/ib-withdrawals?${params}`,
      { withCredentials: true },
    );
    return r.data;
  };
  const getWithdrawalStatsAPI = async () => {
    const r = await axios.get<ApiResponse<any>>(
      `${API_URL}/admin/ib-withdrawals/stats`,
      { withCredentials: true },
    );
    return r.data;
  };
  const getWithdrawalDetailsAPI = async (id: string) => {
    const r = await axios.get<ApiResponse<any>>(
      `${API_URL}/admin/ib-withdrawals/${id}`,
      { withCredentials: true },
    );
    return r.data;
  };
  const approveWithdrawalAPI = async (id: string, data: ApproveFormData) => {
    const r = await axios.put<ApiResponse<any>>(
      `${API_URL}/admin/ib-withdrawals/${id}/approve`,
      data,
      { withCredentials: true },
    );
    return r.data;
  };
  const rejectWithdrawalAPI = async (id: string, data: RejectFormData) => {
    const r = await axios.put<ApiResponse<any>>(
      `${API_URL}/admin/ib-withdrawals/${id}/reject`,
      data,
      { withCredentials: true },
    );
    return r.data;
  };

  const {
    data: withdrawalsResponse,
    isLoading: loading,
    error: withdrawalsError,
  } = useQuery({
    queryKey: ["adminIbWithdrawals", filters],
    queryFn: () => getAllWithdrawalsAPI(filters),
    staleTime: 15 * 1000,
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["adminIbWithdrawalStats"],
    queryFn: getWithdrawalStatsAPI,
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!withdrawalsError) return;
    const e = withdrawalsError as any;
    addToast("error", e.message || "Failed to fetch withdrawals");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawalsError]);

  const withdrawals = withdrawalsResponse?.withdrawals || [];
  const pagination: PaginationInfo =
    withdrawalsResponse?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
  const stats = statsResponse?.stats || null;

  const invalidateIbWithdrawals = () => {
    queryClient.invalidateQueries({ queryKey: ["adminIbWithdrawals"] });
    queryClient.invalidateQueries({ queryKey: ["adminIbWithdrawalStats"] });
  };

  useRealtimeSync({
    enabled: true,
    events: ["withdrawal_updated", "commission_updated"],
    onEvent: (event) => {
      if (event === "withdrawal_updated" || event === "commission_updated") {
        invalidateIbWithdrawals();
      }
    },
  });

  const handleViewDetails = async (id: string) => {
    try {
      const r = await getWithdrawalDetailsAPI(id);
      setSelectedWithdrawal(r.withdrawal || null);
      setShowDetailsModal(true);
    } catch (e: any) {
      addToast("error", e.message || "Failed to fetch details");
    }
  };

  const handleApproveClick = (w: IBWithdrawal) => {
    setSelectedWithdrawal(w);
    setApproveFormData({ adminNotes: "", transactionId: "" });
    setShowApproveModal(true);
  };

  const handleRejectClick = (w: IBWithdrawal) => {
    setSelectedWithdrawal(w);
    setRejectFormData({ rejectedReason: "", adminNotes: "" });
    setShowRejectModal(true);
  };

  const handleApproveSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await ibWithdrawalActionGuard.run(async () => {
      if (!selectedWithdrawal) return;
      try {
        setActionLoading(true);
        await approveWithdrawalAPI(selectedWithdrawal._id, approveFormData);
        addToast("success", "Withdrawal approved successfully");
        setShowApproveModal(false);
        invalidateIbWithdrawals();
      } catch (e: any) {
        addToast("error", e.message || "Failed to approve");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleRejectSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await ibWithdrawalActionGuard.run(async () => {
      if (!selectedWithdrawal) return;
      try {
        setActionLoading(true);
        await rejectWithdrawalAPI(selectedWithdrawal._id, rejectFormData);
        addToast("success", "Withdrawal rejected successfully");
        setShowRejectModal(false);
        invalidateIbWithdrawals();
      } catch (e: any) {
        addToast("error", e.message || "Failed to reject");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getPaymentMethodLabel = (w: IBWithdrawal) =>
    w.paymentMethod || w.withdrawalMethod || "N/A";

  const getPaymentDetails = (w: IBWithdrawal): Record<string, unknown> => {
    const raw = w.bankDetails || w.walletDetails || w.paymentDetails;
    const parsed = parsePaymentDetails(raw);
    if (isPlainObject(parsed)) return parsed;
    if (typeof parsed === "string") return { details: parsed };
    if (Array.isArray(parsed)) return { details: parsed };
    return {};
  };

  const getVisiblePaymentDetailEntries = (
    w: IBWithdrawal,
  ): Array<[string, unknown]> =>
    Object.entries(getPaymentDetails(w)).filter(
      ([, v]) =>
        v !== null &&
        v !== undefined &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0),
    );

  const pendingCount = stats?.byStatus?.pending?.count || 0;
  const approvedCount = stats?.byStatus?.approved?.count || 0;
  const rejectedCount = stats?.byStatus?.rejected?.count || 0;

  if (loading && withdrawals.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 font-['Lato',_sans-serif]"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)",
        }}
      >
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-body text-sm tracking-widest uppercase">
          Loading withdrawals…
        </p>
      </div>
    );
  }

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Lato',_sans-serif]"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239,227,202,0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222,204,168,0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      {/* grain */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6">
        {/* ══ HERO HEADER ══ */}
        <div
          className="relative overflow-hidden rounded-[30px] border border-border"
          style={{
            background:
              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow:
              "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full border border-accent opacity-[0.08] -mr-24 -mt-24" />
            <div className="absolute top-0 right-0 w-56 h-56 rounded-full border border-accent opacity-[0.12] -mr-14 -mt-14" />
            <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full border border-accent opacity-[0.08] -ml-16 -mb-16" />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-accent opacity-[0.06]"
                style={{ left: `${25 + i * 25}%` }}
              />
            ))}
          </div>

          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 lg:gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-px bg-surface-strong" />
                  <span
                    className="text-body text-[10px] tracking-[0.4em] uppercase font-semibold"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Administration
                  </span>
                </div>
                <h1
                  className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading tracking-tight leading-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  IB Withdrawal
                    <span className="block italic text-body">
                    Management
                  </span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-body">
                  Review, approve, and process IB partner withdrawal requests
                  from one unified surface.
                </p>
              </div>

              {/* stat tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
                {[
                  {
                    label: "Total",
                    value: stats?.totalRequests ?? 0,
                    icon: Users,
                    accent: "#c4a055",
                  },
                  {
                    label: "Pending",
                    value: pendingCount,
                    icon: Clock,
                    accent: "#d4a854",
                  },
                  {
                    label: "Approved",
                    value: approvedCount,
                    icon: Check,
                    accent: "#8ab88a",
                  },
                  {
                    label: "Rejected",
                    value: rejectedCount,
                    icon: XCircle,
                    accent: "#c47a7a",
                  },
                ].map(({ label, value, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-surface-strong/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3" style={{ color: accent }} />
                      <span
                        className="text-[10px] tracking-widest uppercase"
                        style={{ color: accent }}
                      >
                        {label}
                      </span>
                    </div>
                    <span
                      className="text-2xl font-semibold text-heading"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══ AMOUNT SUMMARY STRIP ══ */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Pending Volume",
                amount: stats.byStatus?.pending?.amount || 0,
                color: "var(--body)",
                bg: "from-surface-strong to-surface",
                border: "var(--border)",
              },
              {
                label: "Approved Volume",
                amount: stats.byStatus?.approved?.amount || 0,
                color: "#3a6a2a",
                bg: "from-[#f0f8f0] to-[#ddf0dd]",
                border: "#b0d8b0",
              },
              {
                label: "Rejected Volume",
                amount: stats.byStatus?.rejected?.amount || 0,
                color: "var(--status-red)",
                bg: "from-surface-strong to-surface-strong",
                border: "#e0b0b0",
              },
            ].map(({ label, amount, color, bg, border }) => (
              <div
                key={label}
                className={`rounded-2xl border p-4 bg-gradient-to-br ${bg}`}
                style={{
                  borderColor: border,
                  boxShadow: "0 2px 12px rgba(139,100,40,0.07)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-3.5 h-3.5" style={{ color }} />
                  <span
                    className="text-[10px] uppercase tracking-widest font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </span>
                </div>
                <div
                  className="text-2xl font-light"
                  style={{ color, fontFamily: "'Cormorant Garamond', serif" }}
                >
                  ${amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ TOOLBAR ══ */}
        <div
          className="rounded-[30px] border border-border overflow-visible bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
          style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
          }}
        >
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* status filter pill */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "all", label: "All" },
                  { val: "pending", label: "Pending" },
                  { val: "approved", label: "Approved" },
                  { val: "rejected", label: "Rejected" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() =>
                      setFilters({ ...filters, status: val, page: 1 })
                    }
                    className="h-9 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all border"
                    style={
                      filters.status === val
                        ? {
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                            color: "var(--heading)",
                            borderColor: "var(--border)",
                          }
                        : {
                            background: "var(--surface-strong)",
                            color: "var(--body)",
                            borderColor: "var(--border)",
                          }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="sm:ml-auto flex gap-2">
                {/* per page */}
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center gap-2 h-9 px-3 rounded-xl text-xs border border-border bg-surface-strong text-body transition-all hover:border-accent"
                  >
                    <span>{filters.limit} / page</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {filterOpen && (
                    <div
                      className="absolute top-full right-0 mt-1.5 z-50 w-28 rounded-xl border border-border p-1.5"
                      style={{
                        background: "var(--surface-strong)",
                        boxShadow: "0 8px 32px rgba(74,50,24,0.16)",
                      }}
                    >
                      {[10, 25, 50].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setFilters({ ...filters, limit: n, page: 1 });
                            setFilterOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-strong transition-colors"
                          style={{
                            color: filters.limit === n ? "#4a3218" : "#5a4020",
                          }}
                        >
                          {n} per page
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* meta row */}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm text-body">
                <span className="font-semibold text-heading">
                  {pagination.total}
                </span>{" "}
                withdrawal{pagination.total !== 1 ? "s" : ""} · page{" "}
                <span className="font-semibold text-heading">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {Math.max(1, pagination.pages)}
                </span>
              </span>
              {loading && (
                <div className="flex items-center gap-1.5 text-xs text-accent">
                  <div className="w-3 h-3 border border-accent border-t-transparent rounded-full animate-spin" />
                  Refreshing…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══ DESKTOP TABLE ══ */}
        <div
          className="hidden lg:block rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
          style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)", }}
        >
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background:
                    "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "User",
                  "Amount",
                  "Payment Method",
                  "Status",
                  "Requested",
                  "Actions",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body ${i === 5 ? "text-center" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-accent text-sm"
                  >
                    No withdrawal requests found
                  </td>
                </tr>
              ) : (
                withdrawals.map((w, idx) => (
                  <tr
                    key={w._id}
                    className="border-b border-border hover:bg-surface-strong transition-colors duration-150"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-heading text-sm font-semibold"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                          }}
                        >
                          {w.userId?.firstname?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-heading text-sm">
                            {w.userId?.firstname} {w.userId?.lastname}
                          </div>
                          <div className="text-xs text-accent mt-0.5">
                            {w.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-4">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs text-accent">$</span>
                        <span
                          className="text-lg font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {w.amount.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    {/* Method */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border border-border bg-surface-strong text-heading">
                        <Wallet className="w-3 h-3" />
                        {getPaymentMethodLabel(w)}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={w.status} />
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-heading">
                      {formatDate(w.createdAt)}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewDetails(w._id)}
                          title="View details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                          style={{
                            background: "var(--surface-strong)",
                            borderColor: "var(--border)",
                            color: "var(--body)",
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {w.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveClick(w)}
                              title="Approve"
                              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                              style={{
                                background: "#edf8e8",
                                borderColor: "#a0c890",
                                color: "#3a6a2a",
                              }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(w)}
                              title="Reject"
                              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                              style={{
                                background: "var(--surface-strong)",
                                borderColor: "#d4a090",
                                color: "var(--status-red)",
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ══ MOBILE CARDS ══ */}
        <div className="lg:hidden space-y-3">
          {withdrawals.length === 0 ? (
            <div
              className="rounded-2xl border border-border p-10 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            >
              <p className="text-body text-sm">
                No withdrawal requests found
              </p>
            </div>
          ) : (
            withdrawals.map((w, idx) => (
              <div
                key={w._id}
                className="rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                style={{
                  boxShadow: "0 2px 16px rgba(139,100,40,0.09)",
                  animationDelay: `${idx * 40}ms`,
                }}
              >
                {/* card header */}
                <div
                  className="flex items-center justify-between p-4 border-b border-border"
                  style={{
                    background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-heading font-semibold"
                      style={{
                        background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                      }}
                    >
                      {w.userId?.firstname?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-semibold text-heading text-sm truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {w.userId?.firstname} {w.userId?.lastname}
                      </div>
                      <div className="text-xs text-accent truncate">
                        {w.userId?.email}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={w.status} />
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Amount",
                        value: (
                          <span
                            className="text-base font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                            style={{
                              fontFamily: "'Cormorant Garamond', serif",
                            }}
                          >
                            ${w.amount.toFixed(2)}
                          </span>
                        ),
                      },
                      {
                        label: "Method",
                        value: (
                          <span className="text-xs text-heading truncate">
                            {getPaymentMethodLabel(w)}
                          </span>
                        ),
                      },
                      {
                        label: "Date",
                        value: (
                          <span className="text-xs text-heading">
                            {formatDate(w.createdAt)}
                          </span>
                        ),
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-surface-strong border border-border rounded-xl px-3 py-2"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-accent mb-0.5">
                          {label}
                        </div>
                        {value}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => handleViewDetails(w._id)}
                      className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all"
                      style={{
                        background: "var(--surface-strong)",
                        borderColor: "var(--border)",
                        color: "var(--body)",
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" /> Details
                    </button>
                    {w.status === "pending" ? (
                      <>
                        <button
                          onClick={() => handleApproveClick(w)}
                          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all"
                          style={{
                            background: "#edf8e8",
                            borderColor: "#a0c890",
                            color: "#3a6a2a",
                          }}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectClick(w)}
                          className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium transition-all"
                          style={{
                            background: "var(--surface-strong)",
                            borderColor: "#d4a090",
                            color: "var(--status-red)",
                          }}
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : (
                      <div className="col-span-2" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {pagination.pages > 1 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)", }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body">
                Showing{" "}
                <span className="font-semibold text-heading">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>
                –
                <span className="font-semibold text-heading">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {pagination.total}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.pages ||
                        Math.abs(p - pagination.page) <= 1,
                    )
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-accent text-xs px-1">…</span>
                        )}
                        <button
                          onClick={() => setFilters({ ...filters, page })}
                          className="w-9 h-9 rounded-xl text-sm transition-all"
                          style={
                            pagination.page === page
                              ? {
                                  background:
                                    "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                                  color: "var(--heading)",
                                }
                              : {
                                  border: "1px solid var(--border)",
                                  color: "var(--heading)",
                                }
                          }
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() =>
                    setFilters({ ...filters, page: filters.page + 1 })
                  }
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ DETAILS MODAL ══ */}
      {showDetailsModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            {/* header */}
            <div
              className="sticky top-0 flex items-center justify-between p-5 border-b border-border z-10"
              style={{
                background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
              }}
            >
              <div>
                <p
                  className="text-accent text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel',serif" }}
                >
                  Withdrawal Record
                </p>
                <h3
                  className="text-xl font-light text-heading mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  {selectedWithdrawal.userId?.firstname}{" "}
                  {selectedWithdrawal.userId?.lastname}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* key info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "Amount",
                    value: `$${selectedWithdrawal.amount.toFixed(2)}`,
                    large: true,
                  },
                  {
                    label: "Status",
                    value: null,
                    badge: selectedWithdrawal.status,
                  },
                  {
                    label: "Method",
                    value: getPaymentMethodLabel(selectedWithdrawal),
                  },
                  { label: "Email", value: selectedWithdrawal.userId?.email },
                  {
                    label: "Requested",
                    value: formatDate(selectedWithdrawal.createdAt),
                  },
                  ...(selectedWithdrawal.processedAt
                    ? [
                        {
                          label: "Processed",
                          value: formatDate(selectedWithdrawal.processedAt),
                        },
                      ]
                    : []),
                ].map(({ label, value, badge, large }, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-surface-strong px-4 py-3"
                  >
                    <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                      {label}
                    </div>
                    {badge ? (
                      <StatusBadge status={badge} />
                    ) : large ? (
                      <div
                        className="text-xl font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {value}
                      </div>
                    ) : (
                      <div className="text-sm text-heading break-words">
                        {value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* payment details */}
              {getVisiblePaymentDetailEntries(selectedWithdrawal).length >
                0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4 text-body" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-body">
                      Payment Details
                    </span>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-strong p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {getVisiblePaymentDetailEntries(selectedWithdrawal).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-xl border border-border bg-surface-strong px-3 py-2.5"
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-accent mb-1">
                            {formatDetailLabel(key)}
                          </p>
                          <p className="text-sm text-heading break-words font-mono">
                            {formatDetailValue(value)}
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* notes / reason / txid */}
              {selectedWithdrawal.adminNotes && (
                <div className="rounded-xl border border-border bg-surface-strong p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-body" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-body">
                      Admin Notes
                    </span>
                  </div>
                  <p className="text-sm text-heading">
                    {selectedWithdrawal.adminNotes}
                  </p>
                </div>
              )}
              {selectedWithdrawal.rejectedReason && (
                <div className="rounded-xl border border-[#e0b0b0] bg-surface-strong p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-[#8a3a3a] dark:text-[#cf8c8c]" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#8a3a3a] dark:text-[#cf8c8c]">
                      Rejection Reason
                    </span>
                  </div>
                  <p className="text-sm text-[#7a2a2a] dark:text-[#d58686]">
                    {selectedWithdrawal.rejectedReason}
                  </p>
                </div>
              )}
              {selectedWithdrawal.transactionId && (
                <div className="rounded-xl border border-border bg-surface-strong p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-3.5 h-3.5 text-body" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-body">
                      Transaction ID
                    </span>
                  </div>
                  <p className="text-sm text-heading font-mono break-all">
                    {selectedWithdrawal.transactionId}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                {selectedWithdrawal.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleApproveClick(selectedWithdrawal);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-85"
                      style={{
                        background: "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                        color: "#edfaed",
                      }}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleRejectClick(selectedWithdrawal);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-85"
                      style={{
                        background: "linear-gradient(135deg, #7a2a2a, #5a1a1a)",
                        color: "var(--heading)",
                      }}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ APPROVE MODAL ══ */}
      {showApproveModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border overflow-hidden"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,#f0f8ed 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div
              className="flex items-center justify-between p-5 border-b border-[#c0d8b0]"
              style={{
                background: "linear-gradient(135deg, #1e3018, #3a6a2a)",
              }}
            >
              <div>
                <p
                  className="text-[#8ab88a] text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel',serif" }}
                >
                  Approve
                </p>
                <h3
                  className="text-xl font-light text-[#edfaed] mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  Confirm Withdrawal
                </h3>
              </div>
              <button
                onClick={() => setShowApproveModal(false)}
                className="w-9 h-9 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-[#edfaed] hover:bg-black/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleApproveSubmit}
              className="p-5 sm:p-6 space-y-4"
            >
              {/* warning */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-strong p-3.5">
                <AlertCircle className="w-4 h-4 text-body flex-shrink-0 mt-0.5" />
                <p className="text-xs text-heading">
                  This will deduct{" "}
                  <span className="font-bold">
                    ${selectedWithdrawal.amount.toFixed(2)}
                  </span>{" "}
                  from{" "}
                  <span className="font-semibold">
                    {selectedWithdrawal.userId?.firstname}{" "}
                    {selectedWithdrawal.userId?.lastname}
                  </span>
                  's IB balance.
                </p>
              </div>

              {/* amount preview */}
              <div className="rounded-xl border border-border bg-surface-strong px-4 py-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-accent">
                  Withdrawal Amount
                </span>
                <span
                  className="text-xl font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  ${selectedWithdrawal.amount.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  <Hash className="w-3 h-3 inline mr-1" />
                  Transaction ID{" "}
                  <span className="normal-case text-accent">(optional)</span>
                </label>
                <input
                  type="text"
                  value={approveFormData.transactionId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setApproveFormData({
                      ...approveFormData,
                      transactionId: e.target.value,
                    })
                  }
                  className={fieldCls}
                  placeholder="Enter transaction ID…"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Admin Notes{" "}
                  <span className="normal-case text-accent">(optional)</span>
                </label>
                <textarea
                  value={approveFormData.adminNotes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setApproveFormData({
                      ...approveFormData,
                      adminNotes: e.target.value,
                    })
                  }
                  className={fieldCls}
                  rows={3}
                  placeholder="Add internal notes…"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                    color: "#edfaed",
                  }}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#edfaed] border-t-transparent rounded-full animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Approve
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ REJECT MODAL ══ */}
      {showRejectModal && selectedWithdrawal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,31,14,0.65)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border overflow-hidden"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
              boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
            }}
          >
            <div
              className="flex items-center justify-between p-5 border-b border-[#e0b0b0]"
              style={{
                background: "linear-gradient(135deg, #3a1010, #7a2a2a)",
              }}
            >
              <div>
                <p
                  className="text-[#c47a7a] text-[10px] tracking-[0.3em] uppercase"
                  style={{ fontFamily: "'Cinzel',serif" }}
                >
                  Reject
                </p>
                <h3
                  className="text-xl font-light text-[#f5dede] mt-0.5"
                  style={{ fontFamily: "'Cormorant Garamond',serif" }}
                >
                  Decline Withdrawal
                </h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="w-9 h-9 rounded-full bg-black/20 border border-white/20 flex items-center justify-center text-[#f5dede] hover:bg-black/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleRejectSubmit}
              className="p-5 sm:p-6 space-y-4"
            >
              {/* amount preview */}
              <div className="rounded-xl border border-[#e0b0b0] bg-surface-strong px-4 py-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#9a5050] dark:text-[#ca9191]">
                  Amount to Return
                </span>
                <span
                  className="text-xl font-light text-[#7a2a2a] dark:text-[#d58686]"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  ${selectedWithdrawal.amount.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  <FileText className="w-3 h-3 inline mr-1" />
                  Rejection Reason <span className="text-[#8a3a3a] dark:text-[#cf8c8c]">*</span>
                </label>
                <textarea
                  value={rejectFormData.rejectedReason}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setRejectFormData({
                      ...rejectFormData,
                      rejectedReason: e.target.value,
                    })
                  }
                  className={fieldCls}
                  rows={3}
                  placeholder="Provide reason for rejection…"
                  required
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  Admin Notes{" "}
                  <span className="normal-case text-accent">(optional)</span>
                </label>
                <textarea
                  value={rejectFormData.adminNotes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setRejectFormData({
                      ...rejectFormData,
                      adminNotes: e.target.value,
                    })
                  }
                  className={fieldCls}
                  rows={2}
                  placeholder="Add internal notes…"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #7a2a2a, #5a1a1a)",
                    color: "var(--heading)",
                  }}
                >
                  {actionLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-border border-t-transparent rounded-full animate-spin" />{" "}
                      Processing…
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" /> Reject
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IBWithdrawalManagement;
