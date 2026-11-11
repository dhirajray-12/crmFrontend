import axios from "axios";
import type {
  Partner,
  CommissionSummary,
  TodayCommissionSummary,
  Trade,
  TradeCommissionsResponse,
  PartnersResponse,
  SummaryResponse,
  TodaySummaryResponse,
  PartnerTradeCommissionsResponse,
  CommissionStats,
  AccountTradeSummary,
} from "@/types/commissionPage.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

class CommissionService {
  // Normalize trades from API response
  normalizeTrades(trades: any[]): Trade[] {
    return trades.map(
      (t): Trade => ({
        acNo: t.acNo || t.clientMT5Account || "",
        symbol: t.symbol || "",
        volume: Number(t.volume || 0),
        profit: Number(t.profit || 0),
        rebate: Number(t.rebate ?? t.commissionAmount ?? t.commission ?? 0),
        status: t.status || "confirmed",
        level: Number(t.level || 1),
        openTime: t.openTime || "",
        closeTime: t.closeTime || "",
        openPrice: String(t.openPrice || "0"),
        closePrice: String(t.closePrice || "0"),
      }),
    );
  }

  normalizeAccountSummaries(accountSummaries: any[] = []): AccountTradeSummary[] {
    return accountSummaries.map((summary) => ({
      acNo: String(summary.acNo || summary.clientMT5Account || summary._id || ""),
      accountType: summary.accountType || "",
      totalProfit: Number(summary.totalProfit || 0),
      totalVolume: Number(summary.totalVolume || 0),
      totalRebate: Number(summary.totalRebate || 0),
      totalTrades: Number(summary.totalTrades || 0),
    }));
  }

  // Fetch all partners
  async fetchPartners(): Promise<Partner[]> {
    try {
      const response = await axios.get<PartnersResponse>(
        `${API_BASE_URL}/ibclients/commission/partners`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch partners");
      }

      return response.data.partners || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Fetch commission summary
  async fetchSummary(period: number = 30): Promise<CommissionSummary> {
    try {
      const response = await axios.get<SummaryResponse>(
        `${API_BASE_URL}/ibclients/commission/summary?period=${period}`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch summary");
      }

      return (
        response.data.summary || {
          totalCommission: 0,
          totalTrades: 0,
          totalVolume: 0,
          totalProfit: 0,
          avgCommissionPerTrade: 0,
          period,
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching summary:", error.message);
      }
      // Return default summary on error
      return {
        totalCommission: 0,
        totalTrades: 0,
        totalVolume: 0,
        totalProfit: 0,
        avgCommissionPerTrade: 0,
        period,
      };
    }
  }

  // Fetch today's commission summary
  async fetchTodaySummary(): Promise<TodayCommissionSummary> {
    const defaultSummary: TodayCommissionSummary = {
      totalCommission: 0,
      totalTrades: 0,
      totalVolume: 0,
      totalProfit: 0,
      avgCommissionPerTrade: 0,
    };

    try {
      const response = await axios.get<TodaySummaryResponse>(
        `${API_BASE_URL}/ibclients/commission/summary/today`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch today's summary",
        );
      }

      return response.data.summary || defaultSummary;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching today's summary:", error.message);
      }
      return defaultSummary;
    }
  }

  // Fetch trade commissions
  async fetchTradeCommissions(): Promise<TradeCommissionsResponse> {
    try {
      const response = await axios.get<any>(
        `${API_BASE_URL}/ibclients/commission/trade-commissions`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch trade commissions",
        );
      }

      const normalizedTrades = this.normalizeTrades(response.data.trades || []);
      const totals = normalizedTrades.reduce(
        (acc, t) => {
          acc.totalRebate += t.rebate;
          acc.totalVolume += t.volume;
          acc.totalProfit += t.profit;
          return acc;
        },
        { totalRebate: 0, totalVolume: 0, totalProfit: 0 },
      );

      return {
        success: true,
        trades: normalizedTrades,
        totals,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Fetch partner trades
  async fetchPartnerTrades(
    partnerId: string | null,
  ): Promise<PartnerTradeCommissionsResponse> {
    try {
      const response = await axios.get<PartnerTradeCommissionsResponse>(
        `${API_BASE_URL}/ibclients/commission/partner/${partnerId}`,
        {
          headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
          withCredentials: true,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to fetch partner trades",
        );
      }

      const normalizedTrades = this.normalizeTrades(response.data.trades || []);
      const normalizedAccountSummaries = this.normalizeAccountSummaries(
        response.data.accountSummaries || [],
      );

      const totals = normalizedTrades.reduce(
        (acc, t) => {
          acc.totalRebate += t.rebate;
          acc.totalVolume += t.volume;
          acc.totalProfit += t.profit;
          return acc;
        },
        { totalRebate: 0, totalVolume: 0, totalProfit: 0 },
      );

      return {
        ...response.data,
        trades: normalizedTrades,
        accountSummaries: normalizedAccountSummaries,
        totals,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  }

  // Calculate stats from data
  calculateStats(
    partners: Partner[],
    tradeCommissions: TradeCommissionsResponse | null,
    summary: CommissionSummary | null,
    todaySummary: TodayCommissionSummary | null = null,
  ): CommissionStats {
    return {
      totalCommission: tradeCommissions?.totals?.totalRebate ?? 0,
      totalVolume: tradeCommissions?.totals?.totalVolume ?? 0,
      activePartners: partners.filter((p) => p.totalTrades > 0).length,
      avgPerTrade: tradeCommissions?.trades?.length
        ? (tradeCommissions.totals?.totalRebate ?? 0) /
          tradeCommissions.trades.length
        : 0,
      monthlyCommission: summary?.totalCommission ?? 0,
      pendingCommission: 0,
      todayCommission: todaySummary?.totalCommission ?? 0,
    };
  }
}

export const commissionService = new CommissionService();
