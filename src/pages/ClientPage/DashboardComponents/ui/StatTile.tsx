import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Panel } from "./Panel";

export interface Trend {
  label: string;
  direction: "up" | "down" | "flat";
}

export function TrendBadge({ trend, className }: { trend: Trend; className?: string }) {
  if (trend.direction === "flat") {
    return <span className={cn("text-xs text-subtle", className)}>{trend.label}</span>;
  }

  const isUp = trend.direction === "up";
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-mono text-xs font-semibold tabular-nums",
        isUp ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {trend.label}
    </span>
  );
}

const iconToneClasses: Record<string, string> = {
  sky: "bg-accent/10 text-accent",
  emerald: "bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
  rose: "bg-rose-400/10 text-rose-700 dark:text-rose-300",
  amber: "bg-amber-400/10 text-amber-700 dark:text-amber-300",
  neutral: "bg-surface-strong/[0.06] text-subtle",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  iconTone?: keyof typeof iconToneClasses;
  trend?: Trend;
  trendNote?: string;
  className?: string;
}

/** Standalone stat card in its own panel — used for KPI rows. */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconTone = "sky",
  trend,
  trendNote,
  className,
}: StatCardProps) {
  return (
    <Panel className={cn("flex flex-col justify-between gap-4 p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">{label}</p>
          <p className="mt-3 truncate font-mono text-2xl font-semibold tracking-tight text-heading tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              iconToneClasses[iconTone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      {(trend || trendNote) && (
        <div className="flex items-center gap-2">
          {trend && <TrendBadge trend={trend} />}
          {trendNote && <span className="text-[11px] text-subtle">{trendNote}</span>}
        </div>
      )}
    </Panel>
  );
}

interface StatCellProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "negative";
  trend?: Trend;
  className?: string;
}

/** A single cell inside a StatRow — shares hairline dividers with its siblings. */
export function StatCell({ label, value, icon: Icon, tone = "default", trend, className }: StatCellProps) {
  return (
    <div className={cn("bg-surface-strong p-4", className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <p
        className={cn(
          "mt-2 font-mono text-lg font-semibold tabular-nums",
          tone === "positive" && "text-emerald-700 dark:text-emerald-400",
          tone === "negative" && "text-rose-700 dark:text-rose-400",
          tone === "default" && "text-heading",
        )}
      >
        {value}
      </p>
      {trend && <TrendBadge trend={trend} className="mt-1" />}
    </div>
  );
}

interface StatRowProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

/** A hairline-divided grid of StatCells, 2-up on mobile expanding to `columns`-up above sm. */
export function StatRow({ children, columns = 4, className }: StatRowProps) {
  const colsClass =
    columns === 2 ? "sm:grid-cols-2" : columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-surface-strong/10",
        colsClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
