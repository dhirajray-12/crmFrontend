 // frontend/src/API/adminIBService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Types and Interfaces
export interface IBConfiguration {
  _id: string;
  groupId: string;
  maximumCommission: number;
  defaultTimeInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  value: string;
  description?: string;
  configuration: IBConfiguration | null;
  commissionMode?: CommissionMode;
}

// Which commission calculation model a group uses.
// 'waterfall' = ceiling-based per-user delegation (existing model)
// 'flat' = "Normal Commission" - a fixed bonus-per-lot per upline level
export type CommissionMode = 'waterfall' | 'flat';

export interface FlatCommissionConfiguration {
  _id: string;
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupWithFlatConfigurations {
  _id: string;
  name: string;
  value: string;
  description?: string;
  active: boolean;
  commissionMode?: CommissionMode;
  configurations: FlatCommissionConfiguration[];
}

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  country?: string;
  phone?: string;
}

export interface IBClientConfiguration {
  _id: string;
  IBbalance: number;
  referralCode: string;
  level?: number;
  maximumCommission: number | null;
  groupId?: string | { _id: string; name: string; value: string } | null;
}

export interface RootIB {
  _id: string;
  userId: { _id: string; firstName: string; lastName: string; email: string };
  maximumCommission: number | null;
  groupId?: { _id: string; name: string; value: string } | null;
  status: string;
  createdAt: string;
}

