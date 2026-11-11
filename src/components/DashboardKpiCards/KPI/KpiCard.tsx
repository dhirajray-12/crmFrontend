import React from "react";
import { ArrowDownLeft, ArrowUpRight, Layers3, TrendingDown, TrendingUp, Wallet2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAnimatedValue } from "@/hooks/useAnimatedValue";
import type { KpiCardProps } from "@/types/dashboard.types";
import { Panel } from "@/pages/ClientPage/DashboardComponents/ui/Panel";
import { cn } from "@/lib/utils";

const ICONS_BY_TITLE: Record<string, LucideIcon> = {
  "total deposits": ArrowDownLeft,
  "total balance": Wallet2,
  "total withdrawals": ArrowUpRight,
  "mt5 accounts": Layers3,
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  trendPositive = true,
  accentColor,
}) => {
  const displayValue = useAnimatedValue(value);
  const anchorKey = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const Icon = ICONS_BY_TITLE[title.toLowerCase()] ?? Wallet2;
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown;

  return (
    <Panel
      className="flex flex-col justify-between gap-4 p-4"
      data-tour-anchor={`dashboard-${anchorKey}`}
      data-voice-target={title}
      data-voice-scope={`dashboard ${title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">{title}</p>
          <p className="mt-3 truncate font-mono text-2xl font-semibold tracking-tight text-heading tabular-nums sm:text-[1.65rem]">
            {displayValue}
          </p>
        </div>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accentColor}1f`, color: accentColor }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {trend && (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-xs font-semibold tabular-nums",
            trendPositive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
          )}
        >
          <TrendIcon className="h-3 w-3" />
          <span className="truncate">{trend}</span>
        </span>
      )}
    </Panel>
  );
};
