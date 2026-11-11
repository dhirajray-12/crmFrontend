import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Repeat,
  TrendingUp,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useAPI } from "../../../API/api.ts";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

/* ─────────────────────────── types ─────────────────────────── */
interface StatsResponse {
  data: {
    clients: { total: number; growth: number; today: number };
    deposits: { total: number; growth: number; today: number };
    withdrawals: { total: number; growth: number; pending: number };
    transactions: { total: number; growth: number };
    ibPartners: { total: number; growth: number; pending: number };
    accounts: { total: number; growth: number; today: number };
  };
}

/* ─────────────────────────── formatters ─────────────────────── */
const compact = (n: number, currency = false) => {
  const f = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: n >= 1000 ? 1 : 2,
  }).format(n);
  return currency ? `$${f}` : f;
};

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

/* ─────────────────────────── palette ────────────────────────── */
const palette = {
  blue: {
    fill: "#dbe8f4",
    stroke: "#7ea6c7",
    text: "#355877",
    ring: "#426a91",
  },
  emerald: {
    fill: "#deeee5",
    stroke: "#87b69a",
    text: "#3f6f53",
    ring: "#4f7e62",
  },
  red: { fill: "var(--heading)", stroke: "#cf9a8f", text: "#87534a", ring: "#b26c5b" },
  purple: {
    fill: "#e6e2f2",
    stroke: "#9c95c6",
    text: "#595281",
    ring: "#6a6598",
  },
  orange: {
    fill: "var(--heading)",
    stroke: "var(--accent-color)",
    text: "#846038",
    ring: "#a87742",
  },
  cyan: {
    fill: "#deecec",
    stroke: "#88b4b7",
    text: "#416b6f",
    ring: "#4f8185",
  },
} as const;
type ColorKey = keyof typeof palette;

/* ─────────────────────────── RadialRing ─────────────────────── */
function RadialRing({
  pct: percentage,
  color,
  size = 56,
  stroke = 4,
}: {
  pct: number;
  color: ColorKey;
  size?: number;
  stroke?: number;
}) {
  const c = palette[color];
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(Math.abs(percentage), 100) / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={c.fill}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={c.ring}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        strokeDashoffset={0}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
    </svg>
  );
}

/* ─────────────────────────── MiniSparkline ─────────────────────── */
function MiniSparkline({
  points,
  color,
}: {
  points: number[];
  color: ColorKey;
}) {
  const c = palette[color];
  const w = 80,
    h = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const scale = (v: number) => h - ((v - min) / (max - min || 1)) * h;
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${xs[i]},${scale(v)}`)
    .join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.ring} stopOpacity="0.25" />
          <stop offset="100%" stopColor={c.ring} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color})`} />
      <path
        d={d}
        fill="none"
        stroke={c.ring}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={xs[xs.length - 1]}
        cy={scale(points[points.length - 1])}
        r="2.5"
        fill={c.ring}
      />
    </svg>
  );
}

/* ─────────────────────────── sparkline seeds ────────────────────── */
const sparklines: Record<ColorKey, number[]> = {
  blue: [20, 35, 28, 52, 47, 71, 63],
  emerald: [30, 44, 41, 58, 56, 78, 74],
  red: [78, 64, 70, 50, 53, 41, 32],
  purple: [26, 40, 37, 53, 51, 68, 64],
  orange: [40, 34, 52, 46, 64, 58, 79],
  cyan: [16, 29, 24, 43, 40, 62, 58],
};

