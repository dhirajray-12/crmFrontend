import React, { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAPI } from "../../../API/api";

interface Client {
  _id: string;
  totalDeposited: number;
  depositCount: number;
  accountsCount: number;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

interface TopClientsResponse {
  success: boolean;
  data: Client[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const fmtK = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${Math.round(n / 1_000)}K`
      : fmt(n);

type SortKey = "amount" | "performance" | "accounts";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "amount", label: "By amount" },
  { key: "performance", label: "By deposits" },
  { key: "accounts", label: "By accounts" },
];

const PER_PAGE = 5;

function getClientName(client: Client) {
  const full =
    `${client.user?.firstName ?? ""} ${client.user?.lastName ?? ""}`.trim();
  return full || "Unknown client";
}

function getInitials(client: Client) {
  const name = getClientName(client);
  if (name === "Unknown client") return "UC";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function RankBadge({ rank }: { rank: number }) {
  const base =
    "w-8 h-8 rounded-[10px] flex items-center justify-center font-black text-sm shrink-0";
  if (rank === 1)
    return (
      <div
        className={`${base} border border-[rgba(200,140,30,0.3)]`}
        style={{
          background: "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
          color: "var(--heading)",
        }}
      >
        1
      </div>
    );
  if (rank === 2)
    return (
      <div
        className={`${base} border border-[rgba(180,180,180,0.3)]`}
        style={{
          background: "linear-gradient(135deg,var(--surface-strong),var(--surface))",
          color: "var(--body)",
        }}
      >
        2
      </div>
    );
  if (rank === 3)
    return (
      <div
        className={`${base} border border-[rgba(180,110,60,0.3)]`}
        style={{
          background: "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
          color: "var(--heading)",
        }}
      >
        3
      </div>
    );
  return (
    <div
      className={`${base} bg-surface-strong/60 border border-[rgba(200,150,60,0.18)] text-body`}
    >
      {rank}
    </div>
  );
}

function ShareBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-[5px] rounded-full bg-[rgba(200,160,80,0.2)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: "linear-gradient(90deg,var(--accent-color),var(--accent-color))",
          }}
        />
      </div>
      <span className="text-[11px] font-semibold text-body w-7 text-right">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// Theme-derived tone (same approach as TodaysPerformanceCards/RecentTransactions)
// — mixed from the superadmin's accent/status tokens instead of a fixed
// pastel, so the leaderboard's hover state and count pills stay legible and
// on-theme in dark mode instead of muddying into grey.
const tone = (v: string) => ({
  text: `var(${v})`,
  bg: `color-mix(in srgb, var(${v}) 16%, var(--surface-strong))`,
  border: `color-mix(in srgb, var(${v}) 40%, var(--border))`,
});
const rowHoverBg = "color-mix(in srgb, var(--accent-color) 10%, transparent)";
const greenTone = tone("--status-green");
const purpleTone = tone("--status-purple");

function StatCell({
  label,
  value,
  hide,
}: {
  label: string;
  value: string;
  hide?: boolean;
}) {
  return (
    <div
      className={`flex-1 min-w-[80px] px-5 py-3 border-r border-[rgba(200,150,60,0.18)] last:border-r-0 ${hide ? "hidden sm:block" : ""}`}
    >
      <div className="text-[9px] font-bold tracking-[0.16em] uppercase text-body">
        {label}
      </div>
      <div
        className="mt-1 text-lg sm:text-xl font-black leading-none text-heading"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
    </div>
  );
}

export const TopClients: React.FC = () => {
  const { dashboardAPI } = useAPI();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("amount");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTopClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = (await dashboardAPI.getTopClients(
        10,
      )) as TopClientsResponse;
      setClients(
        (response.data || []).map((c) => ({ ...c, user: c.user ?? null })),
      );
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load top clients");
    } finally {
      setLoading(false);
    }
  }, [dashboardAPI]);

  useEffect(() => {
    void fetchTopClients();
    const interval = setInterval(() => void fetchTopClients(), 60_000);
    const handler = () => void fetchTopClients();
    window.addEventListener("crm:admin-dashboard-refresh", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("crm:admin-dashboard-refresh", handler);
    };
  }, [fetchTopClients]);

  const sorted = [...clients].sort((a, b) => {
    if (sortBy === "amount") return b.totalDeposited - a.totalDeposited;
    if (sortBy === "performance") return b.depositCount - a.depositCount;
    return b.accountsCount - a.accountsCount;
  });

  const totalVol = sorted.reduce((s, c) => s + c.totalDeposited, 0);
  const totalDeps = sorted.reduce((s, c) => s + c.depositCount, 0);
  const totalAccts = sorted.reduce((s, c) => s + c.accountsCount, 0);
  const avgVol = sorted.length ? Math.round(totalVol / sorted.length) : 0;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PER_PAGE;
  const pageClients = sorted.slice(start, start + PER_PAGE);

  const handleSort = (key: SortKey) => {
    setSortBy(key);
    setCurrentPage(1);
  };

  const goTo = (p: number) =>
    setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  /* ── loading skeleton ── */
  if (loading && clients.length === 0) {
    return (
      <div className="rounded-[20px] border border-[rgba(200,150,60,0.35)] bg-surface-strong overflow-hidden">
        <div className="flex items-center justify-center min-h-[320px] gap-4 flex-col">
          <RefreshCw className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm text-body font-medium">
            Loading client leaderboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-[rgba(200,150,60,0.35)] bg-surface-strong overflow-hidden">
      {/* ── HEADER ── */}
      <div
        className="border-b border-[rgba(200,150,60,0.35)] px-5 sm:px-6 pt-5 pb-0"
        style={{
          background:
            "linear-gradient(105deg,var(--surface-strong) 0%,var(--surface) 60%,var(--surface) 100%)",
        }}
      >
        {/* badge + title */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,150,60,0.35)] bg-surface-strong/70 px-3 py-1 text-[10px] font-bold tracking-[0.2em] uppercase text-body">
          <Crown className="w-3.5 h-3.5" />
          Capital leaderboard
        </div>
        <h2 className="mt-2.5 text-2xl sm:text-3xl font-black leading-[1.1] text-heading tracking-tight">
          Top clients by{" "}
          <span className="text-accent">deposited volume</span>
        </h2>

        {/* stats strip */}
        <div className="flex mt-4 border-t border-[rgba(200,150,60,0.18)] overflow-x-auto">
          <StatCell label="Total volume" value={fmtK(totalVol)} />
          <StatCell label="Avg per client" value={fmtK(avgVol)} />
          <StatCell
            label="Total deposits"
            value={totalDeps.toLocaleString()}
            hide
          />
          <StatCell label="Accounts" value={totalAccts.toLocaleString()} hide />
          <StatCell label="Clients ranked" value={sorted.length.toString()} />
        </div>
      </div>

      {/* ── CONTROLS ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-b border-[rgba(200,150,60,0.18)] bg-[rgba(255,250,235,0.7)] dark:bg-surface-strong">
        {/* sort tabs */}
        <div className="flex gap-1 p-1 rounded-xl border border-[rgba(200,150,60,0.35)] bg-surface-strong/50">
          {SORT_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-all ${
                sortBy === key
                  ? "font-semibold text-heading"
                  : "text-body hover:bg-surface-strong/60"
              }`}
              style={
                sortBy === key
                  ? {
                      background: "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
                    }
                  : {}
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* pagination + refresh */}
        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goTo(safePage - 1)}
                disabled={safePage <= 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[rgba(200,150,60,0.35)] bg-surface-strong/60 text-body hover:bg-surface-strong disabled:opacity-35 disabled:cursor-default transition-all"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-medium text-body px-1">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => goTo(safePage + 1)}
                disabled={safePage >= totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-[rgba(200,150,60,0.35)] bg-surface-strong/60 text-body hover:bg-surface-strong disabled:opacity-35 disabled:cursor-default transition-all"
                aria-label="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => void fetchTopClients()}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-body bg-surface-strong/55 border border-[rgba(200,150,60,0.35)] rounded-xl px-3 py-1.5 hover:bg-surface-strong/90 hover:text-body disabled:opacity-50 transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="mx-5 sm:mx-6 mt-4 rounded-xl border border-border bg-surface-strong px-4 py-3 text-sm font-medium text-[#87534a] dark:text-[#ca9991]">
          {error}
        </div>
      )}

