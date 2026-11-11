import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import type { ApexOptions } from "apexcharts";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  CandlestickChart,
  RefreshCw,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useAccountActivityStore } from "@/Store/accountActivityStore";
import { useAccountActivityData } from "@/hooks/useAccountActivityData";
import { useIsMobileViewport } from "@/hooks/useIsMobileViewport";
import { timeOptions } from "@/types/accountActivity.types";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";
import { Toolbar, ToolbarButton } from "./ui/Toolbar";
import { Pill } from "./ui/Pill";
import { MobileActivityCanvas } from "./MobileActivityCanvas";
import {
  COLORS,
  formatCompactNumber,
  formatCurrency,
  formatLongDate,
  formatNumber,
  formatPercentChange,
  formatShortDate,
  getChange,
  statTone,
  sumBy,
  trendDirection,
  type ChartType,
} from "./accountActivityChart.utils";

const AccountActivityApexChart = lazy(() => import("./AccountActivityApexChart"));

const chartTypeOptions: Array<{
  type: ChartType;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    type: "bar",
    label: "Volume",
    description: "Day-by-day deposit and withdrawal weight",
    icon: BarChart3,
  },
  {
    type: "area",
    label: "Flow",
    description: "Momentum view with softer movement",
    icon: TrendingUp,
  },
  {
    type: "line",
    label: "Mixed Pulse",
    description: "Bars for cash flow with a live transaction line",
    icon: CandlestickChart,
  },
];

const buildTrend = (change: number) => ({
  label: formatPercentChange(change),
  direction: trendDirection(change),
});

