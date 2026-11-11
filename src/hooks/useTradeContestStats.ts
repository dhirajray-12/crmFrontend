import type { Trade } from "@/types/TradingContest.types";
import { calculateTradeStats } from "@/utils/TradingContest.Helper";
import { useMemo } from "react";

export const useTradeStats = (trades: Trade[]) => {
  const stats = useMemo(() => calculateTradeStats(trades), [trades]);

  return stats;
};
