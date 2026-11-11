import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface BillingAdminRecord {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  isManagedBillingAdmin: boolean;
}

export interface BillingSuspensionSettings {
  managedAdminId: string | null;
  paymentDueDate: string | null;
  dueReminderDays: number;
  gracePeriodDays: number;
  maintenanceMessage: string;
  adminSuspendedMessage: string;
  isManuallySuspended: boolean;
  manualReason: string;
}

export interface CurrentSuspensionState {
  isSuspended: boolean;
  reason: "manual" | "payment_overdue" | "active";
  reminders?: {
    dueSoon: boolean;
    inGrace: boolean;
  };
  maintenanceMessage: string;
  adminMessage: string;
  dueDate: string | null;
  dueDateKey: string | null;
  daysUntilDue: number | null;
  overdueDays: number;
  managedAdmin: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
  } | null;
}

export interface AppThemeSettings {
  mode: "light" | "dark";
  accentColor: string;
}

export const DEFAULT_APP_THEME: AppThemeSettings = {
  mode: "dark",
  accentColor: "#38bdf8",
};

const normalizeTheme = (theme?: Partial<AppThemeSettings>): AppThemeSettings => ({
  mode: theme?.mode === "light" ? "light" : DEFAULT_APP_THEME.mode,
  accentColor:
    theme?.accentColor && /^#[0-9a-fA-F]{6}$/.test(theme.accentColor)
      ? theme.accentColor
      : DEFAULT_APP_THEME.accentColor,
});

interface BillingSuspensionResponse {
  success: boolean;
  data: {
    serverName: string;
    billingSuspension: BillingSuspensionSettings;
    currentState: CurrentSuspensionState;
    admins: BillingAdminRecord[];
  };
}

export const DEFAULT_APP_TIMEZONE = "UTC";

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-active-role": sessionStorage.getItem("active_role") || "",
});

export const useBillingSuspension = () =>
  useQuery({
    queryKey: ["billingSuspension"],
    queryFn: async () => {
      const response = await axios.get<BillingSuspensionResponse>(
        `${API_BASE_URL}/superadmin/billing-suspension`,
        {
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      return response.data.data;
    },
    refetchOnWindowFocus: true,
    staleTime: 60000,
  });

export const useUpdateBillingSuspensionPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      managedAdminId: string;
      paymentDueDate: string | null;
      dueReminderDays: number;
      gracePeriodDays: number;
      maintenanceMessage: string;
      adminSuspendedMessage: string;
    }) => {
      const response = await axios.put<BillingSuspensionResponse>(
        `${API_BASE_URL}/superadmin/billing-suspension/policy`,
        payload,
        {
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["billingSuspension"], (current: any) => ({
        ...(current || {}),
        ...data,
      }));
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlatformStatus"] });
    },
  });
};

export const useUpdateManualSuspension = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      isManuallySuspended: boolean;
      manualReason: string;
    }) => {
      const response = await axios.patch<BillingSuspensionResponse>(
        `${API_BASE_URL}/superadmin/billing-suspension/manual`,
        payload,
        {
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["billingSuspension"], (current: any) => ({
        ...(current || {}),
        ...data,
      }));
      queryClient.invalidateQueries({ queryKey: ["appSettings"] });
      queryClient.invalidateQueries({ queryKey: ["publicPlatformStatus"] });
    },
  });
};

export const usePublicPlatformStatus = () =>
  useQuery({
    queryKey: ["publicPlatformStatus"],
    queryFn: async () => {
      const response = await axios.get<{
        success: boolean;
        data: {
          serverName: string;
          theme?: Partial<AppThemeSettings>;
          timezone?: string;
          currentState: CurrentSuspensionState;
        };
      }>(`${API_BASE_URL}/app-settings/public`);

      return {
        ...response.data.data,
        theme: normalizeTheme(response.data.data.theme),
        timezone: response.data.data.timezone || DEFAULT_APP_TIMEZONE,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });
