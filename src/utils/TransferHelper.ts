import type { FilterState } from "@/types/transfer.types";
export const generateColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 15);
  const lightness = 55 + (Math.abs(hash) % 10);

  return {
    color1: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    color2: `hsl(${(hue + 40) % 360}, ${saturation + 10}%, ${lightness - 10}%)`,
  };
};

export const getAccountTypeColor = (type: string): string => {
  const colors = generateColorFromString(type);
  return `linear-gradient(135deg, ${colors.color1}, ${colors.color2})`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const normalizeTransferStatus = (status: string): string => {
  switch (status.trim().toLowerCase()) {
    case "approved":
    case "completed":
    case "success":
      return "Completed";
    case "rejected":
    case "failed":
      return "Failed";
    default:
      return "Pending";
  }
};

export const getStatusIcon = (status: string): string => {
  switch (normalizeTransferStatus(status)) {
    case "Completed":
      return "CheckCircle";
    case "Failed":
      return "XCircle";
    default:
      return "Loader2";
  }
};

export const getStatusColor = (status: string): string => {
  switch (normalizeTransferStatus(status)) {
    case "Completed":
      return "from-green-400 to-emerald-500";
    case "Failed":
      return "from-red-400 to-rose-500";
    default:
      return "from-yellow-400 to-amber-500";
  }
};

export const filterTransfers = (
  transfers: any[],
  filters: FilterState,
): any[] => {
  return transfers.filter((transfer) => {
    // Filter by account type
    if (filters.accountTypes.length > 0) {
      const fromTypeMatch = filters.accountTypes.includes(
        transfer.fromAccount.accountType,
      );
      const toTypeMatch = filters.accountTypes.includes(
        transfer.toAccount.accountType,
      );
      if (!fromTypeMatch && !toTypeMatch) return false;
    }

    // Filter by status
    if (filters.statuses.length > 0) {
      if (!filters.statuses.includes(transfer.status)) return false;
    }

    // Filter by date range
    if (filters.dateFrom) {
      const transferDate = new Date(transfer.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (transferDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const transferDate = new Date(transfer.createdAt);
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (transferDate > toDate) return false;
    }

    return true;
  });
};
