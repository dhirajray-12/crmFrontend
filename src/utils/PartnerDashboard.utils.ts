// utils/partner.utils.ts
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
    case "approved":
      return "bg-blue-500/20 text-blue-700 border-blue-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-700 border-red-500/30";
    default:
      return "bg-amber-500/20 text-amber-700 border-amber-500/30";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return "CheckCircle";
    case "rejected":
      return "XCircle";
    default:
      return "Clock";
  }
};

export const getStatusTextColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "text-emerald-300";
    case "rejected":
      return "text-red-300";
    case "approved":
      return "text-blue-300";
    default:
      return "text-amber-300";
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString(undefined, {
    timeZone: getConfiguredTimezone(),
  });
};

export const formatCurrency = (
  amount: number | string | null | undefined,
  decimals: number = 2,
): string => {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount.replace(/,/g, "").trim())
        : Number.NaN;

  if (!Number.isFinite(numericAmount)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(0);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericAmount);
};
