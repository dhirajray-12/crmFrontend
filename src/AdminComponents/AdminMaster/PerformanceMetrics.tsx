import { BarChart3, RefreshCw, Target, TrendingUp, Zap } from "lucide-react";
import type { MasterSummary } from "@/types/master.types";
import type { ComponentType } from "react";

interface PerformanceMetricsProps {
  summary: MasterSummary;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const MetricCard = ({
  icon: Icon,
  title,
  value,
  detail,
  accent,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  detail: string;
  accent: string;
}) => (
  <div className="min-w-0 rounded-[24px] border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-3 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 break-words text-[11px] font-semibold uppercase tracking-[0.2em] text-body">
        {title}
      </div>
    </div>
    <div className="break-words text-2xl font-semibold tracking-tight text-heading">
      {value}
    </div>
    <div className="mt-2 text-sm text-body">{detail}</div>
  </div>
);

export const PerformanceMetrics = ({
  summary,
  isRefreshing,
  onRefresh,
}: PerformanceMetricsProps) => (
  <div className="min-w-0 rounded-[26px] border border-border bg-surface-strong p-5 shadow-[0_18px_36px_rgba(102,76,36,0.10),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-body shadow-sm">
          <BarChart3 className="h-3.5 w-3.5" />
          Performance
        </div>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-heading">
          Growth & Payouts
        </h3>
        <p className="mt-1 text-sm text-subtle">
          Quality, growth, and profit at a glance.
        </p>
      </div>

      <button
        onClick={onRefresh}
        className="inline-flex w-full items-center justify-center gap-2 self-start rounded-2xl border border-border bg-surface-strong px-4 py-2.5 text-sm font-semibold text-body transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-strong sm:w-auto"
      >
        <RefreshCw
          className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
        Refresh metrics
      </button>
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      <MetricCard
        icon={Target}
        title="Avg Performance"
        value={`${summary.avgPerformance.toFixed(1)}%`}
        detail="Average across all strategies."
        accent="bg-[#deeee5] dark:bg-surface-strong text-[#3f6f53] dark:text-[#91caa9]"
      />
      <MetricCard
        icon={Zap}
        title="Monthly Growth"
        value={`${summary.monthlyGrowth}%`}
        detail="Monthly growth rate."
        accent="bg-surface-strong text-body"
      />
      <MetricCard
        icon={TrendingUp}
        title="Total Profit"
        value={`₹${summary.totalProfit.toLocaleString("en-IN")}`}
        detail="Total master profit."
        accent="bg-[#e6e2f2] dark:bg-surface-strong text-[#595281] dark:text-[#9991ca]"
      />
      <MetricCard
        icon={BarChart3}
        title="Commission Earned"
        value={`₹${summary.commissionEarned.toLocaleString("en-IN")}`}
        detail="Commission from copiers."
        accent="bg-[#dbe8f4] dark:bg-surface-strong text-[#355877] dark:text-[#8eafcd]"
      />
    </div>
  </div>
);