      {/* ── TABLE ── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
          <TrendingUp className="w-8 h-8 text-accent opacity-40" />
          <p className="text-base font-semibold text-heading">
            No clients found
          </p>
          <p className="text-sm text-body max-w-xs">
            Once high-value client activity is available, the leaderboard will
            appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[rgba(200,150,60,0.18)] bg-[rgba(255,250,235,0.8)] dark:bg-surface-strong">
                {[
                  { label: "#", cls: "w-12 pl-5 sm:pl-6" },
                  { label: "Client", cls: "" },
                  { label: "Volume", cls: "text-right" },
                  {
                    label: "Avg ticket",
                    cls: "text-right hidden sm:table-cell",
                  },
                  { label: "Deposits", cls: "text-right" },
                  { label: "Accounts", cls: "text-right hidden sm:table-cell" },
                  { label: "Share", cls: "hidden sm:table-cell" },
                ].map(({ label, cls }) => (
                  <th
                    key={label}
                    className={`py-2.5 px-4 text-[9px] font-bold tracking-[0.18em] uppercase text-body ${cls}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageClients.map((client, i) => {
                const rank = start + i + 1;
                const share =
                  totalVol > 0 ? (client.totalDeposited / totalVol) * 100 : 0;
                const avgTicket =
                  client.depositCount > 0
                    ? Math.round(client.totalDeposited / client.depositCount)
                    : 0;
                const isTop3 = rank <= 3;

                return (
                  <tr
                    key={client._id}
                    className={`border-b border-[rgba(200,150,60,0.13)] last:border-b-0 transition-colors ${
                      isTop3
                        ? "bg-surface-strong"
                        : ""
                    }`}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = rowHoverBg)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = isTop3
                        ? "var(--surface-strong)"
                        : "")
                    }
                  >
                    {/* rank */}
                    <td className="py-3 pl-5 sm:pl-6 pr-3">
                      <RankBadge rank={rank} />
                    </td>

