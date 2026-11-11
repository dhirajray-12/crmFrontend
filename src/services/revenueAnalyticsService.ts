// src/services/revenueAnalyticsService.ts
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

// ================= TYPES =================

export interface RevenueAnalyticsData {
  data: {
    deposits: {
      total: number;
      count: number;
      growth: number;
    };
    withdrawals: {
      total: number;
      count: number;
      growth: number;
    };
    netRevenue: {
      total: number;
      growth: number;
    };
    ibCommission: {
      total: number;
      count: number;
    };
    ibPartners: {
      active: number;
    };
    ibTradingVolume: {
      total: number;
    };
  };
}

export interface TimeSeriesDataPoint {
  name?: string;
  day?: string;
  deposits: number;
  withdrawals: number;
  revenue: number;
}

// Backend response types
interface BackendRevenueResponse {
  success: boolean;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  data: {
    deposits: {
      total: number;
      count: number;
      growth: number;
    };
    withdrawals: {
      total: number;
      count: number;
      growth: number;
    };
    netRevenue: {
      total: number;
      growth: number;
    };
    ibCommission: {
      total: number;
      count: number;
    };
    ibPartners: {
      active: number;
    };
    ibTradingVolume: {
      total: number;
    };
  };
}

interface BackendTimeSeriesResponse {
  success: boolean;
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  data: TimeSeriesDataPoint[];
}

// ================= API CALLS =================

export const fetchRevenueAnalytics = async (
  days: number,
): Promise<RevenueAnalyticsData> => {
  const response = await axios.get<BackendRevenueResponse>(
    `${BASE_URL}/admin/revenue-analytics?days=${days}`,
    {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      withCredentials: true,
    },
  );

  // Axios response structure: response.data contains the backend response
  // Backend returns: { success: true, period: {...}, data: {...} }
  // So response.data.data is the actual data we need
  // We wrap it in { data: ... } to match RevenueAnalyticsData interface

  return { data: response.data.data };
};

export const fetchRevenueTimeSeries = async (
  days: number,
  interval: "daily" | "weekly",
): Promise<{ data: TimeSeriesDataPoint[] }> => {
  const response = await axios.get<BackendTimeSeriesResponse>(
    `${BASE_URL}/admin/revenue-analytics/timeseries?days=${days}&interval=${interval}`,
    {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      withCredentials: true,
    },
  );

  // Axios response structure: response.data contains the backend response
  // Backend returns: { success: true, period: {...}, data: [...] }
  // So response.data.data is the actual data array we need
  return { data: response.data.data };
};
