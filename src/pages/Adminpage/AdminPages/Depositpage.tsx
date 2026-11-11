import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToastStore } from "@/Store/toast.store";
import { useActionGuard } from "@/hooks/useActionGuard";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { normalizeAssetUrl } from "@/utils/assetUrl";
import axios from "axios";
import { format } from "date-fns";
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
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface DepositUser {
  name: string;
  email: string;
}

export interface DepositPaymentDetails {
  type?: string;
  walletName?: string;
  walletAddress?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscSwift?: string;
}

export interface DepositItem {
  id: string;
  user: DepositUser;
  accountNumber: string;
  amount: number;
  planType: string;
  paymentMethod: string;
  bonus: number;
  requestedOn: string;
  approvedOn?: string;
  rejectedOn?: string;
  status: "Pending" | "Approved" | "Rejected";
  remarks?: string;
  proofOfPayment?: string;
  transactionId?: string;
  // The platform's own receiving wallet/bank the client was told to pay
  // into for this deposit - not the client's own account.
  paymentDetails?: DepositPaymentDetails;
}

export interface DepositApiResponse {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  data: DepositItem[];
}

interface DateRange {
  from: Date;
  to?: Date;
}

const buildDocumentUrl = (rawPath?: string): string | undefined => {
  return normalizeAssetUrl(rawPath, { uploadsOnly: true });
};

const isPdfDocument = (url?: string): boolean =>
  !!url && url.toLowerCase().split("?")[0].endsWith(".pdf");

const statusColors = {
  Approved: {
    bg: "bg-surface-strong",
    text: "text-heading",
    dot: "bg-[#8ab88a]",
  },
  Pending: {
    bg: "bg-surface-strong",
    text: "text-heading",
    dot: "bg-accent",
  },
  Rejected: {
    bg: "bg-[#7a3a3a]",
    text: "text-heading",
    dot: "bg-[#c47a7a]",
  },
};

// The backend's /admindeposits endpoint already supports search/status/
// planType/paymentMethod/date-range/sort as query params (see
// controllers/admin/depositController.js) — send the filter state through
// instead of paginating first and filtering only the current 10-item page
// client-side (which used to make search/filter silently miss any match
// not on the currently-loaded page).
const SORT_FIELD_MAP: Record<"amount" | "plan" | "date", string | null> = {
  amount: "amount",
  date: "requestedOn",
  // The backend has no plan-type sort — callers fall back to a client-side
  // sort of just the returned page for this one field.
  plan: null,
};

interface DepositsQueryParams {
  page: number;
  limit: number;
  search: string;
  status: "All" | "Approved" | "Pending" | "Rejected";
  planType: string;
  paymentMethod: string;
  startDate?: string;
  endDate?: string;
  sortField: "amount" | "plan" | "date";
  sortAsc: boolean;
}

const fetchDepositsPage = async (
  params: DepositsQueryParams,
): Promise<DepositApiResponse> => {
  const query: Record<string, string> = {
    page: String(params.page),
    limit: String(params.limit),
  };
  if (params.search.trim()) query.search = params.search.trim();
  if (params.status !== "All") query.status = params.status;
  if (params.planType !== "All") query.planType = params.planType;
  if (params.paymentMethod !== "All") query.paymentMethod = params.paymentMethod;
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;

  const backendSortField = SORT_FIELD_MAP[params.sortField];
  if (backendSortField) {
    query.sortField = backendSortField;
    query.sortOrder = params.sortAsc ? "asc" : "desc";
  }

  const res = await axios.get<DepositApiResponse>(`${BASE_URL}/admindeposits`, {
    params: query,
    headers: {
      "Content-Type": "application/json",
      "x-active-role": sessionStorage.getItem("active_role") || "admin",
    },
    withCredentials: true,
  });
  if (!res.data.success) throw new Error("Failed to fetch deposits");
  return res.data;
};

const buildPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
};

