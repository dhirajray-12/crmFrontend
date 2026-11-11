// frontend/src/pages/Adminpage/AdminPages/PartnersManagement.tsx
import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import { useNavigate } from "react-router-dom";
import { useToastStore } from "@/Store/toast.store";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  Clock,
  UserX,
  DollarSign,
  Eye,
  Network,
  ArrowUpDown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_BACKEND_URL;

// ── Interfaces ──
interface PartnerUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status?: string;
}

interface PartnerReferrer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  referralCode?: string | null;
}

interface Partner {
  _id: string;
  referralCode: string;
  referredBy: string | null;
  status: "pending" | "active" | "inactive";
  level: number;
  IBbalance: number;
  maximumCommission: number | null;
  isPendingAssignment: boolean;
  createdAt: string;
  directReferrals: number;
  totalEarned: number;
  totalTrades: number;
  totalVolume: number;
  totalPaid: number;
  totalPending: number;
  totalConfirmed: number;
  user: PartnerUser;
  referrer: PartnerReferrer | null;
}

interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  pendingPartners: number;
  inactivePartners: number;
  totalCommissionPaid: number;
  totalCommissionPending: number;
  totalCommissionConfirmed: number;
  totalCommissionAllTime: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  status: string;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

interface PartnersApiResponse {
  success: boolean;
  partners: Partner[];
  pagination: PaginationInfo;
}

interface StatsApiResponse {
  success: boolean;
  stats: PartnerStats;
}