const AccountActivityChart = () => {
  const { timePeriod, chartType, setTimePeriod, setChartType, setDropdownOpen } =
    useAccountActivityStore();
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const isMobile = useIsMobileViewport();

  const { data, isLoading, error, refetch } = useAccountActivityData(timePeriod);

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  const handleRefresh = () => {
    void refetch();
  };

  const totals = useMemo(() => {
    const rows = data ?? [];
    const deposits = sumBy(rows, "deposit");
    const withdrawals = sumBy(rows, "withdrawal");
    const transactions = sumBy(rows, "transactions");

    return {
      deposits,
      withdrawals,
      transactions,
      netFlow: deposits - withdrawals,
    };
  }, [data]);

  const changes = useMemo(() => {
    const rows = data ?? [];

    if (rows.length === 0) {
      return { deposits: 0, withdrawals: 0, transactions: 0, netFlow: 0 };
    }

    const splitIndex = Math.max(1, Math.floor(rows.length / 2));
    const previousRows = rows.slice(0, rows.length - splitIndex);
    const currentRows = rows.slice(rows.length - splitIndex);

    const currentDeposits = sumBy(currentRows, "deposit");
    const previousDeposits = sumBy(previousRows, "deposit");
    const currentWithdrawals = sumBy(currentRows, "withdrawal");
    const previousWithdrawals = sumBy(previousRows, "withdrawal");
    const currentTransactions = sumBy(currentRows, "transactions");
    const previousTransactions = sumBy(previousRows, "transactions");
    const currentNetFlow = currentDeposits - currentWithdrawals;
    const previousNetFlow = previousDeposits - previousWithdrawals;

    return {
      deposits: getChange(currentDeposits, previousDeposits),
      withdrawals: getChange(currentWithdrawals, previousWithdrawals),
      transactions: getChange(currentTransactions, previousTransactions),
      netFlow: getChange(currentNetFlow, previousNetFlow),
    };
  }, [data]);

  const headlineStats = useMemo(() => {
    const rows = data ?? [];

    if (rows.length === 0) {
      return {
        averageFlow: 0,
        averageTransactions: 0,
        peakDayLabel: "No data",
        peakDayValue: 0,
        strongestFlowLabel: "No data",
        strongestFlowValue: 0,
      };
    }

    const peakVolumeDay = rows.reduce((best, current) => {
      const bestVolume = best.deposit + best.withdrawal + best.transactions * 100;
      const currentVolume = current.deposit + current.withdrawal + current.transactions * 100;

      return currentVolume > bestVolume ? current : best;
    });

    const strongestFlowDay = rows.reduce((best, current) => {
      const bestFlow = Math.abs(best.deposit - best.withdrawal);
      const currentFlow = Math.abs(current.deposit - current.withdrawal);

      return currentFlow > bestFlow ? current : best;
    });

    return {
      averageFlow: totals.netFlow / rows.length,
      averageTransactions: totals.transactions / rows.length,
      peakDayLabel: formatShortDate(peakVolumeDay.date),
      peakDayValue:
        peakVolumeDay.deposit + peakVolumeDay.withdrawal + peakVolumeDay.transactions * 100,
      strongestFlowLabel: formatShortDate(strongestFlowDay.date),
      strongestFlowValue: strongestFlowDay.deposit - strongestFlowDay.withdrawal,
    };
  }, [data, totals.netFlow, totals.transactions]);

  const apexSeries = useMemo(() => {
    const rows = data ?? [];

    if (chartType === "line") {
      return [
        { name: "Deposits", type: "bar" as const, data: rows.map((item) => item.deposit) },
        { name: "Withdrawals", type: "bar" as const, data: rows.map((item) => item.withdrawal) },
        {
          name: "Transactions",
          type: "line" as const,
          data: rows.map((item) => item.transactions),
        },
      ];
    }

    if (chartType === "bar") {
      return [
        { name: "Deposits", type: "bar" as const, data: rows.map((item) => item.deposit) },
        { name: "Withdrawals", type: "bar" as const, data: rows.map((item) => item.withdrawal) },
        {
          name: "Transactions",
          type: "bar" as const,
          data: rows.map((item) => item.transactions),
        },
      ];
    }

    return [
      { name: "Deposits", type: "area" as const, data: rows.map((item) => item.deposit) },
      { name: "Withdrawals", type: "area" as const, data: rows.map((item) => item.withdrawal) },
      {
        name: "Transactions",
        type: "line" as const,
        data: rows.map((item) => item.transactions),
      },
    ];
  }, [chartType, data]);

  const chartOptionsMemo = useMemo<ApexOptions>(() => {
    const rows = data ?? [];
    const categories = rows.map((item) => formatShortDate(item.date));
    const mixedMode = chartType === "line";
    const allBars = chartType === "bar";
    const mobile = isMobile;

    return {
      chart: {
        type: mixedMode ? "line" : chartType,
        background: "transparent",
        fontFamily: "inherit",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: {
          enabled: true,
          speed: 480,
          animateGradually: { enabled: true, delay: 80 },
          dynamicAnimation: { enabled: true, speed: 320 },
        },
        foreColor: "#94a3b8",
      },
      colors: [COLORS.deposit, COLORS.withdrawal, COLORS.transactions],
      dataLabels: { enabled: false },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        floating: false,
        labels: { colors: "#cbd5e1" },
        markers: { size: 10, strokeWidth: 0 },
        itemMargin: { horizontal: 14, vertical: 2 },
      },
      grid: {
        borderColor: "rgba(148,163,184,0.14)",
        strokeDashArray: 5,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { left: 6, right: 4, top: 8, bottom: 0 },
      },
      stroke: {
        curve: mixedMode
          ? ["straight", "straight", "smooth"]
          : allBars
            ? "straight"
            : ["smooth", "smooth", "smooth"],
        width: mixedMode ? [0, 0, 4] : allBars ? 0 : [3, 3, 4],
        dashArray: [0, 0, 0],
        lineCap: "round",
      },
      fill: {
        type: mixedMode ? ["gradient", "gradient", "solid"] : allBars ? "solid" : ["gradient", "gradient", "solid"],
        gradient: {
          shade: "dark",
          type: "vertical",
          gradientToColors: [COLORS.depositSoft, COLORS.withdrawalSoft, COLORS.transactionsSoft],
          opacityFrom: allBars ? 0.85 : 0.32,
          opacityTo: allBars ? 0.85 : 0.02,
          stops: [0, 85, 100],
        },
      },
      markers: {
        size: 0,
        strokeWidth: 0,
        hover: { sizeOffset: 4 },
      },
      plotOptions: {
        bar: {
          columnWidth: mixedMode ? "42%" : "54%",
          borderRadius: 8,
          borderRadiusApplication: "end",
        },
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        crosshairs: {
          show: true,
          stroke: { color: "rgba(56,189,248,0.35)", width: 1, dashArray: 4 },
        },
        labels: {
          rotate: mobile ? 0 : -20,
          hideOverlappingLabels: true,
          trim: true,
          maxHeight: mobile ? 48 : 64,
          showDuplicates: false,
          style: { colors: "#94a3b8", fontSize: mobile ? "10px" : "11px" },
          formatter: (_: string, index?: number) => {
            if (typeof index !== "number") {
              return "";
            }

            return mobile && index % 2 === 1 ? "" : (categories[index] ?? "");
          },
        },
        tooltip: { enabled: false },
      },
      yaxis: [
        {
          seriesName: "Deposits",
          labels: {
            formatter: (value) =>
              value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value.toFixed(0),
            style: { colors: "#94a3b8", fontSize: "11px" },
          },
        },
        { seriesName: "Withdrawals", show: false },
        {
          opposite: true,
          seriesName: "Transactions",
          labels: {
            formatter: (value) => value.toFixed(0),
            style: { colors: "#94a3b8", fontSize: "11px" },
          },
        },
      ],
      tooltip: {
        shared: true,
        intersect: false,
        theme: "dark",
        custom: ({ dataPointIndex }) => {
          const point = rows[dataPointIndex];

          if (!point) {
            return "";
          }

          return `
            <div style="min-width:200px;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:rgba(2,6,23,0.96);padding:12px;">
              <div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(148,163,184,0.14);color:#f8fafc;font-size:12px;font-weight:600;">
                ${formatLongDate(point.date)}
              </div>
              <div style="display:grid;gap:6px;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <span style="display:inline-flex;align-items:center;gap:6px;color:#cbd5e1;font-size:11px;">
                    <span style="width:8px;height:8px;border-radius:999px;background:${COLORS.deposit};display:inline-block;"></span>
                    Deposits
                  </span>
                  <span style="color:#fff;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;">${formatCurrency(point.deposit)}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <span style="display:inline-flex;align-items:center;gap:6px;color:#cbd5e1;font-size:11px;">
                    <span style="width:8px;height:8px;border-radius:999px;background:${COLORS.withdrawal};display:inline-block;"></span>
                    Withdrawals
                  </span>
                  <span style="color:#fff;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;">${formatCurrency(point.withdrawal)}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                  <span style="display:inline-flex;align-items:center;gap:6px;color:#cbd5e1;font-size:11px;">
                    <span style="width:8px;height:8px;border-radius:999px;background:${COLORS.transactions};display:inline-block;"></span>
                    Transactions
                  </span>
                  <span style="color:#fff;font-size:12px;font-weight:600;font-variant-numeric:tabular-nums;">${formatNumber(point.transactions)}</span>
                </div>
              </div>
            </div>
          `;
        },
      },
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: { height: 300 },
            legend: { show: false },
            plotOptions: {
              bar: { columnWidth: mixedMode ? "62%" : "72%", borderRadius: 6 },
            },
            grid: { padding: { left: -2, right: 0, top: 8, bottom: 0 } },
            xaxis: {
              labels: {
                show: false,
                rotate: 0,
                maxHeight: 0,
                style: { fontSize: "9px" },
                formatter: (_: string, index?: number) => {
                  if (typeof index !== "number") {
                    return "";
                  }

                  return index % 3 === 0 ? (categories[index] ?? "") : "";
                },
              },
            },
            yaxis: [
              {
                labels: {
                  show: true,
                  formatter: (value: number) =>
                    value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : value.toFixed(0),
                  style: { colors: "#64748b", fontSize: "10px" },
                },
              },
              { show: false },
              { show: false },
            ],
          },
        },
        {
          breakpoint: 768,
          options: {
            legend: { position: "bottom", horizontalAlign: "center" },
          },
        },
      ],
      states: {
        hover: { filter: { type: "lighten", value: 0.2 } },
        active: { allowMultipleDataPointsSelection: false, filter: { type: "none" } },
      },
    };
  }, [chartType, data, isMobile]);

  const activeChartOption =
    chartTypeOptions.find((option) => option.type === chartType) ?? chartTypeOptions[0];

  return (
    <Panel>
      <SectionHeader
        eyebrow="Cashflow"
        icon={Activity}
        title="Account activity"
        description={`Deposits, withdrawals, and transactions over the last ${timePeriod} days · Updated ${lastUpdated.toLocaleTimeString(
          [],
          { hour: "2-digit", minute: "2-digit", timeZone: getConfiguredTimezone() },
        )}`}
        action={
          <>
            <Pill tone={isLoading ? "amber" : data?.length ? "sky" : "neutral"} dot>
              {isLoading ? "Syncing" : data?.length ? "Live" : "Idle"}
            </Pill>
            <ToolbarButton onClick={handleRefresh} disabled={isLoading} className="inline-flex items-center gap-1.5">
              <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
              Refresh
            </ToolbarButton>
          </>
        }
      />

      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <Toolbar>
          {timeOptions.map((option) => (
            <ToolbarButton
              key={option}
              active={timePeriod === option}
              onClick={() => {
                setTimePeriod(option);
                setDropdownOpen(false);
              }}
            >
              {option}D
            </ToolbarButton>
          ))}
        </Toolbar>

        <Toolbar>
          {chartTypeOptions.map(({ type, label, icon: Icon }) => (
            <ToolbarButton
              key={type}
              active={chartType === type}
              onClick={() => setChartType(type)}
              className="inline-flex items-center gap-1.5"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </ToolbarButton>
          ))}
        </Toolbar>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <StatRow columns={4}>
          <StatCell
            label="Deposits"
            value={formatCurrency(totals.deposits)}
            icon={ArrowDownLeft}
            trend={buildTrend(changes.deposits)}
          />
          <StatCell
            label="Withdrawals"
            value={formatCurrency(totals.withdrawals)}
            icon={ArrowUpRight}
            trend={buildTrend(changes.withdrawals)}
          />
          <StatCell
            label="Transactions"
            value={formatNumber(totals.transactions)}
            icon={BarChart3}
            trend={buildTrend(changes.transactions)}
          />
          <StatCell
            label="Net Flow"
            value={formatCurrency(totals.netFlow)}
            icon={TrendingUp}
            tone={statTone(totals.netFlow)}
            trend={buildTrend(changes.netFlow)}
          />
        </StatRow>

        <StatRow columns={4}>
          <StatCell label="Peak session" value={headlineStats.peakDayLabel} icon={Sparkles} />
          <StatCell
            label="Strongest net move"
            value={formatCurrency(headlineStats.strongestFlowValue)}
            icon={TrendingUp}
            tone={statTone(headlineStats.strongestFlowValue)}
          />
          <StatCell
            label="Avg daily flow"
            value={formatCurrency(headlineStats.averageFlow)}
            icon={Activity}
            tone={statTone(headlineStats.averageFlow)}
          />
          <StatCell
            label="Avg daily activity"
            value={formatCompactNumber(headlineStats.averageTransactions)}
            icon={BarChart3}
          />
        </StatRow>

        <div className="rounded-xl border border-border bg-surface p-2 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm font-semibold text-heading">{activeChartOption.label}</p>
            <p className="text-xs text-subtle">{activeChartOption.description}</p>
          </div>

          {isLoading ? (
            <div className="flex h-[20rem] items-center justify-center sm:h-[24rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2 text-xs text-accent">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading activity data
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[20rem] items-center justify-center sm:h-[24rem]">
              <div className="max-w-sm rounded-xl border border-rose-400/20 bg-rose-500/[0.08] p-4 text-center">
                <p className="text-sm font-semibold text-rose-100">Failed to load activity data</p>
                <p className="mt-2 text-xs text-rose-700 dark:text-rose-200/80">
                  {error instanceof Error ? error.message : "Unexpected error"}
                </p>
                <button
                  onClick={handleRefresh}
                  className="mt-4 rounded-xl border border-rose-300/30 bg-rose-500/[0.14] px-4 py-2 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/[0.22]"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="flex h-[20rem] items-center justify-center sm:h-[24rem]">
              <div className="max-w-md rounded-xl border border-dashed border-border bg-surface-strong/[0.03] p-6 text-center text-subtle">
                <p className="text-sm font-semibold text-heading">No chart data yet</p>
                <p className="mt-2 text-xs text-subtle">
                  Once approved deposits or withdrawals are available, this chart will render
                  daily activity automatically.
                </p>
              </div>
            </div>
          ) : isMobile ? (
            <MobileActivityCanvas rows={data} chartType={chartType} />
          ) : (
            <div className="h-[24rem]">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-2 text-sm text-accent">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Rendering chart
                    </div>
                  </div>
                }
              >
                <AccountActivityApexChart chartType={chartType} series={apexSeries} options={chartOptionsMemo} />
              </Suspense>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};

export default AccountActivityChart;
