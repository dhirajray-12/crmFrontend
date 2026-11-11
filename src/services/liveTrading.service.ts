// src/services/liveTrading.service.ts
//
// Backs the trading terminal: tick history for a symbol (read straight from
// our backend's proxy over the third-party trading bridge) plus
// place/close order calls. Both go through our own backend (never straight
// to the bridge) so the bridge's API key stays server-side and every
// action is re-checked against the caller's own accounts there.
//
// The chart-data proxy used to point at a misconfigured upstream that
// timed out (15s, 502) on every single call - that was the real cause of
// the slow/late chart. The backend now calls the bridge's own chart
// endpoint (chart.apirun.top) instead, which was confirmed directly to
// respond in well under a second.
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getRequestConfig = () => ({
  headers: {
    "Content-Type": "application/json",
    "x-active-role": sessionStorage.getItem("active_role") || "",
  },
  withCredentials: true,
});

// Axios rejects on any non-2xx status before our own success-flag check
// ever runs, so a 400/403/504 from the backend (which carries a specific,
// actionable message) was being replaced by a generic "Request failed with
// status code 504" from Axios itself. Extract the real message first.
const unwrapError = (error: unknown, fallback: string): Error => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return new Error(message);
  }
  return error instanceof Error ? error : new Error(fallback);
};

export interface ChartDataParams {
  symbol: string;
  start?: number;
  range?: number;
}

export interface PlaceTradePayload {
  accountId: string;
  symbol: string;
  price: number;
  lot: number;
  type: 0 | 1; // 0 = Buy, 1 = Sell
  sl?: number;
  tp?: number;
}

export interface CloseTradePayload {
  positionId: number | string;
  price: number;
  managerIndex?: number;
}

export interface ModifyTradePayload {
  positionId: number | string;
  sl?: number;
  tp?: number;
}

export const liveTradingApi = {
  getChartData: async ({ symbol, start = 0, range = 200 }: ChartDataParams) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trading/live/chart-data`, {
        ...getRequestConfig(),
        params: { symbol, start, range },
      });
      if (!response.data?.success) throw new Error(response.data?.message || "Failed to fetch chart data");
      return response.data.data;
    } catch (error) {
      throw unwrapError(error, "Failed to fetch chart data");
    }
  },

  placeTrade: async (payload: PlaceTradePayload) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trading/live/place`,
        payload,
        getRequestConfig(),
      );
      if (!response.data?.success) throw new Error(response.data?.message || "Failed to place trade");
      return response.data;
    } catch (error) {
      throw unwrapError(error, "Failed to place trade");
    }
  },

  closeTrade: async (payload: CloseTradePayload) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trading/live/close`,
        payload,
        getRequestConfig(),
      );
      if (!response.data?.success) throw new Error(response.data?.message || "Failed to close trade");
      return response.data;
    } catch (error) {
      throw unwrapError(error, "Failed to close trade");
    }
  },

  modifyTrade: async (payload: ModifyTradePayload) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trading/live/modify`,
        payload,
        getRequestConfig(),
      );
      if (!response.data?.success) throw new Error(response.data?.message || "Failed to update SL/TP");
      return response.data;
    } catch (error) {
      throw unwrapError(error, "Failed to update SL/TP");
    }
  },
};
