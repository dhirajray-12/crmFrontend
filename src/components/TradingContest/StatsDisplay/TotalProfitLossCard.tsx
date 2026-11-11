import { Award } from "lucide-react";
import { formatProfit } from "@/utils/TradingContest.Helper";

interface TotalProfitLossCardProps {
  value: number;
}

export const TotalProfitLossCard = ({ value }: TotalProfitLossCardProps) => {
  const isPositive = value >= 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div
        className={`absolute inset-y-0 left-0 w-1 ${isPositive ? "bg-emerald-400/70" : "bg-rose-400/70"}`}
      />
      <div className="flex items-center justify-between gap-2 pl-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
          Total P&amp;L
        </span>
        <Award className={`h-4 w-4 ${isPositive ? "text-amber-700 dark:text-amber-300" : "text-rose-700 dark:text-rose-300"}`} />
      </div>
      <p
        className={`mt-3 truncate pl-2 text-2xl font-bold sm:text-[28px] ${isPositive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}
      >
        {formatProfit(value)}
      </p>
    </div>
  );
};
