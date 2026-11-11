import { TrendingDown, TrendingUp } from "lucide-react";
import { formatProfit } from "@/utils/TradingContest.Helper";

interface ProfitLossBadgeProps {
  profit: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-base px-3 py-1.5",
};

export const ProfitLossBadge = ({ profit, size = "md" }: ProfitLossBadgeProps) => {
  const isPositive = profit >= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border font-bold ${sizeClasses[size]} ${
        isPositive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
          : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {formatProfit(profit)}
    </span>
  );
};