const DepositPage: React.FC = () => {
  const [showDocModal, setShowDocModal] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [docType, setDocType] = useState<"pdf" | "image" | null>(null);

  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);
  const [statusFilter, setStatusFilter] = useState<"All" | "Approved" | "Pending" | "Rejected">("All");
  const [planFilter, setPlanFilter] = useState<string>("All");
  const [paymentFilter, setPaymentFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState<"amount" | "plan" | "date">("date");
  const addToast = useToastStore((state) => state.addToast);

  const [actionLoading, setActionLoading] = useState(false);
  const adminDepositActionGuard = useActionGuard({
    isBusy: actionLoading,
    warningMessage: "A deposit decision is already being processed. Please wait before clicking again.",
  });

  const [sortAsc, setSortAsc] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositItem | null>(null);

  const [bonusAmount, setBonusAmount] = useState("");
  const [remarksText, setRemarksText] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const queryParams: DepositsQueryParams = {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch,
    status: statusFilter,
    planType: planFilter,
    paymentMethod: paymentFilter,
    startDate: dateRange?.from?.toISOString(),
    endDate: dateRange?.to?.toISOString(),
    sortField,
    sortAsc,
  };

  const {
    data: depositsPage,
    isLoading: loading,
    error: depositsError,
  } = useQuery({
    queryKey: ["adminDeposits", queryParams],
    queryFn: () => fetchDepositsPage(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!depositsError) return;
    addToast(
      "error",
      depositsError instanceof Error ? depositsError.message : "Failed to fetch deposits",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depositsError]);

  const invalidateDeposits = () =>
    queryClient.invalidateQueries({ queryKey: ["adminDeposits"] });

  const deposits = depositsPage?.data ?? [];
  const totalItems = depositsPage?.total ?? 0;
  const totalPages = depositsPage?.pages ?? 1;

  // The backend has no plan-type sort — fall back to sorting just the
  // returned page client-side for that one option (see SORT_FIELD_MAP).
  const filteredDeposits =
    sortField === "plan"
      ? [...deposits].sort((a, b) =>
          sortAsc
            ? a.planType.localeCompare(b.planType)
            : b.planType.localeCompare(a.planType),
        )
      : deposits;

  const paginationItems = buildPaginationItems(currentPage, totalPages);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, planFilter, paymentFilter, dateRange, debouncedSearch]);

  const resetFilters = () => {
    setStatusFilter("All");
    setPlanFilter("All");
    setPaymentFilter("All");
    setDateRange(undefined);
    setFilterOpen(false);
    addToast("success", "Filters reset successfully");
  };

  useRealtimeSync({
    events: ["newNotification", "deposit_updated"],
    onEvent: (event, data) => {
      if (event === "cache_invalidate") {
        const keys = data?.keys || [];
        if (keys.includes("admin_deposits") || keys.includes("admin_dashboard")) invalidateDeposits();
        return;
      }
      if (event === "deposit_updated") { invalidateDeposits(); return; }
      if (event === "newNotification" && data?.type === "deposit_status") invalidateDeposits();
    },
  });

  const approveDepositHandler = async () => {
    await adminDepositActionGuard.run(async () => {
      if (!selectedDeposit) return;
      try {
        setActionLoading(true);
        addToast("info", "Processing approval…");
        await axios.post(`${BASE_URL}/admindeposits/${selectedDeposit.id}/approve`, { bonus: Number(bonusAmount), remarks: remarksText }, { withCredentials: true });
        addToast("success", "Deposit approved successfully!");
        setSelectedDeposit((current) => current && current.id === selectedDeposit.id ? { ...current, status: "Approved", remarks: remarksText || current.remarks, approvedOn: new Date().toISOString() } : current);
        setApproveDialogOpen(false);
        setBonusAmount("");
        setRemarksText("");
        invalidateDeposits();
      } catch (error) {
        addToast("error", error instanceof Error ? error.message : "Failed to approve deposit");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const rejectDepositHandler = async () => {
    await adminDepositActionGuard.run(async () => {
      if (!selectedDeposit) return;
      if (!rejectReason.trim()) { addToast("error", "Please provide a reason for rejection"); return; }
      try {
        setActionLoading(true);
        addToast("info", "Processing rejection…");
        await axios.post(`${BASE_URL}/admindeposits/${selectedDeposit.id}/reject`, { remarks: rejectReason }, { withCredentials: true });
        addToast("success", "Deposit rejected successfully!");
        setSelectedDeposit((current) => current && current.id === selectedDeposit.id ? { ...current, status: "Rejected", remarks: rejectReason || current.remarks, rejectedOn: new Date().toISOString() } : current);
        setRejectDialogOpen(false);
        setRejectReason("");
        invalidateDeposits();
      } catch (error) {
        addToast("error", error instanceof Error ? error.message : "Failed to reject deposit");
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleViewDocument = async (depositId: string) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admindeposits/${depositId}/document`, { withCredentials: true, responseType: "blob" });
      const contentType = res.headers["content-type"];
      const blob = new Blob([res.data as BlobPart], { type: contentType });
      const url = URL.createObjectURL(blob);
      setDocUrl(url);
      setDocType(contentType.includes("pdf") ? "pdf" : "image");
      setShowDocModal(true);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Failed to fetch deposit document");
    }
  };

  const viewDocument = (id: string) => { window.open(`${BASE_URL}/admindeposits/${id}/document`, "_blank"); };

  const handleSort = (field: "amount" | "plan" | "date") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(false); }
  };

  const handleExport = (type: "xlsx" | "pdf") => {
    window.open(`${BASE_URL}/admindeposits/export?format=${type}`, "_blank");
    setExportOpen(false);
    addToast("success", `Exporting deposits as ${type.toUpperCase()}...`);
  };

  const selectedDepositDocumentUrl = buildDocumentUrl(selectedDeposit?.proofOfPayment);
  const selectedDepositDocumentIsPdf = isPdfDocument(selectedDepositDocumentUrl);

  const SortIcon = ({ field }: { field: "amount" | "plan" | "date" }) => (
    <span className="inline-flex flex-col ml-1">
      <ArrowUp className={`w-2.5 h-2.5 ${sortField === field && !sortAsc ? "text-body" : "text-accent"}`} />
      <ArrowDown className={`w-2.5 h-2.5 -mt-0.5 ${sortField === field && sortAsc ? "text-body" : "text-accent"}`} />
    </span>
  );

  return (
    <div
      className="admin-page min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 font-['Cormorant_Garamond',_'Georgia',_serif]"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(239, 227, 202, 0.55), transparent 28%),
          radial-gradient(circle at top right, rgba(222, 204, 168, 0.32), transparent 24%),
          linear-gradient(180deg, var(--surface-strong) 0%, var(--surface-strong) 46%, var(--surface) 100%)
        `,
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025] z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-[30px] border border-border p-6 sm:p-8 lg:p-10"
          style={{
            background: "radial-gradient(circle at top right, var(--hero-glow-1), transparent 28%), radial-gradient(circle at top left, var(--hero-glow-2), transparent 34%), linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 48%, var(--surface) 100%)",
            boxShadow: "0 18px 34px rgba(116,93,56,0.08), 0 30px 70px rgba(116,93,56,0.12)",
          }}
        >
          {/* decorative rings */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-accent opacity-10" />
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full border border-accent opacity-15" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full border border-accent opacity-8" />

          <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <p className="text-body text-xs tracking-[0.3em] uppercase mb-2 font-['Cinzel',_serif]">
                Administration
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-heading tracking-tight leading-tight">
                Deposit
                <span className="block text-body italic">Management</span>
              </h1>
              <p className="mt-3 text-sm leading-6 text-body font-['Lato',_sans-serif]">
                Review and process all deposit requests
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-strong px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-body text-xs tracking-wider font-['Lato',_sans-serif]">Latest first</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div
          className="rounded-[30px] p-4 sm:p-5 border border-border bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(247,239,223,0.96))] dark:bg-surface-strong dark:bg-none"
          style={{
            boxShadow: "0 18px 34px rgba(116,93,56,0.08)" }}
        >
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <Input
                placeholder="Search by name, email, or account…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-surface-strong border-border focus:border-accent text-heading placeholder:text-accent rounded-xl font-['Lato',_sans-serif] text-sm"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              {/* Filter */}
              <div className="relative flex-1 sm:flex-none">
                <Button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="h-10 px-4 sm:px-5 text-sm rounded-xl w-full sm:w-auto border border-accent font-['Lato',_sans-serif] tracking-wide"
                  style={{ background: "linear-gradient(135deg, var(--surface) 0%, var(--accent-color) 100%)", color: "var(--heading)", boxShadow: "0 2px 8px rgba(139,100,40,0.2)" }}
                >
                  <Filter className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${filterOpen ? "rotate-180" : ""}`} />
                </Button>

                {filterOpen && (
                  <>
                    {/* Mobile-only backdrop - without a bottom/top anchor the
                        panel below used to fall back to its static-flow
                        position (wherever the button happened to sit on the
                        page), landing low on screen with no way to tell it
                        apart from the content behind it. */}
                    <div
                      className="fixed inset-0 z-40 bg-black/50 sm:hidden"
                      onClick={() => setFilterOpen(false)}
                    />
                    <div
                      className="fixed sm:absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-auto top-auto sm:top-12 left-0 sm:left-auto right-0 sm:right-auto z-50 w-auto sm:w-80 rounded-2xl border border-border p-5 space-y-4 max-h-[80vh] overflow-y-auto"
                      style={{
                        // var(--surface-strong) is only ~72% opaque in dark
                        // mode (by design, for cards over blurred content) -
                        // this panel floats directly over the page with no
                        // blur of its own, so that 72% read as visibly
                        // see-through. --surface-strong-opaque is the same
                        // color at full alpha.
                        background: "var(--surface-strong-opaque)",
                        boxShadow: "0 8px 40px rgba(74,50,24,0.18)",
                      }}
                    >
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-semibold text-heading font-['Cinzel',_serif] tracking-wide">Filter By</h3>
                      <button onClick={() => setFilterOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-surface transition-colors">
                        <X className="w-4 h-4 text-body" />
                      </button>
                    </div>

                    {[
                      { label: "Status", value: statusFilter, onChange: (v: string) => setStatusFilter(v as any), options: [{ v: "All", l: "All Status" }, { v: "Approved", l: "Approved" }, { v: "Pending", l: "Pending" }, { v: "Rejected", l: "Rejected" }] },
                      { label: "Plan Type", value: planFilter, onChange: setPlanFilter, options: [{ v: "All", l: "All Plans" }, { v: "BASIC", l: "BASIC" }, { v: "GOLD", l: "GOLD" }, { v: "PROEDGE", l: "PROEDGE" }, { v: "ALPHA", l: "ALPHA" }, { v: "PRIME", l: "PRIME" }] },
                      { label: "Payment Method", value: paymentFilter, onChange: setPaymentFilter, options: [{ v: "All", l: "All Methods" }, { v: "E-Wallet", l: "E-Wallet" }, { v: "Bank Transfer", l: "Bank Transfer" }] },
                    ].map(({ label, value, onChange, options }) => (
                      <div key={label}>
                        <label className="text-xs font-semibold uppercase tracking-widest text-body mb-2 block font-['Lato',_sans-serif]">{label}</label>
                        <Select onValueChange={onChange} value={value}>
                          <SelectTrigger className="w-full bg-surface-strong border-border text-heading rounded-xl h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-surface-strong border-border rounded-xl">
                            {options.map(({ v, l }) => <SelectItem key={v} value={v} className="text-heading text-sm">{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-widest text-body mb-2 block font-['Lato',_sans-serif]">Date Range</label>
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => { if (!range?.from) return; setDateRange({ from: range.from, to: range.to }); }}
                        className="rounded-xl border border-border bg-surface-strong"
                      />
                    </div>

                    <button onClick={resetFilters} className="w-full py-2 text-sm text-body border border-border rounded-xl hover:bg-surface-strong transition-colors font-['Lato',_sans-serif] tracking-wide">
                      Reset All Filters
                    </button>
                    </div>
                  </>
                )}
              </div>

              {/* Export */}
              <div className="relative flex-1 sm:flex-none">
                <Button
                  onClick={() => setExportOpen(!exportOpen)}
                  className="h-10 px-4 sm:px-5 text-sm rounded-xl w-full sm:w-auto border border-[#a0b890] font-['Lato',_sans-serif] tracking-wide"
                  style={{ background: "linear-gradient(135deg, #c8ddb8 0%, #9ab880 100%)", color: "#1e3018", boxShadow: "0 2px 8px rgba(80,110,40,0.18)" }}
                >
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className={`w-3.5 h-3.5 ml-1.5 transition-transform duration-200 ${exportOpen ? "rotate-180" : ""}`} />
                </Button>

                {exportOpen && (
                  <div className="absolute top-12 right-0 z-50 w-44 rounded-2xl border border-border p-2 overflow-hidden"
                    style={{ background: "var(--surface-strong-opaque)", boxShadow: "0 8px 30px rgba(74,50,24,0.15)" }}
                  >
                    {[{ label: "Excel (.xlsx)", type: "xlsx" as const, color: "var(--status-green)" }, { label: "PDF (.pdf)", type: "pdf" as const, color: "var(--status-red)" }].map(({ label, type, color }) => (
                      <button key={type} onClick={() => handleExport(type)}
                        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-surface-strong transition-colors font-['Lato',_sans-serif]"
                        style={{ color }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 mt-4 pt-4 border-t border-border">
            <span className="text-sm text-body font-['Lato',_sans-serif]">
              <span className="text-heading font-semibold">{filteredDeposits.length}</span> deposits found
            </span>
            <span className="text-xs text-accent font-['Lato',_sans-serif] tracking-wide">
              Sorted by {sortField === "date" ? "Date" : sortField === "amount" ? "Amount" : "Plan"} · {sortAsc ? "Ascending" : "Descending"}
            </span>
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block rounded-[30px] border border-border overflow-hidden bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
          style={{ boxShadow: "0 18px 34px rgba(116,93,56,0.08)" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-4">
                <div className="w-14 h-14 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-body text-sm font-['Lato',_sans-serif] tracking-widest uppercase">Loading…</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="w-full">
              {filteredDeposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center mb-5">
                    <Filter className="w-9 h-9 text-accent" />
                  </div>
                  <h3 className="text-xl font-light text-heading mb-2 font-['Cormorant_Garamond',_serif]">No Deposits Found</h3>
                  <p className="text-body text-sm text-center mb-6 font-['Lato',_sans-serif]">No deposits match your current filters.</p>
                  <button onClick={resetFilters}
                    className="px-6 py-2 rounded-xl text-sm font-['Lato',_sans-serif] tracking-wide transition-all hover:opacity-80"
                    style={{ background: "linear-gradient(135deg, var(--surface-strong) 0%, var(--surface-strong) 100%)", color: "var(--heading)" }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)", borderBottom: "1px solid var(--border)" }}>
                      {[
                        { label: "User", field: null },
                        { label: "Account", field: null },
                        { label: "Amount", field: "amount" as const },
                        { label: "Plan", field: "plan" as const },
                        { label: "Payment", field: null },
                        { label: "Bonus", field: null },
                        { label: "Doc", field: null },
                        { label: "Date", field: "date" as const },
                        { label: "Status", field: null },
                      ].map(({ label, field }) => (
                        <th key={label}
                          className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body whitespace-nowrap font-['Lato',_sans-serif] text-left ${field ? "cursor-pointer hover:text-heading transition-colors select-none" : ""}`}
                          onClick={field ? () => handleSort(field) : undefined}
                        >
                          {label}{field && <SortIcon field={field} />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((dep, index) => (
                      <tr key={dep.id}
                        className="border-b border-border transition-colors duration-150 hover:bg-surface-strong cursor-pointer"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => { setSelectedDeposit(dep); setViewDialogOpen(true); }}
                      >
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-heading text-sm">{dep.user.name}</div>
                          <div className="text-xs text-accent font-['Lato',_sans-serif] mt-0.5">{dep.user.email}</div>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-heading">{dep.accountNumber}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-[#3a6a2a] dark:text-[#9cd18a] font-semibold text-sm font-['Lato',_sans-serif]">${dep.amount.toLocaleString()}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium font-['Lato',_sans-serif] tracking-wider border border-accent bg-surface-strong text-heading">
                            {dep.planType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-heading text-sm font-['Lato',_sans-serif]">{dep.paymentMethod}</td>
                        <td className="px-5 py-3.5 text-heading text-sm font-['Lato',_sans-serif]">${dep.bonus}</td>
                        <td className="px-5 py-3.5">
                          {dep.proofOfPayment && (
                            <button onClick={(e) => { e.stopPropagation(); viewDocument(dep.id); }} className="w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-surface-strong hover:bg-surface hover:border-accent transition-all">
                              <FileText className="w-4 h-4 text-body" />
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-body font-['Lato',_sans-serif] whitespace-nowrap">
                          {format(toConfiguredZonedDate(dep.requestedOn), "MMM d, yyyy")}<br />
                          <span className="text-accent">{format(toConfiguredZonedDate(dep.requestedOn), "hh:mm a")}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium font-['Lato',_sans-serif] tracking-wide ${statusColors[dep.status].bg} ${statusColors[dep.status].text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors[dep.status].dot}`} />
                            {dep.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </ScrollArea>
          )}
        </div>

        {/* ── Mobile Cards ── */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-body text-xs font-['Lato',_sans-serif] tracking-widest uppercase">Loading…</p>
              </div>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="rounded-2xl border border-border p-8 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong">
              <Filter className="w-10 h-10 text-accent mx-auto mb-3" />
              <h3 className="text-lg font-light text-heading mb-2 font-['Cormorant_Garamond',_serif]">No Deposits Found</h3>
              <p className="text-body text-sm mb-4 font-['Lato',_sans-serif]">Try adjusting your filters</p>
              <button onClick={resetFilters} className="px-5 py-2 rounded-xl text-sm font-['Lato',_sans-serif]"
                style={{ background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))", color: "var(--heading)" }}>
                Clear Filters
              </button>
            </div>
          ) : (
            filteredDeposits.map((dep, index) => (
              <div key={dep.id} className="rounded-2xl border border-border p-4 space-y-3 cursor-pointer active:scale-[0.99] transition-transform bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                style={{ boxShadow: "0 2px 12px rgba(139,100,40,0.08)", animationDelay: `${index * 40}ms` }}
                onClick={() => { setSelectedDeposit(dep); setViewDialogOpen(true); }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-heading text-sm">{dep.user.name}</div>
                    <div className="text-xs text-accent font-['Lato',_sans-serif] mt-0.5">{dep.user.email}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-['Lato',_sans-serif] ${statusColors[dep.status].bg} ${statusColors[dep.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColors[dep.status].dot}`} />
                    {dep.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: "Account", value: <span className="font-mono text-xs text-heading">{dep.accountNumber}</span> },
                    { label: "Amount", value: <span className="font-semibold text-[#3a6a2a] dark:text-[#9cd18a] font-['Lato',_sans-serif]">${dep.amount}</span> },
                    { label: "Plan", value: <span className="inline-flex px-2 py-0.5 rounded-lg text-xs border border-accent bg-surface-strong text-heading font-['Lato',_sans-serif]">{dep.planType}</span> },
                    { label: "Bonus", value: <span className="text-heading font-['Lato',_sans-serif]">${dep.bonus}</span> },
                    { label: "Payment", value: <span className="text-heading text-xs font-['Lato',_sans-serif]">{dep.paymentMethod}</span> },
                    { label: "Date", value: <span className="text-body text-xs font-['Lato',_sans-serif]">{format(toConfiguredZonedDate(dep.requestedOn), "MMM d, yyyy")}</span> },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-accent text-xs uppercase tracking-wider font-['Lato',_sans-serif]">{label}</span>
                      <div className="mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-accent font-['Lato',_sans-serif] italic">Tap to view details</span>
                  <Eye className="w-3.5 h-3.5 text-accent" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {filteredDeposits.length > 0 && (
          <div className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)" }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <span className="text-sm text-body font-['Lato',_sans-serif]">
                Showing <span className="font-semibold text-heading">{(currentPage - 1) * itemsPerPage + 1}</span>–
                <span className="font-semibold text-heading">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
                <span className="font-semibold text-heading">{totalItems}</span>
              </span>

              <div className="flex w-full flex-wrap items-center justify-start gap-2 lg:w-auto lg:justify-center">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl text-sm font-['Lato',_sans-serif] border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  ← Prev
                </button>
                <div className="flex flex-wrap items-center gap-1">
                  {paginationItems.map((page, index) => {
                    const previousPage = paginationItems[index - 1];
                    const showEllipsis = previousPage && page - previousPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-1 text-sm text-body">…</span>
                        )}
                        <button onClick={() => setCurrentPage(page)}
                          className="h-9 min-w-9 rounded-xl px-3 text-sm font-['Lato',_sans-serif] transition-all"
                          style={currentPage === page
                            ? { background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))", color: "var(--heading)", border: "none" }
                            : { border: "1px solid var(--border)", color: "var(--heading)", background: "transparent" }}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl text-sm font-['Lato',_sans-serif] border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Next →
                </button>
              </div>

              <span className="text-sm text-body font-['Lato',_sans-serif] lg:text-right">Page {currentPage} of {totalPages}</span>
            </div>
          </div>
        )}

        {/* ── Approve Dialog ── */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border border-border p-0 overflow-hidden"
            style={{ background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)" }}
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border border-[#a0c890] dark:border-border bg-[#edf8e8] dark:bg-surface-strong flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#3a6a2a] dark:text-[#9cd18a]" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-heading font-['Cormorant_Garamond',_serif] tracking-wide">Approve Deposit</h2>
                  <p className="text-xs text-body font-['Lato',_sans-serif]">Confirm this deposit request</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body font-['Lato',_sans-serif]">Amount</label>
                  <div className="text-2xl font-light text-[#3a6a2a] dark:text-[#9cd18a] mt-1 font-['Cormorant_Garamond',_serif]">${selectedDeposit?.amount?.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body font-['Lato',_sans-serif] block mb-2">Bonus Amount <span className="normal-case tracking-normal">(optional)</span></label>
                  <Input value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} placeholder="0.00"
                    className="bg-surface-strong border-border focus:border-[#a0b880] text-heading placeholder:text-accent rounded-xl font-['Lato',_sans-serif]" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body font-['Lato',_sans-serif] block mb-2">Remarks</label>
                  <Textarea value={remarksText} onChange={(e) => setRemarksText(e.target.value)} placeholder="Add a note…" rows={3}
                    className="bg-surface-strong border-border focus:border-[#a0b880] text-heading placeholder:text-accent rounded-xl resize-none font-['Lato',_sans-serif]" />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button onClick={() => setApproveDialogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all font-['Lato',_sans-serif]">
                  Cancel
                </button>
                <button onClick={approveDepositHandler} disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-all hover:opacity-85 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4a7a3a, #2a5a1a)", color: "#edfaed" }}>
                  {actionLoading ? "Processing…" : "Approve"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Reject Dialog ── */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl border border-border p-0 overflow-hidden"
            style={{ background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)" }}
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border border-border bg-surface-strong flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-[#8a3a2a] dark:text-[#d99082]" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-heading font-['Cormorant_Garamond',_serif] tracking-wide">Reject Deposit</h2>
                  <p className="text-xs text-body font-['Lato',_sans-serif]">This action cannot be undone</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-body font-['Lato',_sans-serif]">Amount</label>
                  <div className="text-2xl font-light text-[#8a3a2a] dark:text-[#d99082] mt-1 font-['Cormorant_Garamond',_serif]">${selectedDeposit?.amount?.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-body font-['Lato',_sans-serif] block mb-2">Reason for Rejection</label>
                  <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Please explain why this deposit is being rejected…" rows={4}
                    className="bg-surface-strong border-border focus:border-[#d4a090] text-heading placeholder:text-accent rounded-xl resize-none font-['Lato',_sans-serif]" />
                </div>
              </div>

              <div className="flex gap-2.5">
                <button onClick={() => setRejectDialogOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all font-['Lato',_sans-serif]">
                  Cancel
                </button>
                <button onClick={rejectDepositHandler} disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-all hover:opacity-85 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #7a2a2a, #5a1a1a)", color: "var(--heading)" }}>
                  {actionLoading ? "Processing…" : "Reject"}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── View Details Dialog ── */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl border border-border p-0 overflow-hidden max-h-[92vh] overflow-y-auto"
            style={{ background: "linear-gradient(160deg, var(--surface-strong) 0%, var(--surface-strong) 100%)" }}
          >
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border border-border bg-surface-strong flex items-center justify-center">
                  <Eye className="w-5 h-5 text-body" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-heading font-['Cormorant_Garamond',_serif] tracking-wide">Deposit Details</h2>
                  <p className="text-xs text-body font-['Lato',_sans-serif]">Complete transaction information</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-strong p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">User</label>
                    <div className="text-sm font-semibold text-heading mt-1">{selectedDeposit?.user.name}</div>
                    <div className="text-xs text-body font-['Lato',_sans-serif]">{selectedDeposit?.user.email}</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Account Number</label>
                    <div className="text-sm font-mono text-heading mt-1">{selectedDeposit?.accountNumber}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Amount</label>
                    <div className="text-xl font-light text-[#3a6a2a] dark:text-[#9cd18a] mt-1 font-['Cormorant_Garamond',_serif]">${selectedDeposit?.amount?.toLocaleString()}</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Plan Type</label>
                    <div className="mt-1">
                      <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs border border-accent bg-surface-strong text-heading font-['Lato',_sans-serif] tracking-wider">
                        {selectedDeposit?.planType}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Payment Method</label>
                    <div className="text-sm text-heading mt-1 font-['Lato',_sans-serif]">{selectedDeposit?.paymentMethod}</div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Status</label>
                    <div className="mt-1">
                      {selectedDeposit && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-['Lato',_sans-serif] ${statusColors[selectedDeposit.status].bg} ${statusColors[selectedDeposit.status].text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[selectedDeposit.status].dot}`} />
                          {selectedDeposit.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(selectedDeposit?.paymentDetails?.walletAddress ||
                  selectedDeposit?.paymentDetails?.accountNumber ||
                  selectedDeposit?.transactionId) && (
                  <div className="pt-2 border-t border-border space-y-2">
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif] block">
                      Paid Into
                    </label>
                    <div className="text-sm text-heading bg-surface-strong border border-border rounded-xl p-3 font-['Lato',_sans-serif] space-y-1.5">
                      {selectedDeposit?.paymentDetails?.walletAddress && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-xs text-accent uppercase tracking-wide shrink-0">
                            {selectedDeposit.paymentDetails.walletName || "Wallet Address"}:
                          </span>
                          <span className="font-mono text-xs break-all">
                            {selectedDeposit.paymentDetails.walletAddress}
                          </span>
                        </div>
                      )}
                      {selectedDeposit?.paymentDetails?.accountNumber && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-xs text-accent uppercase tracking-wide shrink-0">
                            {selectedDeposit.paymentDetails.bankName || "Bank Account"}:
                          </span>
                          <span className="font-mono text-xs break-all">
                            {selectedDeposit.paymentDetails.accountNumber}
                            {selectedDeposit.paymentDetails.ifscSwift &&
                              ` · IFSC/SWIFT: ${selectedDeposit.paymentDetails.ifscSwift}`}
                          </span>
                        </div>
                      )}
                      {selectedDeposit?.transactionId && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-xs text-accent uppercase tracking-wide shrink-0">
                            Transaction ID:
                          </span>
                          <span className="font-mono text-xs break-all">
                            {selectedDeposit.transactionId}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Requested On</label>
                    <div className="text-sm text-heading mt-1 font-['Lato',_sans-serif]">
                      {selectedDeposit && format(toConfiguredZonedDate(selectedDeposit.requestedOn), "MMM d, yyyy, hh:mm a")}
                    </div>
                  </div>
                  {selectedDeposit?.approvedOn && (
                    <div>
                      <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif]">Approved On</label>
                      <div className="text-sm text-heading mt-1 font-['Lato',_sans-serif]">
                        {format(toConfiguredZonedDate(selectedDeposit.approvedOn), "MMM d, yyyy, hh:mm a")}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-border">
                  <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif] block mb-2">Remarks</label>
                  <div className="text-sm text-heading bg-surface-strong border border-border rounded-xl p-3 font-['Lato',_sans-serif] leading-relaxed">
                    {selectedDeposit?.remarks || <span className="text-accent italic">No remarks</span>}
                  </div>
                </div>

                {selectedDeposit?.proofOfPayment && (
                  <div className="pt-2 border-t border-border">
                    <label className="text-xs uppercase tracking-widest text-accent font-['Lato',_sans-serif] block mb-2">Document Preview</label>
                    <div className="rounded-xl border border-border overflow-hidden bg-surface-strong">
                      {selectedDepositDocumentUrl && !selectedDepositDocumentIsPdf ? (
                        <img src={selectedDepositDocumentUrl} alt="Deposit proof" className="w-full h-52 sm:h-64 object-contain bg-surface-strong" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-48 gap-3">
                          <div className="w-14 h-14 rounded-xl border border-border bg-surface-strong flex items-center justify-center">
                            <FileText className="w-7 h-7 text-accent" />
                          </div>
                          <p className="text-xs text-body font-['Lato',_sans-serif]">
                            {selectedDepositDocumentIsPdf ? "PDF document" : "Preview unavailable"}
                          </p>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleViewDocument(selectedDeposit.id)}
                      className="mt-3 w-full py-2 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all flex items-center justify-center gap-2 font-['Lato',_sans-serif]">
                      <Eye className="w-4 h-4" /> Open Document
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                {selectedDeposit?.status === "Pending" && (
                  <>
                    <button
                      onClick={() => { setViewDialogOpen(false); setApproveDialogOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] transition-all hover:opacity-85"
                      style={{ background: "linear-gradient(135deg, #4a7a3a, #2a5a1a)", color: "#edfaed" }}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => { setViewDialogOpen(false); setRejectDialogOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-['Lato',_sans-serif] border border-border hover:bg-surface-strong text-[#8a3a2a] dark:text-[#d99082] transition-all"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                <button onClick={() => setViewDialogOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm text-heading border border-border hover:bg-surface transition-all font-['Lato',_sans-serif]">
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Doc Modal ── */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{ background: "rgba(44,31,14,0.75)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="relative w-full h-full sm:w-[88%] sm:h-[88%] rounded-2xl overflow-hidden border border-accent shadow-2xl"
            style={{ background: "var(--surface-strong-opaque)" }}
          >
            <button
              onClick={() => { setShowDocModal(false); if (docUrl) URL.revokeObjectURL(docUrl); setDocUrl(null); setDocType(null); }}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-surface-strong hover:opacity-80 text-heading flex items-center justify-center transition-opacity shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
            {docType === "pdf" && <iframe src={docUrl!} className="w-full h-full" />}
            {docType === "image" && <img src={docUrl!} alt="Deposit Proof" className="w-full h-full object-contain" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositPage;
