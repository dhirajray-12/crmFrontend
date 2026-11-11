import type { TradeStats } from "@/types/TradingContest.types";
import { StatCard } from "./StatCard";
import { TotalProfitLossCard } from "./TotalProfitLossCard";

interface StatsDisplayProps {
  stats: TradeStats;
}

export const StatsDisplay = ({ stats }: StatsDisplayProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        label="Total Trades"
        value={stats.totalTrades}
        icon="TrendingUp"
        accentColor="bg-accent/70"
        iconColor="text-accent"
      />

      <StatCard
        label="Open Positions"
        value={stats.openTrades}
        icon="DollarSign"
        accentColor="bg-amber-400/70"
        iconColor="text-amber-700 dark:text-amber-300"
      />

      <StatCard
        label="Profitable"
        value={stats.profitableTrades}
        icon="TrendingUp"
        accentColor="bg-emerald-400/70"
        iconColor="text-emerald-700 dark:text-emerald-300"
        valueColor="text-emerald-700 dark:text-emerald-300"
      />

      <StatCard
        label="Loss Trades"
        value={stats.lossTrades}
        icon="TrendingDown"
        accentColor="bg-rose-400/70"
        iconColor="text-rose-700 dark:text-rose-300"
        valueColor="text-rose-700 dark:text-rose-300"
      />

      <div className="col-span-2 sm:col-span-1">
        <TotalProfitLossCard value={stats.totalProfitLoss} />
      </div>
    </div>
  );
};