export interface IBWithdrawal {
  _id: string;
  userId: User;
  ibConfigurationId: IBClientConfiguration;
  amount: number;
  paymentMethod: string;
  paymentDetails: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  transactionId?: string;
  rejectedReason?: string;
  approvedBy?: User;
  approvedAt?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalStats {
  totalRequests: number;
  totalAmount: number;
  byStatus: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WithdrawalsResponse {
  success: boolean;
  withdrawals: IBWithdrawal[];
  pagination: PaginationInfo;
}

export interface WithdrawalDetailsResponse {
  success: boolean;
  withdrawal: IBWithdrawal;
}

export interface StatsResponse {
  success: boolean;
  stats: WithdrawalStats;
}

export interface GroupsResponse {
  success: boolean;
  count: number;
  data: Group[];
}

export interface ConfigurationResponse {
  success: boolean;
  data: IBConfiguration;
}

// Create axios instance with auth token
const getAuthHeader = (token: string | null) => {
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

// Helper to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// ============================================
// IB CONFIGURATION APIs
// ============================================

/**
 * Get all groups with their IB configurations
 */
export const getAllGroupsWithConfigurations = async (): Promise<GroupsResponse> => {
  try {
    const response = await axios.get<GroupsResponse>(
      `${API_URL}/ib-configurations/groups`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get IB configuration (ceiling) for a specific group
 */
export const getIBConfigurationsByGroup = async (groupId: string): Promise<ApiResponse<IBConfiguration>> => {
  try {
    const response = await axios.get<ApiResponse<IBConfiguration>>(
      `${API_URL}/ib-configurations/group/${groupId}`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new IB configuration (ceiling) for a group
 */
export const createIBConfiguration = async (data: {
  groupId: string;
  maximumCommission: number;
  defaultTimeInSeconds?: number;
}): Promise<ConfigurationResponse> => {
  try {
    const response = await axios.post<ConfigurationResponse>(
      `${API_URL}/ib-configurations`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update IB configuration (ceiling)
 */
export const updateIBConfiguration = async (
  id: string,
  data: {
    maximumCommission: number;
    defaultTimeInSeconds?: number;
  }
): Promise<ConfigurationResponse> => {
  try {
    const response = await axios.put<ConfigurationResponse>(
      `${API_URL}/ib-configurations/${id}`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * List all root-level IBs (no parent) for admin assignment
 */
export const getRootIBs = async (): Promise<ApiResponse<RootIB[]>> => {
  try {
    const response = await axios.get<ApiResponse<RootIB[]>>(
      `${API_URL}/ib-configurations/root-ibs`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Assign (or update) the maximum commission for a root IB
 */
export const assignRootIBCommission = async (data: {
  userId: string;
  groupId: string;
  maximumCommission: number;
}): Promise<ApiResponse<RootIB>> => {
  try {
    const response = await axios.post<ApiResponse<RootIB>>(
      `${API_URL}/ib-configurations/root/assign`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update group default time
 */
export const updateGroupDefaultTime = async (
  groupId: string,
  defaultTimeInSeconds: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<ApiResponse<any>>(
      `${API_URL}/ib-configurations/group/${groupId}/default-time`,
      { defaultTimeInSeconds },
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete IB configuration
 */
export const deleteIBConfiguration = async (id: string): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<ApiResponse<any>>(
      `${API_URL}/ib-configurations/${id}`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// GROUP COMMISSION MODE
// ============================================

/**
 * Toggle which commission model a group uses (waterfall ceiling vs flat
 * per-level). Goes through the generic group update endpoint since Group
 * already supports partial updates.
 */
export const updateGroupCommissionMode = async (
  groupId: string,
  commissionMode: CommissionMode
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<ApiResponse<any>>(
      `${API_URL}/groups/${groupId}`,
      { commissionMode },
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// FLAT (NORMAL) COMMISSION APIs
// ============================================

/**
 * Get all groups with their flat per-level commission configurations
 */
export const getAllGroupsWithFlatConfigurations = async (): Promise<
  ApiResponse<GroupWithFlatConfigurations[]>
> => {
  try {
    const response = await axios.get<ApiResponse<GroupWithFlatConfigurations[]>>(
      `${API_URL}/ib-configurations-flat/groups`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get flat commission level configurations for a specific group
 */
export const getFlatConfigurationsByGroup = async (
  groupId: string
): Promise<ApiResponse<FlatCommissionConfiguration[]>> => {
  try {
    const response = await axios.get<ApiResponse<FlatCommissionConfiguration[]>>(
      `${API_URL}/ib-configurations-flat/group/${groupId}`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create a flat commission level configuration
 */
export const createFlatCommissionConfiguration = async (data: {
  groupId: string;
  level: number;
  bonusPerLot: number;
  defaultTimeInSeconds?: number;
}): Promise<ApiResponse<FlatCommissionConfiguration>> => {
  try {
    const response = await axios.post<ApiResponse<FlatCommissionConfiguration>>(
      `${API_URL}/ib-configurations-flat`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update a flat commission level configuration
 */
export const updateFlatCommissionConfiguration = async (
  id: string,
  data: { bonusPerLot?: number; defaultTimeInSeconds?: number }
): Promise<ApiResponse<FlatCommissionConfiguration>> => {
  try {
    const response = await axios.put<ApiResponse<FlatCommissionConfiguration>>(
      `${API_URL}/ib-configurations-flat/${id}`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete a flat commission level configuration
 */
export const deleteFlatCommissionConfiguration = async (
  id: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.delete<ApiResponse<any>>(
      `${API_URL}/ib-configurations-flat/${id}`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update default hold time for all levels in a group's flat configuration
 */
export const updateFlatGroupDefaultTime = async (
  groupId: string,
  defaultTimeInSeconds: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<ApiResponse<any>>(
      `${API_URL}/ib-configurations-flat/group/${groupId}/default-time`,
      { defaultTimeInSeconds },
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

// ============================================
// IB WITHDRAWAL APIs
// ============================================

/**
 * Get all withdrawal requests with filters
 */
export const getAllWithdrawals = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<WithdrawalsResponse> => {
  try {
    const response = await axios.get<WithdrawalsResponse>(
      `${API_URL}/admin/ib-withdrawals`,
      {
        ...getAuthHeader(getToken()),
        params
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get withdrawal details by ID
 */
export const getWithdrawalDetails = async (withdrawalId: string): Promise<WithdrawalDetailsResponse> => {
  try {
    const response = await axios.get<WithdrawalDetailsResponse>(
      `${API_URL}/admin/ib-withdrawals/${withdrawalId}`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Approve withdrawal request
 */
export const approveWithdrawal = async (
  withdrawalId: string,
  data: {
    adminNotes?: string;
    transactionId?: string;
  }
): Promise<ApiResponse<IBWithdrawal>> => {
  try {
    const response = await axios.put<ApiResponse<IBWithdrawal>>(
      `${API_URL}/admin/ib-withdrawals/${withdrawalId}/approve`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Reject withdrawal request
 */
export const rejectWithdrawal = async (
  withdrawalId: string,
  data: {
    rejectedReason: string;
    adminNotes?: string;
  }
): Promise<ApiResponse<IBWithdrawal>> => {
  try {
    const response = await axios.put<ApiResponse<IBWithdrawal>>(
      `${API_URL}/admin/ib-withdrawals/${withdrawalId}/reject`,
      data,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get withdrawal statistics
 */
export const getWithdrawalStats = async (): Promise<StatsResponse> => {
  try {
    const response = await axios.get<StatsResponse>(
      `${API_URL}/admin/ib-withdrawals/stats`,
      getAuthHeader(getToken())
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message;
  }
};