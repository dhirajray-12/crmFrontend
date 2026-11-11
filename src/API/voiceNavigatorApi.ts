import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type AssistantLanguage =
  | "en-IN"
  | "hi-IN"
  | "tr-TR"
  | "ar-SA"
  | "ru-RU";

export interface AssistantAccountItem {
  mt5Account: string;
  name: string;
  accountType: string;
  platform: string;
  leverage: string;
  balance: number;
  equity: number;
  status: boolean;
}

export interface AssistantActivityItem {
  id: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  status: string;
  account: string | null;
  date: string;
  description: string;
}

export interface AssistantNotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AssistantTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  updatedAt: string;
}

export interface AssistantContext {
  profile: {
    fullName: string;
    email: string;
    role: string;
    joinedAt: string | null;
    kycStatus: string;
    kycVerified: boolean;
  };
  overview: {
    totalBalance: number;
    totalEquity: number;
    totalDeposits: number;
    totalWithdrawals: number;
    netBalance: number;
  };
  accounts: {
    total: number;
    active: number;
    mt5: number;
    mt4: number;
    recent: AssistantAccountItem[];
  };
  deposits: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalApprovedAmount: number;
    totalPendingAmount: number;
  };
  withdrawals: {
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
    totalApprovedAmount: number;
    totalPendingAmount: number;
  };
  transactions: {
    total: number;
    recent: AssistantActivityItem[];
  };
  notifications: {
    unreadCount: number;
    totalCount: number;
    recent: AssistantNotificationItem[];
  };
  tickets: {
    openCount: number;
    totalCount: number;
    recent: AssistantTicketItem[];
  };
  welcomeMessage: string;
  suggestions: string[];
}

export interface AssistantNavigationTarget {
  label: string;
  route: string;
}

export type AssistantAction =
  | { type: "fill" | "select"; field: string; value: string }
  | { type: "click"; target: string };

export interface AssistantChatHistoryItem {
  role: "user" | "assistant";
  text: string;
}

export interface AssistantSentimentAnalysis {
  label: "frustrated" | "urgent" | "confused" | "positive" | "neutral";
  sentimentScore: number;
  frustrationScore: number;
  urgencyScore: number;
  confusionScore: number;
  recommendedTone: string;
}

export interface AssistantChatResponse {
  reply: string;
  topic: string;
  sentiment: AssistantSentimentAnalysis;
  navigation: AssistantNavigationTarget | null;
  actions?: AssistantAction[];
  suggestions: string[];
  context: AssistantContext;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers["x-active-role"] =
    sessionStorage.getItem("active_role") || "";
  return config;
});

async function getData<T>(url: string, params?: Record<string, unknown>) {
  const response = await api.get<ApiEnvelope<T>>(url, { params });

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to fetch CRM data");
  }

  return response.data.data;
}

async function postData<T>(url: string, payload: Record<string, unknown>) {
  const response = await api.post<ApiEnvelope<T>>(url, payload);

  if (!response.data?.success) {
    throw new Error(response.data?.message || "Failed to process CRM request");
  }

  return response.data.data;
}

export async function fetchAssistantContext(
  language: AssistantLanguage,
): Promise<AssistantContext> {
  return getData<AssistantContext>("/client/assistant/context", { language });
}

export async function sendAssistantMessage(payload: {
  message: string;
  language: AssistantLanguage;
  history: AssistantChatHistoryItem[];
}): Promise<AssistantChatResponse> {
  return postData<AssistantChatResponse>("/client/assistant/chat", payload);
}
