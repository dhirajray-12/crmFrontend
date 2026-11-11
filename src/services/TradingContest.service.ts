import type {
  ApiResponse,
  TradeApiData,
  TradeCounts,
} from "@/types/TradingContest.types";
import { API_BASE_URL } from "@/utils/TradingContest.constant";

export const tradingApi = {
  fetchTrades: async (
    type: "open" | "closed",
    options?: {
      page?: number;
      limit?: number;
    },
  ): Promise<ApiResponse<TradeApiData>> => {
    const params = new URLSearchParams();

    if (type === "closed") {
      if (options?.page) {
        params.set("page", options.page.toString());
      }

      if (options?.limit) {
        params.set("limit", options.limit.toString());
      }
    }

    const queryString = params.toString();
    const response = await fetch(
      `${API_BASE_URL}/trading/${type}${queryString ? `?${queryString}` : ""}`,
      {
      method: "GET",
      headers: tradingApi.getHeaders(),
      credentials: "include",
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  },

  getHeaders: () => ({
    "Content-Type": "application/json",
    "x-active-role": sessionStorage.getItem("active_role") || "",
  }),

  fetchTradeCounts: async (): Promise<TradeCounts> => {
    try {
      const [openRes, closedRes] = await Promise.all([
        fetch(`${API_BASE_URL}/trading/open`, {
          headers: tradingApi.getHeaders(),
          credentials: "include",
        }),
        fetch(`${API_BASE_URL}/trading/closed`, {
          headers: tradingApi.getHeaders(),
          credentials: "include",
        }),
      ]);

      if (!openRes.ok || !closedRes.ok) {
        throw new Error(
          `Failed to fetch trade counts: open=${openRes.status}, closed=${closedRes.status}`,
        );
      }

      const openJson = await openRes.json();
      const closedJson = await closedRes.json();

      return {
        open: openJson.success
          ? (openJson.data.total ?? openJson.data.trades.length)
          : 0,
        closed: closedJson.success
          ? (closedJson.data.total ?? closedJson.data.trades.length)
          : 0,
      };
    } catch (e) {
      console.error("Failed to fetch trade counts", e);
      return { open: 0, closed: 0 };
    }
  },
};