/* ─────────────────────────── HeroMetric ─────────────────────────── */
function HeroMetric({
  label,
  value,
  detail,
  growth,
  color,
  icon,
  subtitle,
  sparkColor,
}: {
  label: string;
  value: string;
  detail?: string;
  growth: number;
  color: ColorKey;
  icon: React.ReactNode;
  subtitle: string;
  sparkColor: ColorKey;
}) {
  const c = palette[color];
  const up = growth >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border p-7 flex flex-col gap-6"
      style={{
        borderColor: "rgba(200,150,60,0.35)",
        background:
          "linear-gradient(145deg,var(--surface-strong) 0%,var(--surface-strong) 55%,var(--surface) 100%)",
        boxShadow:
          "0 20px 52px rgba(116,93,56,0.10), inset 0 1px 0 color-mix(in srgb, var(--heading) 12%, transparent)",
      }}
    >
      {/* background watermark ring */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full border-[20px] opacity-20"
        style={{ borderColor: c.ring }}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[18px] border shadow-sm"
            style={{ background: c.fill, borderColor: c.stroke, color: c.text }}
          >
            {icon}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-body">
              {label}
            </div>
            <div className="mt-0.5 text-[13px] font-medium text-body">
              {subtitle}
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold"
          style={{ background: c.fill, borderColor: c.stroke, color: c.text }}
        >
          {up ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {pct(growth)}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-5xl font-black tracking-tight text-[#0f172a] dark:text-heading"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {value}
          </div>
          {detail && (
            <div
              className="mt-1.5 text-sm font-medium"
              style={{ color: c.text }}
            >
              {detail}
            </div>
          )}
        </div>
        <MiniSparkline points={sparklines[sparkColor]} color={sparkColor} />
      </div>

      {/* bottom rule */}
      <div
        className="absolute bottom-0 inset-x-0 h-1 rounded-b-[28px]"
        style={{
          background: `linear-gradient(90deg,${c.fill},${c.ring},${c.fill})`,
        }}
      />
    </div>
  );
}

/* ─────────────────────────── CompactTile ─────────────────────────── */
function CompactTile({
  label,
  value,
  growth,
  color,
  icon,
  sub,
}: {
  label: string;
  value: string;
  growth: number;
  color: ColorKey;
  icon: React.ReactNode;
  sub: string;
}) {
  const c = palette[color];
  const up = growth >= 0;
  const capped = Math.min(Math.abs(growth), 100);

  return (
    <div
      className="relative flex flex-col gap-4 rounded-[22px] border border-[rgba(200,150,60,0.28)] bg-[linear-gradient(160deg,rgba(255,252,247,0.96),rgba(247,239,223,0.88))] p-5 overflow-hidden dark:border-border dark:bg-surface-strong dark:bg-none"
      style={{
        boxShadow: "0 8px 20px rgba(116,93,56,0.06)",
      }}
    >
      <div className="flex items-center justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[13px] border"
          style={{ background: c.fill, borderColor: c.stroke, color: c.text }}
        >
          {icon}
        </div>
        <RadialRing pct={capped} color={color} size={44} stroke={3.5} />
      </div>

      <div>
        <div
          className="text-2xl font-black tracking-tight text-[#0f172a] dark:text-heading"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </div>
        <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-body">
          {label}
        </div>
        <div className="mt-2 text-xs text-body">{sub}</div>
      </div>

      <div
        className="flex items-center gap-1.5 text-xs font-bold"
        style={{ color: c.text }}
      >
        {up ? (
          <ArrowUpRight className="h-3.5 w-3.5" />
        ) : (
          <ArrowDownRight className="h-3.5 w-3.5" />
        )}
        {pct(growth)} vs last period
      </div>

      {/* left accent bar */}
      <div
        className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-full"
        style={{ background: c.ring }}
      />
    </div>
  );
}

/* ─────────────────────────── TickerRow ─────────────────────────── */
function TickerItem({
  label,
  value,
  growth,
}: {
  label: string;
  value: string;
  growth: number;
}) {
  const up = growth >= 0;
  return (
    <div className="flex shrink-0 items-center gap-3 border-r border-[rgba(200,150,60,0.2)] dark:border-border px-6 last:border-r-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
        {label}
      </span>
      <span className="text-sm font-black text-heading">{value}</span>
      <span
        className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? "text-[#3f6f53] dark:text-[#8ab88a]" : "text-[#87534a] dark:text-[#c47a7a]"}`}
      >
        {up ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        )}
        {pct(growth)}
      </span>
    </div>
  );
}

/* ─────────────────────────── main export ─────────────────────────── */
export const StatsCard: React.FC = () => {
  const { dashboardAPI } = useAPI();
  const [stats, setStats] = useState<StatsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = (await dashboardAPI.getStats()) as StatsResponse;
      setStats(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
    const interval = setInterval(fetchStats, 30_000);
    const handler = () => void fetchStats();
    window.addEventListener("crm:admin-dashboard-refresh", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("crm:admin-dashboard-refresh", handler);
    };
  }, [dashboardAPI]);

  if (loading) {
    return (
      <div className="flex h-56 items-center justify-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(200,150,60,0.35)] bg-surface-strong dark:border-border">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-[#b99663]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[rgba(200,150,60,0.28)] bg-[rgba(255,250,241,0.7)] p-4 dark:border-border dark:bg-surface-strong dark:bg-none">
        <p className="text-sm font-medium text-[#87534a] dark:text-[#c47a7a]">Error: {error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const totalDep = Number(stats.deposits.total) || 0;
  const totalWit = Number(stats.withdrawals.total) || 0;

  return (
    <section className="flex flex-col gap-5">
      {/* ── section header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-body">
            Platform Pulse
          </div>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-[#0f172a] dark:text-heading">
            Live Metrics
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="hidden text-xs text-body sm:block">
              Updated{" "}
              {lastUpdated.toLocaleTimeString("en-US", {
                timeStyle: "short",
                timeZone: getConfiguredTimezone(),
              })}
            </span>
          )}
          <button
            type="button"
            onClick={() => void fetchStats()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(200,150,60,0.35)] bg-[rgba(255,252,247,0.9)] transition hover:bg-surface-strong dark:border-border dark:bg-surface-strong dark:bg-none"
            aria-label="Refresh stats"
          >
            <RefreshCw className="h-4 w-4 text-body" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-[rgba(79,134,100,0.25)] bg-[rgba(79,134,100,0.08)] px-3 py-1.5 text-xs font-semibold text-[#3f6f53] dark:border-border dark:bg-surface-strong dark:text-[#8ab88a]">
            <span className="h-2 w-2 rounded-full bg-[#4f8664] animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* ── ticker strip ── */}
      <div
        className="overflow-x-auto rounded-[18px] border border-[rgba(200,150,60,0.28)] bg-[linear-gradient(90deg,rgba(255,252,247,0.95),rgba(247,238,218,0.92))] dark:border-border dark:bg-surface-strong dark:bg-none"
        style={{
          scrollbarWidth: "none",
        }}
      >
        <div ref={tickerRef} className="flex items-center py-3">
          <TickerItem
            label="Clients"
            value={stats.clients.total.toLocaleString()}
            growth={stats.clients.growth}
          />
          <TickerItem
            label="Deposits"
            value={compact(totalDep, true)}
            growth={stats.deposits.growth}
          />
          <TickerItem
            label="Withdrawals"
            value={compact(totalWit, true)}
            growth={stats.withdrawals.growth}
          />
          <TickerItem
            label="Transactions"
            value={stats.transactions.total.toLocaleString()}
            growth={stats.transactions.growth}
          />
          <TickerItem
            label="IB Partners"
            value={stats.ibPartners.total.toLocaleString()}
            growth={stats.ibPartners.growth}
          />
          <TickerItem
            label="Accounts"
            value={stats.accounts.total.toLocaleString()}
            growth={stats.accounts.growth}
          />
        </div>
      </div>

      {/* ── hero + side column ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* hero — deposits */}
        <HeroMetric
          label="Total Deposits"
          value={compact(totalDep, true)}
          detail={`$${totalDep.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          growth={stats.deposits.growth}
          color="emerald"
          sparkColor="emerald"
          icon={<DollarSign className="h-6 w-6" strokeWidth={2} />}
          subtitle={`$${stats.deposits.today.toLocaleString()} received today`}
        />

        {/* side stack */}
        <div className="flex flex-col gap-4">
          {/* clients mini hero */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-[rgba(200,150,60,0.28)] bg-[linear-gradient(135deg,rgba(255,252,247,0.97),rgba(219,232,244,0.6))] p-5 flex items-center gap-5 dark:border-border dark:bg-surface-strong dark:bg-none"
            style={{
              boxShadow: "0 8px 20px rgba(116,93,56,0.06)",
            }}
          >
            <RadialRing
              pct={Math.min(stats.clients.growth, 100)}
              color="blue"
              size={64}
              stroke={5}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-body">
                Total Clients
              </div>
              <div
                className="mt-1 text-3xl font-black tracking-tight text-[#0f172a] dark:text-heading"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {stats.clients.total.toLocaleString()}
              </div>
              <div className="mt-0.5 text-xs text-body">
                {stats.clients.today} new today
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#355877] dark:text-[#7ea6c7]">
              {stats.clients.growth >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {pct(stats.clients.growth)}
            </div>
          </div>

          {/* withdrawals */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-[rgba(200,150,60,0.28)] bg-[linear-gradient(135deg,rgba(255,252,247,0.97),rgba(244,226,221,0.6))] p-5 flex items-center gap-5 dark:border-border dark:bg-surface-strong dark:bg-none"
            style={{
              boxShadow: "0 8px 20px rgba(116,93,56,0.06)",
            }}
          >
            <RadialRing
              pct={Math.min(Math.abs(stats.withdrawals.growth), 100)}
              color="red"
              size={64}
              stroke={5}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-body">
                Withdrawals
              </div>
              <div
                className="mt-1 text-3xl font-black tracking-tight text-[#0f172a] dark:text-heading"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {compact(totalWit, true)}
              </div>
              <div className="mt-0.5 text-xs text-body">
                {stats.withdrawals.pending} pending
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-xs font-bold ${stats.withdrawals.growth >= 0 ? "text-[#3f6f53] dark:text-[#8ab88a]" : "text-[#87534a] dark:text-[#c47a7a]"}`}
            >
              {stats.withdrawals.growth >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {pct(stats.withdrawals.growth)}
            </div>
          </div>
        </div>
      </div>

      {/* ── compact tile grid ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CompactTile
          label="Transactions"
          value={stats.transactions.total.toLocaleString()}
          growth={stats.transactions.growth}
          color="purple"
          icon={<Repeat className="h-4.5 w-4.5" strokeWidth={2} />}
          sub="All-time volume"
        />
        <CompactTile
          label="IB Partners"
          value={stats.ibPartners.total.toLocaleString()}
          growth={stats.ibPartners.growth}
          color="orange"
          icon={<UserCheck className="h-4.5 w-4.5" strokeWidth={2} />}
          sub={`${stats.ibPartners.total - stats.ibPartners.pending} active`}
        />
        <CompactTile
          label="Active Accounts"
          value={stats.accounts.total.toLocaleString()}
          growth={stats.accounts.growth}
          color="cyan"
          icon={<TrendingUp className="h-4.5 w-4.5" strokeWidth={2} />}
          sub={`${stats.accounts.today} opened today`}
        />
      </div>
    </section>
  );
};
