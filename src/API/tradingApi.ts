import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

/* =======================
   COMMON API RESPONSE
======================= */

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

/* =======================
   TYPES
======================= */

export interface Group {
  _id: string;
  name: string;
  value: string;
  leverages?: {
    _id: string;
    value: string; // e.g. "100:1"
  }[];
}


export interface Account {
  _id: string;
  mt5Account: string;
  name?: string;
  accountType: string; // Friendly name
  groupName: string;   // MT5 group path
  leverage: string;
  platform: string;
  balance?: number;
  equity?: number;
  status?: boolean;
}

export interface CreateAccountPayload {
  accountType: string; // MUST be group.value
  leverage: string;
  platform: string;
}

/* =======================
   GROUP APIs
======================= */

/**
 * Fetch all account groups
 * GET /api/groups
 */
export const getGroups = async (token: string): Promise<Group[]> => {
  const res = await axios.get<ApiResponse<Group[]>>(
    `${API_BASE}/api/groups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
};

/* =======================
   ACCOUNT APIs
======================= */

/**
 * Create trading account
 * POST /api/accounts/create
 */
export const createAccount = async (
  payload: CreateAccountPayload,
  token: string
): Promise<Account> => {
  const res = await axios.post<ApiResponse<Account>>(
    `${API_BASE}/api/accounts/create`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data;
};

/**
 * Get all user accounts
 * GET /api/accounts
 */
export const getAccounts = async (token: string): Promise<Account[]> => {
  const res = await axios.get<ApiResponse<Account[]>>(
    `${API_BASE}/api/accounts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
};
