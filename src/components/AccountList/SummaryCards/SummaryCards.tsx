import { motion } from "framer-motion";
import { Wallet, LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { SummaryCard } from "./SummaryCard";

interface SummaryCardsProps {
  totalBalance: number;
  totalEquity: number;
  totalProfitLoss: string;
}

export const SummaryCards = ({
  totalBalance,
  totalEquity,
  totalProfitLoss,
}: SummaryCardsProps) => {
  const isProfitPositive = totalProfitLoss?.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative z-10 mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-3"
    >
      <SummaryCard
        title="Total Balance"
        value={totalBalance}
        icon={<Wallet className="h-4 w-4" />}
        accentBar="bg-accent/70"
      />
      <SummaryCard
        title="Total Equity"
        value={totalEquity}
        icon={<LineChart className="h-4 w-4" />}
        accentBar="bg-violet-400/70"
      />
      <SummaryCard
        title="Total P&L"
        value={totalProfitLoss}
        icon={
          isProfitPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )
        }
        accentBar={isProfitPositive ? "bg-emerald-400/70" : "bg-rose-400/70"}
        valueClassName={isProfitPositive ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}
      />
    </motion.div>
  );
};
