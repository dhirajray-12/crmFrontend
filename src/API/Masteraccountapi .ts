// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Type Definitions
export interface MasterAccount {
  _id: string;
  nickname: string;
  accountDetails: {
    mt5Account: string;
    balance: number;
  };
  commission: number;
  totalCopiers: number;
  totalProfit: number;
  totalCommissionEarned: number;
  isActive: boolean;
  createdAt: string;
  copiers: Copier[];
}

export interface Copier {
  copierUserId: {
    firstname: string;
    lastname: string;
  };
  copierAccountId: {
    accountNumber: string;
    balance: number;
  };
  currentProfit: number;
  totalCommissionPaid: number;
  status: string;
}

export interface Account {
  _id: string;
  mt5Account: string;
  name: string;
  createdAt: string;
}

export interface CreateMasterData {
  nickname: string;
  accountId: string;
  commission: number;
  minimumInvestment: number;
  publicChatLink?: string;
  strategyDescription?: string;
}

export interface UpdateMasterData {
  nickname: string;
  commission: number;
  minimumInvestment: number;
  publicChatLink?: string;
  strategyDescription?: string;
}

// API Service
export const masterAccountAPI = {
  /**
   * Fetch all master accounts
   */
  getMasters: async () => {
    const response = await fetch(`${API_BASE_URL}/copy-trade/masters`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch masters");
    return response.json();
  },

  /**
   * Fetch details of a specific master account
   */
  getMasterDetails: async (masterId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/copy-trade/masters/${masterId}`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch master details");
    return response.json();
  },

  /**
   * Fetch all available accounts for admin
   */
  getAllAccounts: async () => {
    const response = await fetch(`${API_BASE_URL}/copy-trade/admin/accounts`, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch accounts");
    return response.json();
  },

  /**
   * Create a new master account
   */
  createMaster: async (data: CreateMasterData) => {
    const response = await fetch(`${API_BASE_URL}/copy-trade/masters`, {
      method: "POST",
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create master");
    }
    return response.json();
  },

  /**
   * Update an existing master account
   */
  updateMaster: async (masterId: string, data: UpdateMasterData) => {
    const response = await fetch(
      `${API_BASE_URL}/copy-trade/masters/${masterId}`,
      {
        method: "PUT",
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update master");
    }
    return response.json();
  },

  /**
   * Delete a master account
   */
  deleteMaster: async (masterId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/copy-trade/masters/${masterId}`,
      {
        method: "DELETE",
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete master");
    }
    return response.json();
  },
};
