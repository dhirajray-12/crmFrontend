// src/API/pammApi.ts
import api from "@/API/axiosInstance";

export type PammStatus = "active" | "inactive" | "closed";
export type PammFeeFrequency = "weekly" | "monthly" | "quarterly";
export type PammRequestStatus = "pending" | "completed" | "rejected";
export type PammRequestType =
  | "investment"
  | "redemption"
  | "management_fee"
  | "performance_fee"
  | "settlement";

export interface PammPersonRef {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface PammAccountRef {
  _id: string;
  mt5Account: string;
  balance?: number;
  equity?: number;
}

export interface PammFund {
  _id: string;
  manager: PammPersonRef | string;
  account: PammAccountRef | string;
  name: string;
  description?: string;
  managementFeePercent: number;
  managementFeeFrequency: PammFeeFrequency;
  performanceFeePercent: number;
  minInvestment: number;
  status: PammStatus;
  navPerUnit: number;
  totalUnits: number;
  aum: number;
  totalInvestors: number;
  lastSettlementAt: string;
  closedAt?: string | null;
  createdAt: string;
  sinceInceptionReturnPercent?: number;
  activeInvestorCount?: number;
  totalFeesEarned?: number;
}

export interface PammInvestment {
  _id: string;
  pamm: PammFund | string;
  investor: PammPersonRef | string;
  account: PammAccountRef | string;
  units: number;
  principalInvested: number;
  principalRedeemed: number;
  hwmNav: number;
  totalFeesPaid: number;
  status: "active" | "closed";
  joinedAt: string;
  currentValue?: number;
  roiPercent?: number;
}

export interface PammTransaction {
  _id: string;
  pamm: PammFund | string;
  investment?: string | null;
  investor?: PammPersonRef | string | null;
  account?: PammAccountRef | string | null;
  type: PammRequestType;
  status: PammRequestStatus;
  amount: number;
  units: number;
  navAtTransaction: number | null;
  remarks?: string;
  mt5Ticket?: string | null;
  createdAt: string;
}

interface Paginated<T> {
  success: boolean;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------
export const adminPammApi = {
  getStats: async () => {
    const res = await api.get("/admin/pamm/stats");
    return res.data.data;
  },

  getEligibleAccounts: async (search?: string) => {
    const res = await api.get("/admin/pamm/eligible-accounts", { params: { search } });
    return res.data.data;
  },

  getFunds: async (params: { status?: string; search?: string; page?: number; limit?: number } = {}) => {
    const res = await api.get<Paginated<PammFund>>("/admin/pamm/funds", { params });
    return res.data;
  },

  getFundById: async (id: string) => {
    const res = await api.get(`/admin/pamm/funds/${id}`);
    return res.data.data as { fund: PammFund; investors: PammInvestment[]; transactions: PammTransaction[] };
  },

  createFund: async (payload: {
    accountId: string;
    name: string;
    description?: string;
    managementFeePercent: number;
    managementFeeFrequency: PammFeeFrequency;
    performanceFeePercent: number;
    minInvestment: number;
  }) => {
    const res = await api.post("/admin/pamm/funds", payload);
    return res.data.data as PammFund;
  },

  updateFund: async (id: string, payload: Partial<PammFund>) => {
    const res = await api.put(`/admin/pamm/funds/${id}`, payload);
    return res.data.data as PammFund;
  },

  closeFund: async (id: string) => {
    const res = await api.post(`/admin/pamm/funds/${id}/close`);
    return res.data.data as PammFund;
  },

  triggerSettlement: async (id: string) => {
    const res = await api.post(`/admin/pamm/funds/${id}/settle`);
    return res.data.data;
  },

  getInvestmentRequests: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const res = await api.get<Paginated<PammTransaction>>("/admin/pamm/investments", { params });
    return res.data;
  },

  approveInvestment: async (id: string) => {
    const res = await api.put(`/admin/pamm/investments/${id}/approve`);
    return res.data;
  },

  rejectInvestment: async (id: string, remarks?: string) => {
    const res = await api.put(`/admin/pamm/investments/${id}/reject`, { remarks });
    return res.data;
  },

  getRedemptionRequests: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const res = await api.get<Paginated<PammTransaction>>("/admin/pamm/redemptions", { params });
    return res.data;
  },

  approveRedemption: async (id: string) => {
    const res = await api.put(`/admin/pamm/redemptions/${id}/approve`);
    return res.data;
  },

  rejectRedemption: async (id: string, remarks?: string) => {
    const res = await api.put(`/admin/pamm/redemptions/${id}/reject`, { remarks });
    return res.data;
  },
};

// ---------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------
export const clientPammApi = {
  getFunds: async () => {
    const res = await api.get("/pamm/funds");
    return res.data.data as PammFund[];
  },

  getFundDetail: async (id: string) => {
    const res = await api.get(`/pamm/funds/${id}`);
    return res.data.data as PammFund & { navHistory: { navAtTransaction: number; createdAt: string; type: string }[] };
  },

  invest: async (payload: { fundId: string; accountId: string; amount: number }) => {
    const res = await api.post("/pamm/invest", payload);
    return res.data;
  },

  getMyInvestments: async () => {
    const res = await api.get("/pamm/my-investments");
    return res.data.data as PammInvestment[];
  },

  getInvestmentTransactions: async (investmentId: string) => {
    const res = await api.get(`/pamm/my-investments/${investmentId}/transactions`);
    return res.data.data as PammTransaction[];
  },

  redeem: async (payload: { investmentId: string; units?: number; amount?: number; all?: boolean }) => {
    const res = await api.post("/pamm/redeem", payload);
    return res.data;
  },

  getMyRequests: async (params: { status?: string; type?: string; page?: number; limit?: number } = {}) => {
    const res = await api.get<Paginated<PammTransaction>>("/pamm/my-requests", { params });
    return res.data;
  },

  getMyManagedFunds: async () => {
    const res = await api.get("/pamm/my-funds");
    return res.data.data as PammFund[];
  },

  getMyFundInvestors: async (fundId: string) => {
    const res = await api.get(`/pamm/my-funds/${fundId}/investors`);
    return res.data.data as PammInvestment[];
  },
};
