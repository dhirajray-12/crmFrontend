import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  Activity,
  CreditCard,
  Wallet,
  PieChart,
  Layers,
  Zap,
  BarChart2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";
import {
  fetchRevenueAnalytics,
  fetchRevenueTimeSeries,
  type RevenueAnalyticsData,
  type TimeSeriesDataPoint,
} from "../../../services/revenueAnalyticsService";
import {
  usePublicPlatformStatus,
  DEFAULT_APP_THEME,
} from "@/hooks/useBillingSuspension";

/* ─── types ─────────────────────────────────────────────────── */
const chartOptions = [
  { value: "bar", label: "Area", icon: Layers },
  { value: "line", label: "Line", icon: Activity },
  { value: "radial", label: "Radial", icon: PieChart },
] as const;
type ChartFilter = (typeof chartOptions)[number]["value"];

const timeOptions = [7, 14, 30, 60, 90];

/* ─── formatters ─────────────────────────────────────────────── */
const fmt = (n: number) => `$${n.toLocaleString()}`;
const cmp = (n: number) =>
  `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: n >= 100_000 ? 1 : 2 }).format(n)}`;
const dlt = (n: number) => `${n >= 0 ? "+" : ""}${n}%`;
const lots = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/* ─── colour tokens ──────────────────────────────────────────── */
// CREAM/BORDER/SLATE/MUTED are theme surface/text tokens (CSS vars update
// live with the superadmin's chosen mode/accent). GREEN/RED are semantic
// (up/down) and stay fixed on purpose. GOLD needs the *actual* accent hex
// (not a CSS var) because it's concatenated with alpha suffixes below
// (e.g. `GOLD + "18"`), which only works on a real hex string — see
// `accentColor` inside the component.
const CREAM = "var(--surface-strong)";
const BORDER = "var(--border)";
const SLATE = "var(--heading)";
const MUTED = "var(--subtle)";
const GREEN = "#5b8d68";
const RED = "#c17b69";
const BLUE = "#5f86aa";

/* ─── tiny helpers ───────────────────────────────────────────── */
function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ background: color }}
    />
  );
}

