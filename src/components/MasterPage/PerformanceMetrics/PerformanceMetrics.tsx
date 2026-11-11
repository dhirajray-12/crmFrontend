import { BarChart3, RefreshCw, Target, TrendingUp, Zap } from "lucide-react";
import type { MasterSummary } from "@/types/MasterPage.type";
import { formatPercentage } from "@/utils/MasterPage.helper";

interface PerformanceMetricsProps {
  summary: MasterSummary;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const PerformanceMetrics = ({
  summary,
  isRefreshing,
  onRefresh,
}: PerformanceMetricsProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-violet-700 dark:text-violet-300" />
          <h3 className="text-sm font-semibold text-heading">
            Performance Overview
          </h3>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-lg border border-border bg-surface-strong/[0.04] p-2 transition-colors hover:bg-surface-strong/[0.08]"
        >
          <RefreshCw
            className={`h-4 w-4 text-subtle ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface-strong/[0.03] p-4">
          <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
          <div className="pl-2">
            <div className="mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
              <p className="text-sm text-subtle">Avg Performance</p>
            </div>
            <p className="text-2xl font-bold text-heading">
              {formatPercentage(summary.avgPerformance)}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
              <TrendingUp className="h-3 w-3" />
              +5.2% from last month
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-surface-strong/[0.03] p-4">
          <div className="absolute inset-y-0 left-0 w-1 bg-amber-400" />
          <div className="pl-2">
            <div className="mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-700 dark:text-amber-300" />
              <p className="text-sm text-subtle">Growth Rate</p>
            </div>
            <p className="text-2xl font-bold text-heading">
              {formatPercentage(summary.monthlyGrowth)}
            </p>
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Monthly increase</p>
          </div>
        </div>
      </div>
    </div>
  );
};
