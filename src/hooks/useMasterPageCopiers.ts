import { useState } from "react";
import type { MasterAccount } from "@/types/MasterPage.type";

export const useCopiers = () => {
  const [expandedMaster, setExpandedMaster] = useState<string | null>(null);

  const toggleCopiers = (masterId: string) => {
    setExpandedMaster(expandedMaster === masterId ? null : masterId);
  };

  const getCopierStats = (master: MasterAccount) => {
    const totalCopiers = master.copiers.length;
    const activeCopiers = master.copiers.filter(c => c.status === "active").length;
    const totalProfit = master.copiers.reduce((sum, c) => sum + c.currentProfit, 0);
    const totalCommission = master.copiers.reduce(
      (sum, c) => sum + c.totalCommissionPaid,
      0
    );

    return {
      totalCopiers,
      activeCopiers,
      totalProfit,
      totalCommission,
    };
  };

  return {
    expandedMaster,
    toggleCopiers,
    getCopierStats,
  };
};