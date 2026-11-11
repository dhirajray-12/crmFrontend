import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  DEFAULT_APP_THEME,
  DEFAULT_APP_TIMEZONE,
  type AppThemeSettings,
} from "@/hooks/useBillingSuspension";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export type { AppThemeSettings };
export { DEFAULT_APP_THEME, DEFAULT_APP_TIMEZONE };

interface AppSettingsResponse {
  success: boolean;
  data: {
    serverName: string;
    theme?: Partial<AppThemeSettings>;
    timezone?: string;
    billingSuspension?: Record<string, unknown>;
    currentState?: Record<string, unknown>;
  };
}

interface AppSettingsData {
  serverName: string;
  theme: AppThemeSettings;
  timezone: string;
}

const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-active-role": sessionStorage.getItem("active_role") || "",
});

const normalizeTheme = (theme?: Partial<AppThemeSettings>): AppThemeSettings => ({
  mode: theme?.mode === "light" ? "light" : DEFAULT_APP_THEME.mode,
  accentColor:
    theme?.accentColor && /^#[0-9a-fA-F]{6}$/.test(theme.accentColor)
      ? theme.accentColor
      : DEFAULT_APP_THEME.accentColor,
});

export const useAppSettings = () =>
  useQuery({
    queryKey: ["appSettings"],
    queryFn: async (): Promise<AppSettingsData> => {
      const response = await axios.get<AppSettingsResponse>(
        `${API_BASE_URL}/app-settings`,
        {
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      return {
        serverName: response.data.data.serverName || "Aon ltd.",
        theme: normalizeTheme(response.data.data.theme),
        timezone: response.data.data.timezone || DEFAULT_APP_TIMEZONE,
      };
    },
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

interface UpdateAppSettingsInput {
  serverName?: string;
  theme?: Partial<AppThemeSettings>;
  timezone?: string;
}

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateAppSettingsInput): Promise<AppSettingsData> => {
      const response = await axios.put<AppSettingsResponse>(
        `${API_BASE_URL}/app-settings`,
        input,
        {
          withCredentials: true,
          headers: getHeaders(),
        },
      );

      return {
        serverName: response.data.data.serverName || "Aon ltd.",
        theme: normalizeTheme(response.data.data.theme),
        timezone: response.data.data.timezone || DEFAULT_APP_TIMEZONE,
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["appSettings"], data);
      queryClient.invalidateQueries({ queryKey: ["publicPlatformStatus"] });
    },
  });
};
