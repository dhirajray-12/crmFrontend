import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToastStore } from "@/Store/toast.store";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import axios from "axios";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { toConfiguredZonedDate } from "@/utils/timezoneStore";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  Radio,
  Search,
  TrendingUp,
  Wallet,
  X,
  XCircle,
  Clock,
  CheckCheck,
  Ban,
} from "lucide-react";

export interface WithdrawalUser {
  firstName: string;
  lastName: string;
  email: string;
}

export interface WithdrawalAccount {
  mt5Account: string;
  accountType: string;
  balance: number;
}

export interface WithdrawalBankDetails {
  bankName?: string;
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface WithdrawalEWalletDetails {
  walletId?: string;
  type?: string;
}

export interface WithdrawalItem {
  id: string;
  user: WithdrawalUser;
  account: WithdrawalAccount;
  accountNumber: string;
  accountType: string;
  amount: number;
  paymentMethod: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks: string;
  requestedDate: string;
  approvedAt?: string;
  rejectedAt?: string;
  doc?: string;
  // Where the client wants the payout sent - only one of these is
  // populated, depending on paymentMethod.
  bankDetails?: WithdrawalBankDetails;
  eWalletDetails?: WithdrawalEWalletDetails;
}

interface WithdrawalApiResponse {
  success: boolean;
  withdrawals: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface DateRange {
  from: Date;
  to?: Date;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getAccountNumberLabel = (account: unknown, fallback?: string) => {
  if (typeof fallback === "string" && fallback.trim()) return fallback;
  if (account && typeof account === "object" && "mt5Account" in account) {
    const mt5Account = (account as { mt5Account?: unknown }).mt5Account;
    return typeof mt5Account === "string" || typeof mt5Account === "number"
      ? String(mt5Account)
      : "N/A";
  }
  return "N/A";
};

const getAccountTypeLabel = (value: unknown, account?: unknown) => {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const candidate =
      (value as { accountType?: unknown; name?: unknown }).accountType ??
      (value as { accountType?: unknown; name?: unknown }).name;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  if (account && typeof account === "object" && "accountType" in account) {
    const accountType = (account as { accountType?: unknown }).accountType;
    if (typeof accountType === "string" && accountType.trim())
      return accountType;
  }
  return "N/A";
};

const getPaymentMethodLabel = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value;
  if (value && typeof value === "object") {
    const candidate =
      (value as { type?: unknown; name?: unknown; method?: unknown }).type ??
      (value as { type?: unknown; name?: unknown; method?: unknown }).name ??
      (value as { type?: unknown; name?: unknown; method?: unknown }).method;
    if (typeof candidate === "string" && candidate.trim()) return candidate;
  }
  return "N/A";
};

const mapWithdrawalItem = (w: any): WithdrawalItem => ({
  id: w._id,
  user: w.user,
  account: w.account,
  accountNumber: getAccountNumberLabel(w.account, w.accountNumber),
  accountType: getAccountTypeLabel(w.accountType, w.account),
  amount: w.amount,
  paymentMethod: getPaymentMethodLabel(w.paymentMethod),
  status: w.status,
  remarks: w.remarks,
  requestedDate: w.requestedDate,
  approvedAt: w.approvedDate ?? w.approvedAt,
  rejectedAt: w.rejectedDate ?? w.rejectedAt,
  doc: w.doc,
  bankDetails: w.bankDetails,
  eWalletDetails: w.eWalletDetails,
});

interface WithdrawalsQueryParams {
  page: number;
  limit: number;
  status: "All" | "Approved" | "Pending" | "Rejected";
  search: string;
  startDate?: string;
  endDate?: string;
}

// Note: the backend's /adminwithdrawals endpoint only supports
// status/search/date-range/page/limit filtering (see
// controllers/admin/withdrawalController.js#getAllWithdrawals) — it has no
// plan-type or payment-method filter, so those two stay client-side below
// (filtering only the currently-loaded page, same limitation the UI already
// had for them before this pass — they just weren't wired to anything at all).
const fetchWithdrawalsPage = async (
  params: WithdrawalsQueryParams,
): Promise<WithdrawalApiResponse> => {
  const res = await axios.get<WithdrawalApiResponse>(
    `${BASE_URL}/adminwithdrawals`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        status: params.status === "All" ? undefined : params.status,
        search: params.search.trim() || undefined,
        startDate: params.startDate,
        endDate: params.endDate,
      },
      withCredentials: true,
    },
  );
  if (!res.data.success) throw new Error("Failed to fetch withdrawals");
  return res.data;
};