                    {/* client */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-[11px] flex items-center justify-center text-xs font-bold shrink-0 border border-[rgba(200,150,60,0.35)]"
                          style={{
                            background:
                              "linear-gradient(135deg,var(--surface-strong),var(--accent-color))",
                            color: "var(--heading)",
                          }}
                        >
                          {getInitials(client)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-heading truncate leading-tight">
                            {getClientName(client)}
                          </div>
                          <div className="text-[11px] text-body truncate mt-0.5">
                            {client.user?.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* volume */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-[15px] font-black text-heading tabular-nums leading-none">
                        {fmt(client.totalDeposited)}
                      </span>
                    </td>

                    {/* avg ticket */}
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="text-sm font-medium text-heading tabular-nums">
                        {fmtK(avgTicket)}
                      </span>
                    </td>

                    {/* deposits */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className="inline-flex items-center text-[11px] font-semibold rounded-lg px-2.5 py-1 border"
                        style={{
                          background: greenTone.bg,
                          color: greenTone.text,
                          borderColor: greenTone.border,
                        }}
                      >
                        {client.depositCount}
                      </span>
                    </td>

                    {/* accounts */}
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span
                        className="inline-flex items-center text-[11px] font-semibold rounded-lg px-2.5 py-1 border"
                        style={{
                          background: purpleTone.bg,
                          color: purpleTone.text,
                          borderColor: purpleTone.border,
                        }}
                      >
                        {client.accountsCount}
                      </span>
                    </td>

                    {/* share bar */}
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <ShareBar pct={share} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 border-t border-[rgba(200,150,60,0.18)] bg-[rgba(255,250,235,0.5)] dark:bg-surface-strong">
        <span className="text-[11px] text-body flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Auto-refreshes every 60 seconds
        </span>
        {sorted.length > 0 && (
          <span className="text-[11px] text-body">
            Showing{" "}
            <strong className="text-heading">
              {start + 1}–{Math.min(start + PER_PAGE, sorted.length)}
            </strong>{" "}
            of <strong className="text-heading">{sorted.length}</strong>{" "}
            clients
          </span>
        )}
      </div>
    </div>
  );
};
