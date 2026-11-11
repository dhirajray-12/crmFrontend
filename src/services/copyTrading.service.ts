import type {
  ApiResponse,
  TradeHistoryResponse,
  OpenTradesCheckResponse,
} from "@/types/copyTrading.types";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

class CopyTradingService {
  async getMastersAndCopiers() {
    const response = await fetch(
      `${API_BASE_URL}/copy-copier/masters-copiers`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch masters and copiers");
    return response.json() as Promise<ApiResponse<any>>;
  }

  async getTradeHistory(
    copierAccounts: number[],
    page: number = 1,
    pageSize: number = 100,
  ) {
    const response = await fetch(`${API_BASE_URL}/copy-copier/trade-history`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify({ copierAccounts, page, pageSize }),
    });
    if (!response.ok) throw new Error("Failed to fetch trade history");
    return response.json() as Promise<ApiResponse<TradeHistoryResponse>>;
  }

  async checkOpenTrades(copierAccounts: number[]) {
    const response = await fetch(
      `${API_BASE_URL}/copy-copier/check-open-trades`,
      {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
        body: JSON.stringify({ copierAccounts }),
      },
    );
    if (!response.ok) throw new Error("Failed to check open trades");
    return response.json() as Promise<ApiResponse<OpenTradesCheckResponse>>;
  }

  async unlinkCopier(mt5Account: string) {
    const response = await fetch(`${API_BASE_URL}/copy-copier/unlink-copier`, {
      method: "DELETE",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify({ mt5Account }),
    });
    if (!response.ok) throw new Error("Failed to unlink copier");
    return response.json() as Promise<ApiResponse<any>>;
  }
}

export default CopyTradingService;
