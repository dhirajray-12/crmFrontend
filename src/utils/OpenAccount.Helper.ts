import type { Group, AccountType, UserInfo } from "@/types/OpenAccount.type";
import {
  GRADIENTS,
  ICONS,
  ACCENT_COLORS,
  MT5_ACCOUNT_REGEX,
  ERROR_MESSAGES,
} from "@/utils/OpenAccount.constant";

export const parseFeatures = (description?: string): string[] => {
  if (!description) return [];
  return description
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const transformGroupsToAccountTypes = (
  groups: Group[],
): AccountType[] => {
  return groups.map((group, index) => ({
    id: group._id,
    name: group.name,
    icon: ICONS[index % ICONS.length],
    description: group.description || "Professional trading account",
    features: parseFeatures(group.description),
    gradient: GRADIENTS[index % GRADIENTS.length],
    accentColor: ACCENT_COLORS[index % ACCENT_COLORS.length],
    server: group.platforms,
  }));
};

export const validateMT5Account = (account: string): boolean => {
  if (!account) return true; // Empty is allowed (auto-generation)
  return MT5_ACCOUNT_REGEX.test(account.trim());
};

export const formatLeverageOptions = (leverages: any[]): string[] => {
  return leverages.map((l) => `1:${l.value}`);
};

export const getDefaultLeverage = (group?: Group): string => {
  if (group && group.leverages.length > 0) {
    return `1:${group.leverages[0].value}`;
  }
  return "";
};

export const formatErrorMessage = (error: any): string => {
  if (error.code === "ERR_NETWORK") {
    return (
      `${ERROR_MESSAGES.NETWORK_ERROR}\n\n` +
      `Possible causes:\n` +
      `• Backend server is not running\n` +
      `• Wrong backend URL\n` +
      `• Network connection issue\n\n` +
      `Backend URL: ${import.meta.env.VITE_BACKEND_URL}\n\n` +
      `Make sure your backend is running on port 5000`
    );
  } else if (error.response) {
    return (
      error.response.data?.message || `Server Error: ${error.response.status}`
    );
  } else if (error.request) {
    return "No response received from server. Check if backend is running.";
  } else {
    return error.message || "Unknown error occurred";
  }
};

export const getUserDisplayName = (user: UserInfo | null): string => {
  if (!user) return "";
  return `${user.firstName} ${user.lastName}`;
};
