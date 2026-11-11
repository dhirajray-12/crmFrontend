import type { TradingStatistics } from "@/types/forexCrypto.types";

interface TradingStatsProps {
  stats: TradingStatistics;
}

export const TradingStats: React.FC<TradingStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <StatCard
        label="Total Trades"
        value={stats.totalTrades}
        color="text-heading"
      />
      <StatCard
        label="Open Trades"
        value={stats.totalOpenTrades}
        color="text-blue-600"
      />
      <StatCard
        label="Closed Trades"
        value={stats.totalClosedTrades}
        color="text-body"
      />
      <StatCard
        label="Total P/L"
        value={`$${stats.totalProfit?.toFixed(2)}`}
        color={stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className="bg-surface-strong/50 rounded-lg p-3 sm:p-4 border border-white/40">
    <div className="text-xs sm:text-sm text-body mb-1">{label}</div>
    <div className={`text-lg sm:text-xl md:text-2xl font-bold ${color}`}>
      {value}
    </div>
  </div>
);