// ── Field style ──
const fieldCls =
  "w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading font-['Lato',_sans-serif] focus:outline-none focus:border-accent disabled:bg-surface-strong disabled:text-body transition-colors";

const statusConfig = {
  Approved: {
    bg: "bg-[#5a7a5a]",
    text: "text-[#edfaed]",
    dot: "bg-[#8ab88a]",
    icon: CheckCheck,
    bar: "#5a7a5a",
  },
  Rejected: {
    bg: "bg-[#7a3a3a]",
    text: "text-heading",
    dot: "bg-[#c47a7a]",
    icon: Ban,
    bar: "#7a3a3a",
  },
  Pending: {
    bg: "bg-surface-strong",
    text: "text-heading",
    dot: "bg-accent",
    icon: Clock,
    bar: "#8a6a2a",
  },
};

const WithdrawalPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);

  const [bonus, setBonus] = useState("");
  const [processing, setProcessing] = useState(false);
  const adminWithdrawalActionGuard = useActionGuard({
    isBusy: processing,
    warningMessage:
      "A withdrawal decision is already being processed. Please wait before clicking again.",
  });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Approved" | "Pending" | "Rejected"
  >("All");
  const [planFilter, setPlanFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState<"amount" | "plan" | "date">(
    "date",
  );
  const [sortAsc, setSortAsc] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalItem | null>(null);

  const [remarksText, setRemarksText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [lastRealtimeAt, setLastRealtimeAt] = useState<Date | null>(null);

  const queryParams: WithdrawalsQueryParams = {
    page: currentPage,
    limit: itemsPerPage,
    status: statusFilter,
    search: debouncedSearch,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString().split("T")[0],
  };

  const {
    data: withdrawalsPage,
    isLoading: loading,
    error: withdrawalsError,
  } = useQuery({
    queryKey: ["adminWithdrawals", queryParams],
    queryFn: () => fetchWithdrawalsPage(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!withdrawalsError) return;
    console.error("Error fetching withdrawals:", withdrawalsError);
  }, [withdrawalsError]);

  const invalidateWithdrawals = () =>
    queryClient.invalidateQueries({ queryKey: ["adminWithdrawals"] });

  const withdrawals = (withdrawalsPage?.withdrawals ?? []).map(mapWithdrawalItem);
  const totalItems = withdrawalsPage?.pagination?.total ?? 0;
  const totalPages = withdrawalsPage?.pagination?.pages ?? 1;

  // Keep an open detail dialog's data fresh whenever the list refetches.
  useEffect(() => {
    setSelectedWithdrawal((cur) => {
      if (!cur) return cur;
      return withdrawals.find((w) => w.id === cur.id) ?? cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [withdrawalsPage]);

  const approveWithdrawal = async () => {
    await adminWithdrawalActionGuard.run(async () => {
      if (!selectedWithdrawal) return;
      try {
        setProcessing(true);
        await axios.patch(
          `${BASE_URL}/adminwithdrawals/${selectedWithdrawal.id}/approve`,
          {},
          { withCredentials: true },
        );
        addToast("success", "Withdrawal approved successfully!");
        setSelectedWithdrawal((cur) =>
          cur?.id === selectedWithdrawal.id
            ? {
                ...cur,
                status: "Approved",
                remarks: remarksText || cur.remarks,
                approvedAt: new Date().toISOString(),
              }
            : cur,
        );
        setApproveDialogOpen(false);
        invalidateWithdrawals();
      } catch (error) {
        const serverMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message as string | undefined)
          : undefined;
        const wasRejected = axios.isAxiosError(error)
          ? Boolean(error.response?.data?.rejected)
          : false;

        addToast(
          "error",
          serverMessage || "Failed to approve withdrawal",
        );

        if (wasRejected) {
          setSelectedWithdrawal((cur) =>
            cur?.id === selectedWithdrawal.id
              ? {
                  ...cur,
                  status: "Rejected",
                  remarks: serverMessage || cur.remarks,
                  rejectedAt: new Date().toISOString(),
                }
              : cur,
          );
          setApproveDialogOpen(false);
          invalidateWithdrawals();
        }
      } finally {
        setProcessing(false);
      }
    });
  };

  const rejectWithdrawal = async () => {
    await adminWithdrawalActionGuard.run(async () => {
      if (!selectedWithdrawal) return;
      try {
        setProcessing(true);
        await axios.patch(
          `${BASE_URL}/adminwithdrawals/${selectedWithdrawal.id}/reject`,
          { remarks: rejectReason },
          { withCredentials: true },
        );
        addToast("success", "Withdrawal rejected successfully!");
        setSelectedWithdrawal((cur) =>
          cur?.id === selectedWithdrawal.id
            ? {
                ...cur,
                status: "Rejected",
                remarks: rejectReason || cur.remarks,
                rejectedAt: new Date().toISOString(),
              }
            : cur,
        );
        setRejectDialogOpen(false);
        invalidateWithdrawals();
      } catch (error) {
        const serverMessage = axios.isAxiosError(error)
          ? (error.response?.data?.message as string | undefined)
          : undefined;
        addToast("error", serverMessage || "Failed to reject withdrawal");
      } finally {
        setProcessing(false);
      }
    });
  };

  const filteredWithdrawals = withdrawals
    .filter((w) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        w.user?.firstName?.toLowerCase().includes(s) ||
        w.user?.lastName?.toLowerCase().includes(s) ||
        w.user?.email?.toLowerCase().includes(s) ||
        w.account?.mt5Account?.toLowerCase().includes(s) ||
        w.account?.accountType?.toLowerCase().includes(s)
      );
    })
    // The backend has no plan-type/payment-method filter (see
    // fetchWithdrawalsPage above), so these two only ever filter whatever
    // page is already loaded.
    .filter((w) => (planFilter !== "All" ? w.accountType === planFilter : true))
    .filter((w) =>
      paymentFilter !== "All" ? w.paymentMethod === paymentFilter : true,
    )
    .sort((a, b) => {
      if (sortField === "amount")
        return sortAsc ? a.amount - b.amount : b.amount - a.amount;
      return sortAsc
        ? new Date(a.requestedDate).getTime() -
            new Date(b.requestedDate).getTime()
        : new Date(b.requestedDate).getTime() -
            new Date(a.requestedDate).getTime();
    });

  const resetFilters = () => {
    setStatusFilter("All");
    setPlanFilter("All");
    setPaymentFilter("All");
    setDateRange(undefined);
    setFilterOpen(false);
  };

  const handleSort = (field: "amount" | "plan" | "date") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExport = (type: string) => {
    alert(`Exporting as ${type}...`);
    setExportOpen(false);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearch, dateRange]);

  useRealtimeSync({
    events: ["newNotification", "withdrawal_updated", "cache_invalidate"],
    onEvent: (event, data) => {
      const markRealtimeRefresh = () => {
        setLastRealtimeAt(new Date());
        invalidateWithdrawals();
      };
      if (event === "cache_invalidate") {
        const keys = data?.keys || [];
        if (
          keys.includes("withdrawals") ||
          keys.includes("admin_withdrawals") ||
          keys.includes("admin_dashboard")
        ) {
          markRealtimeRefresh();
        }
        return;
      }
      if (event === "withdrawal_updated") {
        markRealtimeRefresh();
        return;
      }
      if (event === "newNotification" && data?.type === "withdrawal_status") {
        markRealtimeRefresh();
      }
    },
  });

  // Stat counters
  const pendingCount = withdrawals.filter((w) => w.status === "Pending").length;
  const approvedCount = withdrawals.filter(
    (w) => w.status === "Approved",
  ).length;
  const rejectedCount = withdrawals.filter(
    (w) => w.status === "Rejected",
  ).length;
  const totalVolume = withdrawals.reduce((s, w) => s + w.amount, 0);

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
      {/* grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6">
        {/* ══ HERO ══ */}
        <div
          className="relative overflow-hidden rounded-[30px] border border-border"
          style={{
            background:
              "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow:
              "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
                  Withdrawal
                    <span className="block italic text-body">
                    Management
                  </span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-body">
                  Review, approve, and manage all client withdrawal requests
                  from one unified surface.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-strong px-3 py-1.5 text-[11px] font-medium text-body">
                    <Radio className="h-3 w-3" /> Live updates active
                  </span>
                  {lastRealtimeAt && (
                      <span className="text-body text-[11px]">
                      Last sync {format(toConfiguredZonedDate(lastRealtimeAt), "hh:mm:ss a")}
                    </span>
                  )}
                </div>
              </div>

              {/* stat tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
                {[
                  {
                    label: "Total Volume",
                    value: `$${totalVolume.toLocaleString()}`,
                    icon: Wallet,
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
                    icon: CheckCheck,
                    accent: "#8ab88a",
                  },
                  {
                    label: "Rejected",
                    value: rejectedCount,
                    icon: Ban,
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

        {/* ══ STATUS FILTER TABS ══ */}
        <div
          className="rounded-[30px] border border-border p-3 sm:p-4 bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
          style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)",
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
              <input
                type="text"
                placeholder="Search by name, email, or account…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* status tabs */}
            <div className="flex gap-1 p-1 rounded-xl border border-border bg-surface-strong">
              {(["All", "Pending", "Approved", "Rejected"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap"
                    style={
                      statusFilter === s
                        ? {
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                            color: "var(--heading)",
                            boxShadow: "0 2px 8px rgba(74,50,24,0.2)",
                          }
                        : { color: "var(--body)" }
                    }
                  >
                    {s}
                  </button>
                ),
              )}
            </div>

            {/* filter btn */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm tracking-wide transition-all border border-accent"
                style={{
                  background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                  color: "var(--heading)",
                  boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                }}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {filterOpen && (
                <div
                  className="absolute top-14 right-0 z-50 w-72 rounded-2xl border border-border p-4 space-y-4"
                  style={{
                    // var(--surface-strong) is only ~72% opaque in dark mode
                    // (by design, for cards over blurred content); this
                    // panel floats directly over the page with no blur or
                    // backdrop of its own, so it needs the fully-opaque twin.
                    background: "var(--surface-strong-opaque)",
                    boxShadow: "0 8px 32px rgba(74,50,24,0.16)",
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase tracking-widest font-semibold text-body">
                      Filter
                    </span>
                    <button
                      onClick={resetFilters}
                      className="text-xs text-body flex items-center gap-1 hover:text-[#5a2a1a] dark:text-[#da9781]"
                    >
                      <X className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                        Plan Type
                      </label>
                      <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent appearance-none"
                      >
                        {[
                          "All",
                          "BASIC",
                          "ALPHA",
                          "PROEDGE",
                          "INFINITY",
                          "PRIME",
                        ].map((v) => (
                          <option key={v} value={v === "All" ? "All" : v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                        Payment Method
                      </label>
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent appearance-none"
                      >
                        <option value="All">All Methods</option>
                        <option value="E-Wallet">E-Wallet</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                        Date Range
                      </label>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          if (!range?.from) return;
                          setDateRange({ from: range.from, to: range.to });
                        }}
                        className="rounded-xl border border-border bg-surface-strong"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* export */}
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm tracking-wide transition-all border border-[#a0b890]"
                style={{
                  background: "linear-gradient(135deg, #c8ddb8, #9ab880)",
                  color: "#1e3018",
                  boxShadow: "0 2px 8px rgba(80,110,40,0.16)",
                }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                />
              </button>
              {exportOpen && (
                <div
                  className="absolute top-14 right-0 z-50 w-44 mt-1 rounded-xl border border-border p-1.5"
                  style={{
                    background: "var(--surface-strong-opaque)",
                    boxShadow: "0 8px 32px rgba(74,50,24,0.16)",
                  }}
                >
                  {[
                    { label: "Export Excel", color: "var(--status-green)" },
                    { label: "Export PDF", color: "var(--status-red)" },
                  ].map(({ label, color }) => (
                    <button
                      key={label}
                      onClick={() => handleExport(label.split(" ")[1])}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-strong transition-colors"
                      style={{ color }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* meta */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
            <span className="text-sm text-body">
              <span className="font-semibold text-heading">
                {filteredWithdrawals.length}
              </span>{" "}
              withdrawals found
            </span>
            <div className="flex items-center gap-3 text-xs text-accent">
              <button
                onClick={() => handleSort("amount")}
                className="flex items-center gap-1 hover:text-heading transition-colors"
              >
                Amount
                {sortField === "amount" ? (
                  sortAsc ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )
                ) : (
                  <ArrowDown className="w-3 h-3 opacity-30" />
                )}
              </button>
              <button
                onClick={() => handleSort("date")}
                className="flex items-center gap-1 hover:text-heading transition-colors"
              >
                Date
                {sortField === "date" ? (
                  sortAsc ? (
                    <ArrowUp className="w-3 h-3" />
                  ) : (
                    <ArrowDown className="w-3 h-3" />
                  )
                ) : (
                  <ArrowDown className="w-3 h-3 opacity-30" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ══ DESKTOP TABLE ══ */}
        <div
          className="hidden lg:block rounded-2xl border border-border overflow-hidden bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
          style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)", }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-sm tracking-widest uppercase">
                Loading withdrawals…
              </p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-strong border border-border flex items-center justify-center">
                <Filter className="w-7 h-7 text-accent" />
              </div>
              <p className="text-body text-sm">
                No withdrawals found — try adjusting your filters.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl text-sm border border-border bg-surface-strong text-heading hover:bg-surface transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
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
                    "Client",
                    "Account",
                    "Amount",
                    "Plan",
                    "Payment",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body ${i === 7 ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((w, idx) => {
                  const sc = statusConfig[w.status];
                  return (
                    <tr
                      key={w.id}
                      className="border-b border-border hover:bg-surface-strong transition-colors duration-150"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      {/* client */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-heading text-sm font-semibold"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                            }}
                          >
                            {w.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-medium text-heading text-sm">
                              {w.user
                                ? `${w.user.firstName} ${w.user.lastName}`
                                : "User Deleted"}
                            </div>
                            <div className="text-xs text-accent mt-0.5">
                              {w.user?.email || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* account */}
                      <td className="px-5 py-4 font-mono text-sm text-heading">
                        {w.account?.mt5Account || "N/A"}
                      </td>

                      {/* amount */}
                      <td className="px-5 py-4">
                        <span
                          className="text-base font-bold"
                          style={{ color: "var(--status-green)" }}
                        >
                          ${w.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* plan */}
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs border border-border bg-surface-strong text-heading">
                          {w.accountType}
                        </span>
                      </td>

                      {/* payment */}
                      <td className="px-5 py-4 text-sm text-heading">
                        {w.paymentMethod}
                      </td>

                      {/* date */}
                      <td className="px-5 py-4 text-xs text-body">
                        {format(toConfiguredZonedDate(w.requestedDate), "MMM d, yyyy")}
                        <div className="text-[10px] text-accent">
                          {format(toConfiguredZonedDate(w.requestedDate), "hh:mm a")}
                        </div>
                      </td>

                      {/* status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {w.status}
                        </span>
                      </td>

                      {/* actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {w.status === "Pending" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setApproveDialogOpen(true);
                                }}
                                title="Approve"
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#a0c890] transition-all hover:scale-105"
                                style={{
                                  background: "#edf8e8",
                                  color: "#3a6a2a",
                                }}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w);
                                  setRejectDialogOpen(true);
                                }}
                                title="Reject"
                                className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#d4a090] transition-all hover:scale-105"
                                style={{
                                  background: "var(--surface-strong)",
                                  color: "var(--status-red)",
                                }}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setViewDialogOpen(true);
                            }}
                            title="View Details"
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-surface-strong text-body transition-all hover:scale-105"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ══ MOBILE CARDS ══ */}
        <div className="lg:hidden space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-body text-xs tracking-widest uppercase">
                Loading…
              </p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div
              className="rounded-2xl border border-border p-10 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            >
              <p className="text-body text-sm">No withdrawals found</p>
              <button
                onClick={resetFilters}
                className="mt-3 px-4 py-2 rounded-xl text-xs border border-border bg-surface-strong text-heading"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredWithdrawals.map((w, idx) => {
              const sc = statusConfig[w.status];
              return (
                <div
                  key={w.id}
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
                          background:
                            "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                        }}
                      >
                        {w.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-heading text-sm truncate"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {w.user
                            ? `${w.user.firstName} ${w.user.lastName}`
                            : "User Deleted"}
                        </div>
                        <div className="text-xs text-accent truncate">
                          {w.user?.email || "N/A"}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium flex-shrink-0 ${sc.bg} ${sc.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {w.status}
                    </span>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          label: "Amount",
                          value: (
                            <span
                              className="text-sm font-bold"
                              style={{ color: "var(--status-green)" }}
                            >
                              ${w.amount.toLocaleString()}
                            </span>
                          ),
                        },
                        {
                          label: "MT5 Account",
                          value: (
                            <span className="text-xs font-mono text-heading">
                              {w.account?.mt5Account || "N/A"}
                            </span>
                          ),
                        },
                        {
                          label: "Plan",
                          value: (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] border border-border bg-surface-strong text-heading">
                              {w.accountType}
                            </span>
                          ),
                        },
                        {
                          label: "Payment",
                          value: (
                            <span className="text-xs text-heading">
                              {w.paymentMethod}
                            </span>
                          ),
                        },
                        {
                          label: "Date",
                          value: (
                            <span className="text-xs text-heading">
                              {format(
                                toConfiguredZonedDate(w.requestedDate),
                                "MMM d, yyyy · hh:mm a",
                              )}
                            </span>
                          ),
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className={`bg-surface-strong border border-border rounded-xl px-3 py-2 ${label === "Date" ? "col-span-2" : ""}`}
                        >
                          <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                            {label}
                          </div>
                          {value}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {w.status === "Pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setApproveDialogOpen(true);
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium border-[#a0c890] transition-all"
                            style={{ background: "#edf8e8", color: "#3a6a2a" }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(w);
                              setRejectDialogOpen(true);
                            }}
                            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium border-[#d4a090] transition-all"
                            style={{ background: "var(--surface-strong)", color: "var(--status-red)" }}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(w);
                          setViewDialogOpen(true);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[10px] font-medium border-border bg-surface-strong text-body transition-all ${w.status !== "Pending" ? "col-span-3" : ""}`}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {filteredWithdrawals.length > 0 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)", }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body">
                Showing{" "}
                <span className="font-semibold text-heading">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                –
                <span className="font-semibold text-heading">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {totalItems}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  ← Prev
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalPages ||
                        Math.abs(p - currentPage) <= 1,
                    )
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="text-accent text-xs px-1">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className="w-9 h-9 rounded-xl text-sm transition-all"
                          style={
                            currentPage === page
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
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
              <span className="text-sm text-body hidden sm:block">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══ APPROVE DIALOG ══ */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md border-border p-0 overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">Approve Withdrawal</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm approval of this withdrawal request
          </DialogDescription>

          <div
            className="p-1.5 rounded-2xl border border-border"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
            }}
          >
            <div
              className="rounded-xl p-5 mb-4"
              style={{
                background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#8ab88a]" />
                </div>
                <div>
                  <h2
                    className="text-lg font-light text-heading"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Approve Withdrawal
                  </h2>
                  <p className="text-xs text-accent">
                    Confirm this transaction
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-4">
              <div className="rounded-xl border border-border bg-surface-strong p-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-body">
                  Amount
                </span>
                <span
                  className="text-2xl font-light"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--status-green)",
                  }}
                >
                  ${selectedWithdrawal?.amount?.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  Bonus (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter bonus amount"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  className={fieldCls}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  Remarks
                </label>
                <textarea
                  placeholder="Add a comment…"
                  value={remarksText}
                  onChange={(e) => setRemarksText(e.target.value)}
                  rows={3}
                  className={`${fieldCls} resize-none`}
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setApproveDialogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={approveWithdrawal}
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl text-sm text-[#edfaed] transition-all hover:opacity-85 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #3a6a2a, #2a5a1a)",
                  }}
                >
                  {processing ? "Processing…" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ REJECT DIALOG ══ */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md border-border p-0 overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">Reject Withdrawal</DialogTitle>
          <DialogDescription className="sr-only">
            Provide reason for rejection
          </DialogDescription>

          <div
            className="p-1.5 rounded-2xl border border-border"
            style={{
              background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
            }}
          >
            <div
              className="rounded-xl p-5 mb-4"
              style={{
                background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-[#c47a7a]" />
                </div>
                <div>
                  <h2
                    className="text-lg font-light text-heading"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Reject Withdrawal
                  </h2>
                  <p className="text-xs text-accent">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-4">
              <div className="rounded-xl border border-border bg-surface-strong p-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-body">
                  Amount
                </span>
                <span
                  className="text-2xl font-light"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    color: "var(--status-red)",
                  }}
                >
                  ${selectedWithdrawal?.amount?.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-body block mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  placeholder="Please provide a reason…"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className={`${fieldCls} resize-none`}
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setRejectDialogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={rejectWithdrawal}
                  disabled={processing}
                  className="flex-1 py-2.5 rounded-xl text-sm text-heading transition-all hover:opacity-85 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #7a2a2a, #5a1a1a)",
                  }}
                >
                  {processing ? "Processing…" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ VIEW DETAILS DIALOG ══ */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg border-border p-0 overflow-hidden rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="sr-only">Withdrawal Details</DialogTitle>
          <DialogDescription className="sr-only">
            View complete withdrawal information
          </DialogDescription>

          {selectedWithdrawal &&
            (() => {
              const sc = statusConfig[selectedWithdrawal.status];
              return (
                <div
                  className="rounded-2xl border border-border"
                  style={{
                    background:
                      "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
                  }}
                >
                  {/* dialog header */}
                  <div
                    className="sticky top-0 flex items-center justify-between p-5 border-b border-border z-10"
                    style={{
                      background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
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
                        {selectedWithdrawal.user
                          ? `${selectedWithdrawal.user.firstName} ${selectedWithdrawal.user.lastName}`
                          : "User Deleted"}
                      </h3>
                    </div>
                    <button
                      onClick={() => setViewDialogOpen(false)}
                      className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* amount + status row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-border bg-surface-strong p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wallet className="w-3 h-3 text-body" />
                          <span className="text-[10px] uppercase tracking-widest text-accent">
                            Amount
                          </span>
                        </div>
                        <span
                          className="text-2xl font-light"
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            color: "var(--status-green)",
                          }}
                        >
                          ${selectedWithdrawal.amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-strong p-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3 h-3 text-body" />
                          <span className="text-[10px] uppercase tracking-widest text-accent">
                            Status
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${sc.bg} ${sc.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {selectedWithdrawal.status}
                        </span>
                      </div>
                    </div>

                    {/* detail grid */}
                    <div className="rounded-2xl border border-border bg-surface-strong p-4 space-y-0">
                      {[
                        {
                          label: "Email",
                          value: selectedWithdrawal.user?.email || "N/A",
                        },
                        {
                          label: "Account Number",
                          value: selectedWithdrawal.accountNumber,
                          mono: true,
                        },
                        {
                          label: "Plan Type",
                          value: selectedWithdrawal.accountType,
                        },
                        {
                          label: "Payment Method",
                          value: selectedWithdrawal.paymentMethod,
                        },
                        ...(selectedWithdrawal.eWalletDetails?.walletId
                          ? [
                              {
                                label: `Wallet${selectedWithdrawal.eWalletDetails.type ? ` (${selectedWithdrawal.eWalletDetails.type})` : ""}`,
                                value: selectedWithdrawal.eWalletDetails.walletId,
                                mono: true,
                              },
                            ]
                          : []),
                        ...(selectedWithdrawal.bankDetails?.accountNumber
                          ? [
                              {
                                label: selectedWithdrawal.bankDetails.bankName
                                  ? `Bank Account (${selectedWithdrawal.bankDetails.bankName})`
                                  : "Bank Account",
                                value: [
                                  selectedWithdrawal.bankDetails.accountHolderName,
                                  selectedWithdrawal.bankDetails.accountNumber,
                                  selectedWithdrawal.bankDetails.ifscCode &&
                                    `IFSC: ${selectedWithdrawal.bankDetails.ifscCode}`,
                                ]
                                  .filter(Boolean)
                                  .join(" · "),
                                mono: true,
                              },
                            ]
                          : []),
                        {
                          label: "Requested On",
                          value: format(
                            toConfiguredZonedDate(selectedWithdrawal.requestedDate),
                            "MMM d, yyyy · hh:mm a",
                          ),
                        },
                        ...(selectedWithdrawal.approvedAt
                          ? [
                              {
                                label: "Approved On",
                                value: format(
                                  toConfiguredZonedDate(selectedWithdrawal.approvedAt),
                                  "MMM d, yyyy · hh:mm a",
                                ),
                              },
                            ]
                          : []),
                        ...(selectedWithdrawal.rejectedAt
                          ? [
                              {
                                label: "Rejected On",
                                value: format(
                                  toConfiguredZonedDate(selectedWithdrawal.rejectedAt),
                                  "MMM d, yyyy · hh:mm a",
                                ),
                              },
                            ]
                          : []),
                      ].map(({ label, value, mono }) => (
                        <div
                          key={label}
                          className="flex justify-between items-start py-3 border-b border-border last:border-0"
                        >
                          <span className="text-xs text-accent flex-shrink-0">
                            {label}
                          </span>
                          <span
                            className={`text-sm text-heading text-right ml-4 ${mono ? "font-mono" : ""}`}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* remarks */}
                    {selectedWithdrawal.remarks && (
                      <div className="rounded-2xl border border-border bg-surface-strong p-4">
                        <label className="text-xs uppercase tracking-widest text-body block mb-2">
                          Remarks
                        </label>
                        <p className="text-sm text-heading">
                          {selectedWithdrawal.remarks}
                        </p>
                      </div>
                    )}

                    {/* document */}
                    {selectedWithdrawal.doc && (
                      <div className="rounded-2xl border border-border bg-surface-strong p-4">
                        <label className="text-xs uppercase tracking-widest text-body block mb-3">
                          Supporting Document
                        </label>
                        <div className="flex items-center justify-between rounded-xl border border-border bg-surface-strong p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-surface-strong border border-border">
                              <FileText className="w-4 h-4 text-body" />
                            </div>
                            <span className="text-sm text-heading">
                              Document attached
                            </span>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-border bg-surface-strong text-heading hover:bg-surface transition-colors">
                            <Eye className="w-3 h-3" /> View
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WithdrawalPage;
