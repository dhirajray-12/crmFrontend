import { useToastStore } from "@/Store/toast.store";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Send,
  TrendingUp,
  Wallet,
  X,
  Clock,
  CheckCheck,
  Ban,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface User {
  name: string;
  email: string;
}

interface BankDetails {
  [key: string]: string;
}

interface Transaction {
  id: string;
  user: User;
  accountNumber: string;
  amount: number;
  paymentMethod: string;
  type: "Deposit" | "Withdrawal" | "Transfer";
  planType: string;
  requestedOn: string;
  completedOn: string | null;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  remarks?: string;
  bonus?: number;
  bankDetails?: BankDetails;
  fromAccount?: { accountNumber: string; planType: string };
  toAccount?: { accountNumber: string; planType: string };
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ── Type & Status configs ──
const typeConfig = {
  Deposit: {
    icon: Banknote,
    bg: "#fdf5e0",
    border: "var(--border)",
    text: "#8a6a2a",
    dot: "#d4a854",
    label: "Deposit",
  },
  Withdrawal: {
    icon: Wallet,
    bg: "#fbeee8",
    border: "#d4a090",
    text: "#8a3a2a",
    dot: "#c47a7a",
    label: "Withdrawal",
  },
  Transfer: {
    icon: Send,
    bg: "#f0f8f0",
    border: "#c0d8b0",
    text: "#3a6a2a",
    dot: "#8ab88a",
    label: "Transfer",
  },
};

const statusConfig = {
  Approved: {
    bg: "bg-[#5a7a5a]",
    text: "text-[#edfaed]",
    dot: "bg-[#8ab88a]",
    icon: CheckCheck,
  },
  Completed: {
    bg: "bg-[#4a5a7a]",
    text: "text-[#eaedfb]",
    dot: "bg-[#8a9ab8]",
    icon: CheckCheck,
  },
  Pending: {
    bg: "bg-surface-strong",
    text: "text-heading",
    dot: "bg-accent",
    icon: Clock,
  },
  Rejected: {
    bg: "bg-[#7a3a3a]",
    text: "text-heading",
    dot: "bg-[#c47a7a]",
    icon: Ban,
  },
};

interface TransactionSummary {
  total: number;
  volume: number;
  pending: number;
  deposits: number;
  withdrawals: number;
  transfers: number;
}

const emptySummary: TransactionSummary = {
  total: 0,
  volume: 0,
  pending: 0,
  deposits: 0,
  withdrawals: 0,
  transfers: 0,
};

// Debounces fast-changing inputs (search box) before they trigger a
// server round trip.
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

const AdminTransactionsPage = () => {
  const addToast = useToastStore((s) => s.addToast);
  // `transactions` holds only the CURRENT PAGE returned by the server —
  // pagination, filtering, sorting-by-date, and the summary tiles are all
  // driven by the backend now, not derived client-side from one small batch.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>(emptySummary);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 400);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "user">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactions = async (silent = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });
      if (selectedType !== "All") params.set("type", selectedType.toLowerCase());
      if (selectedStatus !== "All") params.set("status", selectedStatus);
      if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
      if (dateRange.start) params.set("startDate", dateRange.start);
      if (dateRange.end) params.set("endDate", dateRange.end);

      const res = await fetch(
        `${API_BASE_URL}/admin/transactions?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-active-role": sessionStorage.getItem("active_role") || "admin",
          },
          credentials: "include",
        },
      );
      if (!res.ok) {
        const msg =
          res.status === 401
            ? "Unauthorized. Please login again."
            : res.status === 403
              ? "Access denied. Admin privileges required."
              : `Failed to fetch: ${res.statusText}`;
        addToast("error", msg);
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.success && data.data) {
        if (!silent) addToast("success", `Loaded ${data.count} transactions`);
        setTransactions(data.data);
        setTotalCount(data.total ?? data.data.length);
        setTotalPages(Math.max(1, data.pages ?? 1));
        setSummary(data.summary ?? emptySummary);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever the page or any server-side filter changes.
  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedType,
    selectedStatus,
    debouncedSearchTerm,
    dateRange.start,
    dateRange.end,
  ]);

  // Auto-refresh the current page/filter every 30s. Silent — a recurring
  // background refresh shouldn't toast "Loaded N transactions" every 30s.
  useEffect(() => {
    const iv = setInterval(() => fetchTransactions(true), 30000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedType,
    selectedStatus,
    debouncedSearchTerm,
    dateRange.start,
    dateRange.end,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedType, selectedStatus, dateRange]);

  // The API only supports sorting by date server-side; amount/user sort is
  // applied to the current page only (labelled as such isn't needed since
  // date remains the default and most-used sort).
  const paginated = [...transactions].sort((a, b) => {
    let cA: any, cB: any;
    if (sortBy === "date") {
      cA = new Date(a.requestedOn);
      cB = new Date(b.requestedOn);
    } else if (sortBy === "amount") {
      cA = a.amount;
      cB = b.amount;
    } else {
      cA = a.user.name.toLowerCase();
      cB = b.user.name.toLowerCase();
    }
    return sortOrder === "asc" ? (cA > cB ? 1 : -1) : cA < cB ? 1 : -1;
  });
  const startIndex = (currentPage - 1) * itemsPerPage;

  // NOTE: exports only the currently loaded page (server-paginated), not the
  // entire filtered dataset — a proper "export all matching" would need a
  // dedicated backend export endpoint (like the deposits page has).
  const exportToCSV = () => {
    const headers = [
      "ID",
      "Date",
      "User",
      "Email",
      "Type",
      "Amount",
      "Status",
      "Account",
      "Payment Method",
      "Plan",
    ];
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.requestedOn).toLocaleDateString(undefined, {
        timeZone: getConfiguredTimezone(),
      }),
      t.user.name,
      t.user.email,
      t.type,
      t.amount,
      t.status,
      t.accountNumber,
      t.paymentMethod,
      t.planType,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${c}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Exported current page — use filters to narrow down a large export.");
  };

  const SortBtn = ({
    field,
    label,
  }: {
    field: "date" | "amount" | "user";
    label: string;
  }) => (
    <button
      onClick={() => {
        if (sortBy === field)
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        else {
          setSortBy(field);
          setSortOrder("desc");
        }
      }}
      className="flex items-center gap-1 text-xs hover:text-heading transition-colors"
      style={{ color: sortBy === field ? "#4a3218" : "#9a7a50" }}
    >
      {label}
      {sortBy === field ? (
        sortOrder === "asc" ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )
      ) : (
        <ArrowUpDown className="w-3 h-3 opacity-40" />
      )}
    </button>
  );

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
                  Transaction
                  <span className="block italic text-body">Ledger</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-body">
                  Monitor, audit, and export all platform financial movements in
                  one place.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-2 h-2 rounded-full bg-[#8ab88a] animate-pulse" />
                  <span className="text-body text-xs">
                    Auto-refreshes every 30s
                  </span>
                </div>
              </div>

              {/* stat tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 w-full lg:w-auto">
                {[
                  {
                    label: "Total",
                    value: summary.total.toLocaleString(),
                    icon: Layers,
                    accent: "#c4a055",
                  },
                  {
                    label: "Volume",
                    value: `$${summary.volume.toLocaleString()}`,
                    icon: TrendingUp,
                    accent: "#8ab88a",
                  },
                  {
                    label: "Pending",
                    value: summary.pending.toLocaleString(),
                    icon: Clock,
                    accent: "#d4a854",
                  },
                  {
                    label: "Deposits",
                    value: summary.deposits.toLocaleString(),
                    icon: Banknote,
                    accent: "#d4a854",
                  },
                  {
                    label: "Withdrawals",
                    value: summary.withdrawals.toLocaleString(),
                    icon: Wallet,
                    accent: "#c47a7a",
                  },
                  {
                    label: "Transfers",
                    value: summary.transfers.toLocaleString(),
                    icon: Send,
                    accent: "#8a9ab8",
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
                      className="text-xl font-semibold text-heading"
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

        {/* ══ ERROR BANNER ══ */}
        {error && !loading && (
          <div className="rounded-2xl border border-[#d4a090] bg-surface-strong p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8a3a2a] dark:text-[#d99082] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#5a1a1a] dark:text-[#da8181]">
                Error Loading Transactions
              </p>
              <p className="text-xs text-[#8a3a2a] dark:text-[#d99082] mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchTransactions()}
              className="px-3 py-1.5 rounded-xl text-xs border border-[#d4a090] bg-surface-strong text-[#8a3a2a] dark:text-[#d99082] hover:bg-surface-strong transition-colors"
            >
              Retry
            </button>
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
            {/* row 1 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="Search by user, email, account, or ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex gap-2">
                {/* filter toggle */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm border border-accent transition-all"
                  style={{
                    background: "linear-gradient(135deg, var(--surface), var(--accent-color))",
                    color: "var(--heading)",
                    boxShadow: "0 2px 8px rgba(139,100,40,0.18)",
                  }}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                {/* refresh */}
                <button
                  onClick={() => fetchTransactions()}
                  disabled={loading}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm border border-border bg-surface-strong text-heading hover:bg-surface disabled:opacity-50 transition-all"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                {/* export */}
                <button
                  onClick={exportToCSV}
                  disabled={transactions.length === 0}
                  className="flex items-center gap-2 h-11 px-4 rounded-xl text-sm border border-[#a0b890] transition-all disabled:opacity-40"
                  style={{
                    background: "linear-gradient(135deg, #c8ddb8, #9ab880)",
                    color: "#1e3018",
                    boxShadow: "0 2px 8px rgba(80,110,40,0.16)",
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            {/* type + status tabs */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-1 p-1 rounded-xl border border-border bg-surface-strong">
                {["All", "Deposit", "Withdrawal", "Transfer"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className="px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all"
                    style={
                      selectedType === t
                        ? {
                            background:
                              "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                            color: "var(--heading)",
                            boxShadow: "0 2px 8px rgba(74,50,24,0.2)",
                          }
                        : { color: "var(--body)" }
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 p-1 rounded-xl border border-border bg-surface-strong">
                {["All", "Pending", "Approved", "Completed", "Rejected"].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className="px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-all"
                      style={
                        selectedStatus === s
                          ? {
                              background:
                                "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))",
                              color: "var(--heading)",
                            }
                          : { color: "var(--body)" }
                      }
                    >
                      {s}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* expandable date filter */}
            {filterOpen && (
              <div className="rounded-2xl border border-border bg-surface-strong p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest font-semibold text-body">
                    Date Range
                  </span>
                  <button
                    onClick={() => {
                      setDateRange({ start: "", end: "" });
                      setFilterOpen(false);
                    }}
                    className="text-xs text-body flex items-center gap-1 hover:text-[#5a2a1a] dark:text-[#da9781]"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Start Date", key: "start" as const },
                    { label: "End Date", key: "end" as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
                        {label}
                      </label>
                      <input
                        type="date"
                        value={dateRange[key]}
                        onChange={(e) =>
                          setDateRange({ ...dateRange, [key]: e.target.value })
                        }
                        className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* meta row */}
            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm text-body">
                <span className="font-semibold text-heading">
                  {totalCount.toLocaleString()}
                </span>{" "}
                transactions
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-accent">Sort:</span>
                <SortBtn field="date" label="Date" />
                <SortBtn field="amount" label="Amount" />
                <SortBtn field="user" label="User" />
              </div>
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
                Loading transactions…
              </p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-strong border border-border flex items-center justify-center">
                <Filter className="w-7 h-7 text-accent" />
              </div>
              <p className="text-body text-sm">
                No transactions found — try adjusting your filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("All");
                  setSelectedStatus("All");
                  setDateRange({ start: "", end: "" });
                }}
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
                    "Type",
                    "Plan",
                    "Account",
                    "Amount",
                    "Bonus",
                    "Status",
                    "Date",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body ${i === 8 ? "text-center w-16" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, idx) => {
                  const tc = typeConfig[t.type] || typeConfig.Deposit;
                  const sc = statusConfig[t.status] || statusConfig.Pending;
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border hover:bg-surface-strong transition-colors duration-150 cursor-pointer"
                      style={{ animationDelay: `${idx * 30}ms` }}
                      onClick={() => setSelectedTransaction(t)}
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
                            {t.user.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <div className="font-medium text-heading text-sm">
                              {t.user.name}
                            </div>
                            <div className="text-xs text-accent mt-0.5">
                              {t.user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* type */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                          style={{
                            background: tc.bg,
                            borderColor: tc.border,
                            color: tc.text,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: tc.dot }}
                          />
                          {t.type}
                        </span>
                      </td>

                      {/* plan */}
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs border border-border bg-surface-strong text-heading">
                          {t.planType}
                        </span>
                      </td>

                      {/* account */}
                      <td className="px-5 py-4 font-mono text-xs text-heading">
                        {t.accountNumber}
                      </td>

                      {/* amount */}
                      <td className="px-5 py-4">
                        <span
                          className="text-base font-bold"
                          style={{ color: "var(--status-green)" }}
                        >
                          ${t.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* bonus */}
                      <td className="px-5 py-4">
                        {t.bonus && t.bonus > 0 ? (
                          <span className="text-xs font-medium text-[#3a6a2a] dark:text-[#9cd18a]">
                            +${t.bonus}
                          </span>
                        ) : (
                          <span className="text-xs text-accent">—</span>
                        )}
                      </td>

                      {/* status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {t.status}
                        </span>
                      </td>

                      {/* date */}
                      <td className="px-5 py-4 text-xs text-body">
                        {new Date(t.requestedOn).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          timeZone: getConfiguredTimezone(),
                        })}
                        <div className="text-[10px] text-accent">
                          {new Date(t.requestedOn).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            timeZone: getConfiguredTimezone(),
                          })}
                        </div>
                      </td>

                      {/* action */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(t);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto border border-border bg-surface-strong text-body hover:bg-surface hover:scale-105 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
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
          ) : transactions.length === 0 ? (
            <div
              className="rounded-2xl border border-border p-10 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            >
              <p className="text-body text-sm">No transactions found</p>
            </div>
          ) : (
            paginated.map((t) => {
              const tc = typeConfig[t.type] || typeConfig.Deposit;
              const sc = statusConfig[t.status] || statusConfig.Pending;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTransaction(t)}
                  className="rounded-2xl border border-border overflow-hidden cursor-pointer active:scale-[0.99] transition-transform bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                  style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.09)", }}
                >
                  {/* top stripe */}
                  <div
                    className="h-1"
                    style={{
                      background: `linear-gradient(90deg, ${tc.dot}90, ${tc.dot}20)`,
                    }}
                  />

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
                        {t.user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-heading text-sm truncate"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {t.user.name}
                        </div>
                        <div className="text-xs text-accent truncate">
                          {t.user.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className="text-base font-bold"
                        style={{ color: "var(--status-green)" }}
                      >
                        ${t.amount.toLocaleString()}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.bg} ${sc.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Type",
                        value: (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border"
                            style={{
                              background: tc.bg,
                              borderColor: tc.border,
                              color: tc.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: tc.dot }}
                            />
                            {t.type}
                          </span>
                        ),
                      },
                      {
                        label: "Plan",
                        value: (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] border border-border bg-surface-strong text-heading">
                            {t.planType}
                          </span>
                        ),
                      },
                      {
                        label: "Account",
                        value: (
                          <span className="text-xs font-mono text-heading">
                            {t.accountNumber}
                          </span>
                        ),
                      },
                      {
                        label: "Payment",
                        value: (
                          <span className="text-xs text-heading">
                            {t.paymentMethod}
                          </span>
                        ),
                      },
                      {
                        label: "Date",
                        value: (
                          <span className="text-xs text-heading">
                            {new Date(t.requestedOn).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                timeZone: getConfiguredTimezone(),
                              },
                            )}
                          </span>
                        ),
                      },
                      ...(t.bonus && t.bonus > 0
                        ? [
                            {
                              label: "Bonus",
                              value: (
                                <span className="text-xs font-medium text-[#3a6a2a] dark:text-[#9cd18a]">
                                  +${t.bonus}
                                </span>
                              ),
                            },
                          ]
                        : []),
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="bg-surface-strong border border-border rounded-xl px-3 py-2"
                      >
                        <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                          {label}
                        </div>
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {totalCount > 0 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)", }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body">
                Showing{" "}
                <span className="font-semibold text-heading">
                  {startIndex + 1}
                </span>
                –
                <span className="font-semibold text-heading">
                  {Math.min(startIndex + itemsPerPage, totalCount)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-heading">
                  {totalCount.toLocaleString()}
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
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
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-body hidden sm:block">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ══ DETAIL MODAL ══ */}
      {selectedTransaction &&
        (() => {
          const t = selectedTransaction;
          const tc = typeConfig[t.type] || typeConfig.Deposit;
          const sc = statusConfig[t.status] || statusConfig.Pending;
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{
                background: "rgba(44,31,14,0.65)",
                backdropFilter: "blur(6px)",
              }}
              onClick={() => setSelectedTransaction(null)}
            >
              <div
                className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border"
                style={{
                  background: "linear-gradient(160deg,var(--surface-strong) 0%,var(--surface-strong) 100%)",
                  boxShadow: "0 20px 60px rgba(44,31,14,0.35)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* modal header */}
                <div
                  className="sticky top-0 flex items-center justify-between p-5 sm:p-6 border-b border-border z-10"
                  style={{
                    background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))",
                  }}
                >
                  <div>
                    <p
                      className="text-accent text-[10px] tracking-[0.3em] uppercase"
                      style={{ fontFamily: "'Cinzel',serif" }}
                    >
                      Transaction Record
                    </p>
                    <h3
                      className="text-xl font-light text-heading mt-0.5"
                      style={{ fontFamily: "'Cormorant Garamond',serif" }}
                    >
                      {t.user.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-heading hover:bg-surface transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  {/* amount + status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                        Amount
                      </div>
                      <span
                        className="text-2xl font-light"
                        style={{
                          fontFamily: "'Cormorant Garamond',serif",
                          color: "var(--status-green)",
                        }}
                      >
                        ${t.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-2">
                        Status
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                        />
                        {t.status}
                      </span>
                    </div>
                  </div>

                  {/* type + ID */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-2">
                        Type
                      </div>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
                        style={{
                          background: tc.bg,
                          borderColor: tc.border,
                          color: tc.text,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: tc.dot }}
                        />
                        {t.type}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-1">
                        Payment
                      </div>
                      <span className="text-sm text-heading">
                        {t.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* detail ledger */}
                  <div className="rounded-2xl border border-border bg-surface-strong p-4 space-y-0">
                    {[
                      { label: "Transaction ID", value: t.id, mono: true },
                      { label: "Email", value: t.user.email },
                      {
                        label: "Account Number",
                        value: t.accountNumber,
                        mono: true,
                      },
                      { label: "Plan Type", value: t.planType },
                      {
                        label: "Requested On",
                        value: new Date(t.requestedOn).toLocaleString(),
                      },
                      ...(t.completedOn
                        ? [
                            {
                              label: "Completed On",
                              value: new Date(t.completedOn).toLocaleString(),
                            },
                          ]
                        : []),
                      ...(t.bonus && t.bonus > 0
                        ? [
                            {
                              label: "Bonus",
                              value: `+$${t.bonus}`,
                              green: true,
                            },
                          ]
                        : []),
                    ].map(({ label, value, mono, green }: any) => (
                      <div
                        key={label}
                        className="flex justify-between items-start py-3 border-b border-border last:border-0"
                      >
                        <span className="text-xs text-accent flex-shrink-0">
                          {label}
                        </span>
                        <span
                          className={`text-sm text-right ml-4 break-all ${mono ? "font-mono" : ""} ${green ? "text-[#3a6a2a] dark:text-[#9cd18a] font-semibold" : "text-heading"}`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* remarks */}
                  {t.remarks && (
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-body mb-2">
                        Remarks
                      </div>
                      <p className="text-sm text-heading">{t.remarks}</p>
                    </div>
                  )}

                  {/* bank details */}
                  {t.bankDetails && Object.keys(t.bankDetails).length > 0 && (
                    <div className="rounded-2xl border border-border bg-surface-strong p-4">
                      <div className="text-[10px] uppercase tracking-widest text-body mb-3">
                        Bank Details
                      </div>
                      <div className="space-y-0">
                        {Object.entries(t.bankDetails).map(([key, val]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b border-border last:border-0"
                          >
                            <span className="text-xs text-accent capitalize">
                              {key}
                            </span>
                            <span className="text-xs text-heading font-mono text-right ml-3">
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="w-full py-2.5 rounded-xl text-sm border border-border text-heading hover:bg-surface transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default AdminTransactionsPage;