function Tag({ up, label }: { up: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold"
      style={{
        background: up ? "rgba(91,141,104,0.12)" : "rgba(193,123,105,0.12)",
        color: up ? GREEN : RED,
      }}
    >
      {up ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {label}
    </span>
  );
}

/* ─── Instrument gauge strip item ───────────────────────────── */
function Gauge({
  label,
  value,
  detail,
  growth,
  color,
  icon: Icon,
  rank,
}: {
  label: string;
  value: string;
  detail?: string;
  growth: number;
  color: string;
  icon: React.FC<any>;
  rank: number;
}) {
  const up = growth >= 0;
  return (
    <div
      className="relative flex shrink-0 flex-col justify-between rounded-[20px] border p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        width: 210,
        borderColor: BORDER,
        background: CREAM,
        boxShadow: "0 6px 20px rgba(116,93,56,0.07)",
      }}
    >
      {/* rank watermark */}
      <span
        className="pointer-events-none absolute right-4 top-3 text-[64px] font-black leading-none opacity-[0.04] select-none"
        style={{ color: SLATE, fontVariantNumeric: "tabular-nums" }}
      >
        {String(rank).padStart(2, "0")}
      </span>

      <div className="flex items-start justify-between gap-2">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border"
          style={{ background: color + "18", borderColor: color + "40", color }}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
        <Tag up={up} label={dlt(growth)} />
      </div>

      <div className="mt-4">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em]"
          style={{ color: MUTED }}
        >
          {label}
        </div>
        <div
          className="mt-1 text-3xl font-black tracking-tight"
          style={{ color: SLATE, fontVariantNumeric: "tabular-nums" }}
        >
          {value}
        </div>
        {detail && (
          <div
            className="mt-0.5 text-[11px] font-medium"
            style={{ color: MUTED }}
          >
            {detail}
          </div>
        )}
      </div>

      {/* bottom accent line */}
      <div
        className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-[20px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

/* ─── Signal pill ─────────────────────────────────────────────── */
function Signal({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border py-4 px-3 text-center transition hover:shadow-md"
      style={{ borderColor: BORDER, background: "var(--surface-strong)" }}
    >
      <div
        className="text-[9px] font-bold uppercase tracking-[0.22em]"
        style={{ color: MUTED }}
      >
        {label}
      </div>
      <div
        className="text-xl font-black"
        style={{ color: SLATE, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
      <div className="text-[11px] font-medium" style={{ color: MUTED }}>
        {sub}
      </div>
    </div>
  );
}

/* ─── chart tooltip ──────────────────────────────────────────── */
const TooltipStyle = {
  backgroundColor: "var(--surface-strong)",
  borderRadius: 14,
  border: `1px solid ${BORDER}`,
  boxShadow: "0 12px 32px rgba(22,32,51,0.09)",
  padding: "12px 16px",
};

/* ─── main component ─────────────────────────────────────────── */
const RevenueAnalytics = () => {
  const { data: platformStatus } = usePublicPlatformStatus();
  const GOLD = platformStatus?.theme?.accentColor || DEFAULT_APP_THEME.accentColor;
  const [timeFilter, setTimeFilter] = useState(30);
  const [chartFilter, setChartFilter] = useState<ChartFilter>("bar");
  const [analyticsData, setAnalyticsData] =
    useState<RevenueAnalyticsData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [analytics, timeSeries] = await Promise.all([
          fetchRevenueAnalytics(timeFilter),
          fetchRevenueTimeSeries(
            timeFilter,
            chartFilter === "line" ? "daily" : "weekly",
          ),
        ]);
        setAnalyticsData(analytics);
        setTimeSeriesData(timeSeries.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load revenue analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [timeFilter, chartFilter]);

  const d = analyticsData?.data
    ? {
        deposits: analyticsData.data.deposits.total,
        withdrawals: analyticsData.data.withdrawals.total,
        netRevenue: analyticsData.data.netRevenue.total,
        depositGrowth: analyticsData.data.deposits.growth,
        withdrawalGrowth: analyticsData.data.withdrawals.growth,
        revenueGrowth: analyticsData.data.netRevenue.growth,
        ibCommission: analyticsData.data.ibCommission.total,
        activeIBPartners: analyticsData.data.ibPartners.active,
        ibTradingVolume: analyticsData.data.ibTradingVolume.total,
      }
    : {
        deposits: 0,
        withdrawals: 0,
        netRevenue: 0,
        depositGrowth: 0,
        withdrawalGrowth: 0,
        revenueGrowth: 0,
        ibCommission: 0,
        activeIBPartners: 0,
        ibTradingVolume: 0,
      };

  const netFlow = d.deposits - d.withdrawals;
  const netFlowPct =
    d.deposits > 0
      ? Math.min(100, Math.round((netFlow / d.deposits) * 100))
      : 0;

  /* ── loading ── */
  if (loading) {
    return (
      <div
        className="flex min-h-[480px] items-center justify-center rounded-[28px] border"
        style={{
          borderColor: BORDER,
          background: `linear-gradient(135deg, ${CREAM} 0%, var(--surface-strong) 100%)`,
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl border shadow-inner"
            style={{ borderColor: BORDER, background: "var(--surface-strong)" }}
          >
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: GOLD }} />
          </div>
          <p
            className="text-xs font-bold uppercase tracking-[0.22em]"
            style={{ color: MUTED }}
          >
            Compiling Analytics
          </p>
        </div>
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <div
        className="flex min-h-[480px] items-center justify-center rounded-[28px] border"
        style={{ borderColor: "var(--border)", background: "var(--surface-strong)" }}
      >
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "var(--surface-strong)" }}
          >
            <AlertCircle className="h-8 w-8" style={{ color: RED }} />
          </div>
          <div>
            <p className="font-black text-lg" style={{ color: "var(--status-red)" }}>
              Analytics Unavailable
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--status-red)" }}>
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: RED }}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ══ HEADER — warm cream/gold theme matching body ══════════ */}
      <div
        className="relative overflow-hidden rounded-[28px] border px-7 py-6"
        style={{
          borderColor: BORDER,
          background: `linear-gradient(130deg, ${CREAM} 0%, var(--surface-strong) 55%, var(--surface) 100%)`,
          boxShadow: "0 24px 56px rgba(116,93,56,0.10)",
        }}
      >
        {/* decorative grid lines */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(154,116,64,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(154,116,64,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* gold top bar */}
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${GOLD}, var(--accent-color), ${GOLD}, transparent)`,
          }}
        />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          {/* left: title */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md"
                style={{
                  background: GOLD + "25",
                  border: `1px solid ${GOLD}60`,
                }}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: GOLD }} />
              </span>
              <span
                className="text-[10px] font-bold uppercase tracking-[0.28em]"
                style={{ color: GOLD }}
              >
                Financial Intelligence
              </span>
            </div>
            <h2
              className="text-3xl font-black tracking-tight sm:text-4xl"
              style={{ color: SLATE }}
            >
              Revenue Analytics
            </h2>
            <p
              className="mt-2 max-w-lg text-sm font-medium"
              style={{ color: MUTED }}
            >
              Capital movement, partner payouts, and platform profitability over{" "}
              {timeFilter} days.
            </p>
          </div>

          {/* right: controls */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* time */}
            <div
              className="flex items-center gap-1 rounded-[14px] border p-1"
              style={{
                borderColor: BORDER,
                background: "var(--surface)",
              }}
            >
              {timeOptions.map((days) => (
                <button
                  key={days}
                  onClick={() => setTimeFilter(days)}
                  className="rounded-[10px] px-3.5 py-2 text-xs font-bold transition-all"
                  style={
                    timeFilter === days
                      ? { background: GOLD, color: "var(--heading)" }
                      : { color: MUTED }
                  }
                >
                  {days}D
                </button>
              ))}
            </div>

            {/* chart type */}
            <div
              className="flex items-center gap-1 rounded-[14px] border p-1"
              style={{
                borderColor: BORDER,
                background: "var(--surface)",
              }}
            >
              {chartOptions.map((opt) => {
                const Icon = opt.icon;
                const active = chartFilter === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setChartFilter(opt.value)}
                    className="flex items-center gap-1.5 rounded-[10px] px-3.5 py-2 text-xs font-bold transition-all"
                    style={
                      active
                        ? {
                            background: GOLD + "20",
                            color: SLATE,
                            border: `1px solid ${BORDER}`,
                          }
                        : { color: MUTED }
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* net-flow pulse bar */}
        <div
          className="relative mt-6 overflow-hidden rounded-xl border"
          style={{
            borderColor: BORDER,
            background: "rgba(223,207,175,0.35)",
          }}
        >
          <div
            className="h-2 rounded-xl transition-all duration-700"
            style={{
              width: `${Math.abs(netFlowPct)}%`,
              background:
                netFlow >= 0
                  ? `linear-gradient(90deg, ${GREEN}, #79bf96)`
                  : `linear-gradient(90deg, ${RED}, #e09c8b)`,
            }}
          />
          <div
            className="absolute inset-x-0 top-3 flex justify-between px-2 text-[10px] font-bold"
            style={{ color: MUTED }}
          >
            <span>Net Capital Flow</span>
            <span style={{ color: netFlow >= 0 ? GREEN : RED }}>
              {fmt(netFlow)} ({netFlowPct}%)
            </span>
          </div>
          <div className="h-4" />
        </div>
      </div>

      {/* ══ INSTRUMENT PANEL (horizontal scroll) ══════════════════ */}
      <div
        className="overflow-x-auto rounded-[24px] border"
        style={{
          borderColor: BORDER,
          background: "var(--surface)",
          scrollbarWidth: "none",
        }}
      >
        <div className="flex gap-4 p-4">
          <Gauge
            rank={1}
            label="Gross Deposits"
            value={cmp(d.deposits)}
            detail={fmt(d.deposits)}
            growth={d.depositGrowth}
            color={GREEN}
            icon={CreditCard}
          />
          <Gauge
            rank={2}
            label="Total Outflow"
            value={cmp(d.withdrawals)}
            detail={fmt(d.withdrawals)}
            growth={d.withdrawalGrowth}
            color={RED}
            icon={Wallet}
          />
          <Gauge
            rank={3}
            label="Platform Revenue"
            value={cmp(d.netRevenue)}
            detail={fmt(d.netRevenue)}
            growth={d.revenueGrowth}
            color={BLUE}
            icon={TrendingUp}
          />
          <Gauge
            rank={4}
            label="IB Commissions"
            value={fmt(d.ibCommission)}
            growth={d.depositGrowth}
            color={GOLD}
            icon={BarChart2}
          />
          <Gauge
            rank={5}
            label="Active Partners"
            value={String(d.activeIBPartners)}
            growth={d.revenueGrowth}
            color="#7b68c8"
            icon={Activity}
          />
          <Gauge
            rank={6}
            label="IB Trade Volume"
            value={`${lots(d.ibTradingVolume)}`}
            detail="Lots"
            growth={d.withdrawalGrowth}
            color="#5b9aaa"
            icon={Layers}
          />
        </div>
      </div>

      {/* ══ CHART CANVAS ══════════════════════════════════════════ */}
      <div
        className="relative rounded-[28px] border overflow-hidden"
        style={{
          borderColor: BORDER,
          background: `linear-gradient(160deg, ${CREAM} 0%, var(--surface-strong) 100%)`,
          boxShadow: "0 16px 48px rgba(116,93,56,0.08)",
        }}
      >
        {/* corner label */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: BORDER }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border"
              style={{ borderColor: BORDER, background: "var(--surface-strong)" }}
            >
              <BarChart2 className="h-4 w-4" style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: SLATE }}>
                Flow Visualization
              </p>
              <p className="text-[11px] font-medium" style={{ color: MUTED }}>
                Capital dynamics · {timeFilter}d window
              </p>
            </div>
          </div>

          {/* legend */}
          <div className="hidden items-center gap-5 sm:flex">
            {[
              ["Deposits", GREEN],
              ["Withdrawals", RED],
              ["Revenue", BLUE],
            ].map(([lbl, col]) => (
              <div key={lbl} className="flex items-center gap-1.5">
                <Dot color={col} />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: MUTED }}
                >
                  {lbl}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="h-[420px] w-full">
            {/* ── area ── */}
            {chartFilter === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    {[
                      ["dep", GREEN],
                      ["wit", RED],
                      ["rev", BLUE],
                    ].map(([id, col]) => (
                      <linearGradient
                        key={id}
                        id={`ga-${id}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={col} stopOpacity={0.28} />
                        <stop
                          offset="100%"
                          stopColor={col}
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(200,160,80,0.2)"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: MUTED, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: MUTED, fontWeight: 600 }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={TooltipStyle}
                    itemStyle={{ fontSize: 13, fontWeight: 700 }}
                    labelStyle={{
                      color: MUTED,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    name="Deposits"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    fill={`url(#ga-dep)`}
                    dot={false}
                    activeDot={{ r: 5, fill: GREEN, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    name="Withdrawals"
                    stroke={RED}
                    strokeWidth={2.5}
                    fill={`url(#ga-wit)`}
                    dot={false}
                    activeDot={{ r: 5, fill: RED, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    fill={`url(#ga-rev)`}
                    dot={false}
                    activeDot={{ r: 5, fill: BLUE, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* ── line ── */}
            {chartFilter === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(200,160,80,0.2)"
                  />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: MUTED, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: MUTED, fontWeight: 600 }}
                    tickFormatter={(v) => `$${v / 1000}k`}
                    dx={-5}
                  />
                  <Tooltip
                    contentStyle={TooltipStyle}
                    itemStyle={{ fontSize: 13, fontWeight: 700 }}
                    labelStyle={{
                      color: MUTED,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deposits"
                    name="Deposits"
                    stroke={GREEN}
                    strokeWidth={2.5}
                    dot={{
                      r: 3.5,
                      fill: "var(--heading)",
                      stroke: GREEN,
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: GREEN,
                      stroke: "var(--heading)",
                      strokeWidth: 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="withdrawals"
                    name="Withdrawals"
                    stroke={RED}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "var(--heading)", stroke: RED, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      fill: RED,
                      stroke: "var(--heading)",
                      strokeWidth: 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={BLUE}
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "var(--heading)", stroke: BLUE, strokeWidth: 2 }}
                    activeDot={{
                      r: 6,
                      fill: BLUE,
                      stroke: "var(--heading)",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* ── radial ── */}
            {chartFilter === "radial" && (
              <div className="grid h-full grid-cols-1 gap-5 md:grid-cols-3">
                {[
                  {
                    title: "Deposits",
                    compact: cmp(d.deposits),
                    full: fmt(d.deposits),
                    color: GREEN,
                    val: d.deposits,
                  },
                  {
                    title: "Withdrawals",
                    compact: cmp(d.withdrawals),
                    full: fmt(d.withdrawals),
                    color: RED,
                    val: d.withdrawals,
                  },
                  {
                    title: "Net Revenue",
                    compact: cmp(d.netRevenue),
                    full: fmt(d.netRevenue),
                    color: BLUE,
                    val: d.netRevenue,
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="relative flex flex-col items-center justify-between rounded-[22px] border p-5"
                    style={{
                      borderColor: BORDER,
                      background: "var(--surface-strong)",
                    }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: card.color }}
                      >
                        {card.title}
                      </span>
                      <Dot color={card.color} />
                    </div>
                    <div className="my-2 h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="68%"
                          outerRadius="95%"
                          barSize={14}
                          data={[{ value: card.val, fill: card.color }]}
                        >
                          <PolarGrid
                            gridType="circle"
                            stroke={BORDER}
                            strokeDasharray="3 3"
                          />
                          <RadialBar
                            dataKey="value"
                            cornerRadius={7}
                            fill={card.color}
                            background={{ fill: "var(--heading)" }}
                          />
                          <PolarRadiusAxis tick={false} axisLine={false}>
                            <Label
                              content={({ viewBox }: any) => {
                                if (!viewBox?.cx) return null;
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy - 7}
                                      fill={SLATE}
                                      fontSize={20}
                                      fontWeight={900}
                                    >
                                      {card.compact}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy + 14}
                                      fill={MUTED}
                                      fontSize={10}
                                      fontWeight={700}
                                    >
                                      TOTAL
                                    </tspan>
                                  </text>
                                );
                              }}
                            />
                          </PolarRadiusAxis>
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                    <div
                      className="w-full rounded-xl border py-2 text-center text-xs font-bold"
                      style={{
                        borderColor: BORDER,
                        color: SLATE,
                        background: CREAM,
                      }}
                    >
                      {card.full}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SIGNAL STRIP ══════════════════════════════════════════ */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Signal
          label="Net Capital Flow"
          value={fmt(netFlow)}
          sub="Deposits minus Withdrawals"
        />
        <Signal
          label="IB Commissions"
          value={fmt(d.ibCommission)}
          sub="Paid out to partners"
        />
        <Signal
          label="IB Trade Volume"
          value={`${lots(d.ibTradingVolume)} Lots`}
          sub="Partner-driven volume"
        />
        <Signal
          label="Active Partners"
          value={String(d.activeIBPartners)}
          sub="Contributing IBs"
        />
      </div>
    </div>
  );
};

export default RevenueAnalytics;
