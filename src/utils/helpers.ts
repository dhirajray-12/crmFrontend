import type { ExpertiseLevel } from "@/types/rating.types";
import type { Account, FilterOptions } from "@/types/WithdrawalPage.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const getRiskColor = (score: number): string => {
  if (score <= 3) return "from-green-400 to-emerald-500";
  if (score <= 6) return "from-yellow-400 to-amber-500";
  return "from-red-400 to-rose-500";
};

export const getExpertiseBadge = (expertise: ExpertiseLevel) => {
  const badges: Record<ExpertiseLevel, { color: string; icon: string }> = {
    legend: { color: "from-yellow-400 to-orange-500", icon: "👑" },
    expert: { color: "from-blue-400 to-cyan-500", icon: "🏆" },
    vertical_take_off: { color: "from-green-400 to-emerald-500", icon: "🚀" },
    young_talent: { color: "from-purple-400 to-pink-500", icon: "⭐" },
    new_comers: { color: "from-gray-400 to-slate-500", icon: "🌱" },
  };
  return badges[expertise] || badges.new_comers;
};

export const generateColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15);

  return {
    bg: `hsl(${hue}, ${saturation - 20}%, 90%)`,
    text: `hsl(${hue}, ${saturation}%, 30%)`,
    border: `hsl(${hue}, ${saturation - 10}%, 70%)`,
  };
};

export const calculateTimeTaken = (startDate: string, endDate: string) => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const diffMs = end - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: getConfiguredTimezone(),
  });
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: getConfiguredTimezone(),
  });
};

export const generateColorFromStrings = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15);
  const lightness = 55 + (Math.abs(hash) % 10);

  return {
    gradient: {
      color1: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      color2: `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness - 10}%)`,
    },
    badge: {
      bg: `hsl(${hue}, ${saturation - 20}%, 90%)`,
      text: `hsl(${hue}, ${saturation}%, 30%)`,
      border: `hsl(${hue}, ${saturation - 10}%, 70%)`,
    },
  };
};

export const getAccountColor = (accountTypeKey: string): string => {
  const colors = generateColorFromStrings(accountTypeKey);
  return `linear-gradient(135deg, ${colors.gradient.color1}, ${colors.gradient.color2})`;
};
export const getAccountBadgeColor = (accountTypeKey: string) => {
  return generateColorFromStrings(accountTypeKey).badge;
};
export const getStatusIcon = (status: string) => {
  switch (status.trim().toLowerCase()) {
    case "approved":
    case "completed":
    case "success":
      return "CheckCircle";
    case "pending":
    case "processing":
      return "Clock";
    case "rejected":
    case "failed":
      return "XCircle";
    default:
      return "AlertCircle";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status.trim().toLowerCase()) {
    case "approved":
    case "completed":
    case "success":
      return "bg-emerald-100 text-emerald-600 border border-emerald-200";
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-600 border border-amber-200";
    default:
      return "bg-red-100 text-red-600 border border-red-200";
  }
};

export const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const calculateTotalBalance = (accounts: Account[]): number => {
  return accounts.reduce((sum: number, account: Account) => {
    const amount = parseFloat(
      account.balance.replace("$", "").replace(",", ""),
    );
    return sum + amount;
  }, 0);
};

export const generateDynamicAccountTypes = (
  accounts: any[],
): FilterOptions[] => {
  const uniqueTypes = Array.from(
    new Set(accounts.map((acc) => acc.accountType)),
  );

  return (uniqueTypes as string[]).map((type: string) => ({
    id: type,
    label: type,
    color: `text-[hsl(${Math.abs(
      type.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % 360,
    )},70%,30%)]`,
    bgColor: `bg-[hsl(${Math.abs(
      type.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % 360,
    )},60%,90%)]`,
    borderColor: `border-[hsl(${Math.abs(
      type.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % 360,
    )},65%,70%)]`,
  }));
};
