import CopyTradingService from "@/services/copyTrading.service";
import type { Master, Stats, Trade } from "@/types/copyTrading.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMastersAndCopiers = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["mastersAndCopiers"],
    queryFn: async () => {
      const service = new CopyTradingService();
      const response = await service.getMastersAndCopiers();

      if (response.success && response.data) {
        const transformedMasters = transformMastersData(response.data);

        // Calculate and cache stats
        const stats = calculateStats(transformedMasters);
        queryClient.setQueryData(["copyTradingStats"], stats);

        return transformedMasters;
      }
      return [];
    },
    enabled: true,
  });
};

export const useCopyTradingStats = () => {
  return useQuery({
    queryKey: ["copyTradingStats"],
    queryFn: async () => {
      // This will be populated by the masters query
      return {
        totalCopiers: 0,
        totalInvestment: 0,
        totalProfit: 0,
        commissionPaid: 0,
      };
    },
    enabled: false, // This query is only used to access cached data
  });
};

export const useTradeHistory = (copierAccounts: number[], enabled: boolean) => {
  return useQuery({
    queryKey: ["tradeHistory", copierAccounts],
    queryFn: async () => {
      const service = new CopyTradingService();
      const response = await service.getTradeHistory(copierAccounts, 1, 100);

      if (response.success && response.data) {
        return transformTradesData(response.data);
      }
      return { masterTrades: [], copierTrades: [] };
    },
    enabled: enabled && copierAccounts.length > 0,
  });
};

export const useUnlinkCopier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ mt5Account }: { mt5Account: string }) => {
      const service = new CopyTradingService();

      // Check for open trades first
      const checkResponse = await service.checkOpenTrades([
        parseInt(mt5Account),
      ]);

      if (checkResponse.data?.hasOpenTrades) {
        throw new Error(
          `Cannot unlink: This account has ${checkResponse.data.openTradesCount} open trade(s). Please close all trades first.`,
        );
      }

      return service.unlinkCopier(mt5Account);
    },
    onSuccess: () => {
      // Invalidate and refetch masters data
      queryClient.invalidateQueries({ queryKey: ["mastersAndCopiers"] });
      queryClient.invalidateQueries({ queryKey: ["copyTradingStats"] });
    },
  });
};

// Helper functions
const transformMastersData = (data: any[]): Master[] => {
  return data.map((master, index) => {
    const copiers = (master.copiers || []).map(
      (copier: any, copierIndex: number) => ({
        id: copierIndex + 1,
        account: String(copier.login),
        balance: Number(copier.balance ?? 0),
        equity: Number(copier.equity ?? 0),
        profit: Number(copier.totalProfit ?? 0),
        commissionPaid: Number(copier.totalMasterCommission ?? 0),
        joinedDate: copier.created_at ?? "N/A",
      }),
    );

    return {
      id: index + 1,
      name: master.name,
      account: String(master.login),
      commission: Number(master.commission ?? 0),
      profit: Number(master.total_profit ?? 0),
      started: master.created_at ?? "N/A",
      commissionPaid: Number(master.total_commission ?? 0),
      noCopiers: master.copiers_count ?? copiers.length,
      copiers,
    };
  });
};

const transformTradesData = (
  data: any,
): { masterTrades: Trade[]; copierTrades: Trade[] } => {
  if (!data.trades) return { masterTrades: [], copierTrades: [] };

  const masterTrades: Trade[] = [];
  const copierTrades: Trade[] = [];

  data.trades.forEach((trade: any) => {
    trade.associated_trades.forEach((assocTrade: any, index: number) => {
      const tradeItem: Trade = {
        id: parseInt(`${trade.master_login}${assocTrade.MT5Account}${index}`),
        symbol: trade.Symbol,
        type: trade.CMD === 0 ? "BUY" : "SELL",
        volume: assocTrade.Volume,
        openPrice: assocTrade.Open_Price,
        currentPrice: assocTrade.Close_Price || assocTrade.Open_Price,
        profit: assocTrade.Profit,
        openTime: new Date(assocTrade.Open_Time).toLocaleString(),
      };

      masterTrades.push(tradeItem);
      copierTrades.push(tradeItem);
    });
  });

  return { masterTrades, copierTrades };
};

const calculateStats = (masters: Master[]): Stats => {
  const totalCopiers = masters.reduce((sum, m) => sum + m.noCopiers, 0);
  const totalInvestment = masters.reduce(
    (sum, m) => sum + m.copiers.reduce((s, c) => s + c.balance, 0),
    0,
  );
  const totalProfit = masters.reduce((sum, m) => sum + m.profit, 0);
  const commissionPaid = masters.reduce((sum, m) => sum + m.commissionPaid, 0);

  return {
    totalCopiers,
    totalInvestment,
    totalProfit,
    commissionPaid,
  };
};
