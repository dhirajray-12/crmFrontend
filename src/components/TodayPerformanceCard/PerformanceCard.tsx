import { ArrowDownCircle, ArrowUpCircle, Repeat, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PerformanceData } from "@/types/performance.types";
import { Panel } from "@/pages/ClientPage/DashboardComponents/ui/Panel";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  item: PerformanceData;
  maxRawValue: number;
}

const ICON_MAP: Record<PerformanceData["icon"], LucideIcon> = {
  ArrowUpCircle,
  ArrowDownCircle,
  Repeat,
  Wallet,
};

const COLOR_CLASSES: Record<string, { icon: string; bar: string }> = {
  emerald: { icon: "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-400" },
  orange: { icon: "bg-amber-400/10 text-amber-700 dark:text-amber-300", bar: "bg-amber-400" },
  blue: { icon: "bg-accent/10 text-accent", bar: "bg-accent" },
  purple: { icon: "bg-violet-400/10 text-violet-700 dark:text-violet-300", bar: "bg-violet-400" },
};

export const PerformanceCard = ({ item, maxRawValue }: PerformanceCardProps) => {
  const Icon = ICON_MAP[item.icon] || Repeat;
  const safeTrend = item.trend || "0%";
  const isPositiveTrend = !safeTrend.startsWith("-");
  const progressPercentage = Math.min(
    (Math.abs(Number(item.rawValue) || 0) / maxRawValue) * 100,
    100,
  );
  const colors = COLOR_CLASSES[item.color] ?? COLOR_CLASSES.blue;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">{item.label}</p>
          <p className="mt-2 truncate font-mono text-xl font-semibold tabular-nums text-heading">
            {item.value}
          </p>
        </div>
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", colors.icon)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-strong/[0.07]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", colors.bar)}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <TrendIcon
          className={cn("h-3 w-3", isPositiveTrend ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}
        />
        <span
          className={cn(
            "font-mono text-xs font-semibold tabular-nums",
            isPositiveTrend ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
          )}
        >
          {safeTrend}
        </span>
      </div>
    </Panel>
  );
};