const statusConfig = {
  pending: { bg: "bg-surface-strong text-heading", dot: "bg-accent", label: "Pending" },
  active: { bg: "bg-[#3a6a2a] text-[#edfaed]", dot: "bg-[#8ab88a]", label: "Active" },
  inactive: { bg: "bg-[#7a3a3a] text-heading", dot: "bg-[#c47a7a]", label: "Inactive" },
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

const sortOptions = [
  { value: "createdAt", label: "Join Date" },
  { value: "totalEarned", label: "Total Earned" },
  { value: "directReferrals", label: "Direct Referrals" },
  { value: "level", label: "Level" },
  { value: "name", label: "Name" },
];

const PartnersManagement: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const queryClient = useQueryClient();
  const [sortOpen, setSortOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 20,
  });
  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const getAllPartnersAPI = async (f: Filters) => {
    const params = new URLSearchParams({
      status: f.status,
      search: f.search,
      sortBy: f.sortBy,
      sortOrder: f.sortOrder,
      page: f.page.toString(),
      limit: f.limit.toString(),
    });
    const r = await axios.get<PartnersApiResponse>(
      `${API_URL}/admin/partners?${params}`,
      { withCredentials: true },
    );
    return r.data;
  };

  const getPartnerStatsAPI = async () => {
    const r = await axios.get<StatsApiResponse>(`${API_URL}/admin/partners/stats`, {
      withCredentials: true,
    });
    return r.data;
  };

  const {
    data: partnersResponse,
    isLoading: loading,
    error: partnersError,
  } = useQuery({
    queryKey: ["adminPartners", filters],
    queryFn: () => getAllPartnersAPI(filters),
    staleTime: 15 * 1000,
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["adminPartnerStats"],
    queryFn: getPartnerStatsAPI,
    staleTime: 15 * 1000,
  });

  useEffect(() => {
    if (!partnersError) return;
    const e = partnersError as any;
    addToast("error", e.message || "Failed to fetch partners");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnersError]);

  const partners = partnersResponse?.partners || [];
  const pagination: PaginationInfo =
    partnersResponse?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };
  const stats = statsResponse?.stats || null;

  useRealtimeSync({
    enabled: true,
    events: ["commission_updated", "withdrawal_updated"],
    onEvent: (event) => {
      if (event === "commission_updated" || event === "withdrawal_updated") {
        queryClient.invalidateQueries({ queryKey: ["adminPartners"] });
        queryClient.invalidateQueries({ queryKey: ["adminPartnerStats"] });
      }
    },
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: getConfiguredTimezone(),
    });

  const currentSortLabel =
    sortOptions.find((o) => o.value === filters.sortBy)?.label || "Join Date";

  if (loading && partners.length === 0) {
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
          Loading partners…
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
                  Partner
                  <span className="block italic text-body">Network</span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-body">
                  See who refers whom across the entire platform and how much
                  commission each partner has earned.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 w-full lg:w-auto">
                {[
                  { label: "Total", value: stats?.totalPartners ?? 0, icon: Users, accent: "#c4a055" },
                  { label: "Active", value: stats?.activePartners ?? 0, icon: UserCheck, accent: "#8ab88a" },
                  { label: "Pending", value: stats?.pendingPartners ?? 0, icon: Clock, accent: "#d4a854" },
                  { label: "Inactive", value: stats?.inactivePartners ?? 0, icon: UserX, accent: "#c47a7a" },
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

        {/* ══ COMMISSION SUMMARY STRIP ══ */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                label: "Paid Out",
                amount: stats.totalCommissionPaid,
                color: "#3a6a2a",
                bg: "from-[#f0f8f0] to-[#ddf0dd]",
                border: "#b0d8b0",
              },
              {
                label: "Confirmed (Unpaid)",
                amount: stats.totalCommissionConfirmed,
                color: "var(--body)",
                bg: "from-surface-strong to-surface",
                border: "var(--border)",
              },
              {
                label: "Pending",
                amount: stats.totalCommissionPending,
                color: "var(--status-red)",
                bg: "from-surface-strong to-surface-strong",
                border: "#e0b0b0",
              },
            ].map(({ label, amount, color, bg, border }) => (
              <div
                key={label}
                className={`rounded-2xl border p-4 bg-gradient-to-br ${bg}`}
                style={{ borderColor: border, boxShadow: "0 2px 12px rgba(139,100,40,0.07)" }}
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
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                <input
                  type="text"
                  placeholder="Search by name, email, or referral code…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 h-11 rounded-xl border border-border bg-surface-strong text-heading placeholder:text-accent text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { val: "all", label: "All" },
                  { val: "active", label: "Active" },
                  { val: "pending", label: "Pending" },
                  { val: "inactive", label: "Inactive" },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setFilters({ ...filters, status: val, page: 1 })}
                    className="h-9 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all border"
                    style={
                      filters.status === val
                        ? { background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))", color: "var(--heading)", borderColor: "var(--border)" }
                        : { background: "var(--surface-strong)", color: "var(--body)", borderColor: "var(--border)" }
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {/* sort */}
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-2 h-9 px-3 rounded-xl text-xs border border-border bg-surface-strong text-body transition-all hover:border-accent"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>{currentSortLabel}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                  </button>
                  {sortOpen && (
                    <div
                      className="absolute top-full right-0 mt-1.5 z-50 w-44 rounded-xl border border-border p-1.5"
                      style={{ background: "var(--surface-strong)", boxShadow: "0 8px 32px rgba(74,50,24,0.16)" }}
                    >
                      {sortOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            setFilters({
                              ...filters,
                              sortBy: o.value,
                              sortOrder:
                                filters.sortBy === o.value && filters.sortOrder === "desc"
                                  ? "asc"
                                  : "desc",
                              page: 1,
                            });
                            setSortOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-strong transition-colors"
                          style={{ color: filters.sortBy === o.value ? "#4a3218" : "#5a4020" }}
                        >
                          {o.label}
                          {filters.sortBy === o.value && (filters.sortOrder === "desc" ? " ↓" : " ↑")}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* per page */}
                <div className="relative">
                  <button
                    onClick={() => setLimitOpen(!limitOpen)}
                    className="flex items-center gap-2 h-9 px-3 rounded-xl text-xs border border-border bg-surface-strong text-body transition-all hover:border-accent"
                  >
                    <span>{filters.limit} / page</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${limitOpen ? "rotate-180" : ""}`} />
                  </button>
                  {limitOpen && (
                    <div
                      className="absolute top-full right-0 mt-1.5 z-50 w-28 rounded-xl border border-border p-1.5"
                      style={{ background: "var(--surface-strong)", boxShadow: "0 8px 32px rgba(74,50,24,0.16)" }}
                    >
                      {[10, 20, 50].map((n) => (
                        <button
                          key={n}
                          onClick={() => {
                            setFilters({ ...filters, limit: n, page: 1 });
                            setLimitOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-surface-strong transition-colors"
                          style={{ color: filters.limit === n ? "#4a3218" : "#5a4020" }}
                        >
                          {n} per page
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-border">
              <span className="text-sm text-body">
                <span className="font-semibold text-heading">{pagination.total}</span>{" "}
                partner{pagination.total !== 1 ? "s" : ""} · page{" "}
                <span className="font-semibold text-heading">{pagination.page}</span> of{" "}
                <span className="font-semibold text-heading">{Math.max(1, pagination.pages)}</span>
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
          style={{ boxShadow: "0 4px 32px rgba(139,100,40,0.10)" }}
        >
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "linear-gradient(90deg, var(--surface) 0%, var(--surface) 100%)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Partner", "Referred By", "Referral Code", "Direct Refs", "Level", "Status", "Total Earned", "Joined", "Actions"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-4 text-xs font-semibold uppercase tracking-widest text-body ${i === 8 ? "text-center" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-accent text-sm">
                    No partners found
                  </td>
                </tr>
              ) : (
                partners.map((p) => (
                  <tr
                    key={p._id}
                    className="border-b border-border hover:bg-surface-strong transition-colors duration-150 cursor-pointer"
                    onClick={() => navigate(`/admin/Partners/${p._id}`)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-heading text-sm font-semibold"
                          style={{ background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))" }}
                        >
                          {p.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-heading text-sm">
                            {p.user?.firstName} {p.user?.lastName}
                          </div>
                          <div className="text-xs text-accent mt-0.5">{p.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {p.referrer ? (
                        <div className="text-sm text-heading">
                          {p.referrer.firstName} {p.referrer.lastName}
                          <div className="text-xs text-accent">{p.referrer.email}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-accent italic">Root partner</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-border bg-surface-strong text-heading font-mono">
                        {p.referralCode || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-heading">{p.directReferrals}</td>
                    <td className="px-5 py-4 text-sm text-heading">L{p.level}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs text-accent">$</span>
                        <span
                          className="text-lg font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                          style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {p.totalEarned.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-heading">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/Partners/${p._id}`);
                          }}
                          title="View details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-105"
                          style={{ background: "var(--surface-strong)", borderColor: "var(--border)", color: "var(--body)" }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* ══ MOBILE CARDS ══ */}
        <div className="lg:hidden space-y-3">
          {partners.length === 0 ? (
            <div
              className="rounded-2xl border border-border p-10 text-center bg-[rgba(255,253,250,0.9)] dark:bg-surface-strong"
            >
              <p className="text-body text-sm">No partners found</p>
            </div>
          ) : (
            partners.map((p) => (
              <div
                key={p._id}
                onClick={() => navigate(`/admin/Partners/${p._id}`)}
                className="rounded-2xl border border-border overflow-hidden cursor-pointer bg-[rgba(255,253,250,0.92)] dark:bg-surface-strong"
                style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.09)" }}
              >
                <div
                  className="flex items-center justify-between p-4 border-b border-border"
                  style={{ background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-heading font-semibold"
                      style={{ background: "linear-gradient(135deg, var(--surface-strong), var(--surface-strong))" }}
                    >
                      {p.user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="font-semibold text-heading text-sm truncate"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {p.user?.firstName} {p.user?.lastName}
                      </div>
                      <div className="text-xs text-accent truncate">{p.user?.email}</div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: "Total Earned",
                        value: (
                          <span
                            className="text-base font-light text-[#3a6a2a] dark:text-[#9cd18a]"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                          >
                            ${p.totalEarned.toFixed(2)}
                          </span>
                        ),
                      },
                      { label: "Direct Refs", value: <span className="text-xs text-heading">{p.directReferrals}</span> },
                      {
                        label: "Referred By",
                        value: (
                          <span className="text-xs text-heading truncate">
                            {p.referrer ? `${p.referrer.firstName} ${p.referrer.lastName}` : "Root partner"}
                          </span>
                        ),
                      },
                      { label: "Joined", value: <span className="text-xs text-heading">{formatDate(p.createdAt)}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-strong border border-border rounded-xl px-3 py-2">
                        <div className="text-[10px] uppercase tracking-widest text-accent mb-0.5">{label}</div>
                        {value}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/Partners/${p._id}`);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all"
                    style={{ background: "var(--surface-strong)", borderColor: "var(--border)", color: "var(--body)" }}
                  >
                    <Network className="w-3.5 h-3.5" /> View Downline &amp; Commissions
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {pagination.pages > 1 && (
          <div
            className="rounded-2xl border border-border p-4 sm:p-5 bg-[rgba(255,253,250,0.85)] dark:bg-surface-strong"
            style={{ boxShadow: "0 2px 16px rgba(139,100,40,0.07)" }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-body">
                Showing{" "}
                <span className="font-semibold text-heading">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>
                –
                <span className="font-semibold text-heading">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{" "}
                of <span className="font-semibold text-heading">{pagination.total}</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm border border-border text-heading hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
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
                              ? { background: "linear-gradient(135deg,var(--surface-strong),var(--surface-strong))", color: "var(--heading)" }
                              : { border: "1px solid var(--border)", color: "var(--heading)" }
                          }
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
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
    </div>
  );
};

export default PartnersManagement;
