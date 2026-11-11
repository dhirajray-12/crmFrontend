export const ACCOUNT_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
} as const;

export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  TRANSFER: "transfer",
} as const;

export const TRANSACTION_STATUS = {
  COMPLETED: "completed",
  PENDING: "pending",
  FAILED: "failed",
} as const;

export const ITEMS_PER_PAGE = 5;

export const ACCOUNT_COLORS = {
  deposit: "from-green-400 to-emerald-500",
  withdrawal: "from-red-400 to-rose-500",
  transfer: "from-blue-400 to-indigo-500",
  active: "bg-green-100 text-green-600",
  inactive: "bg-red-100 text-red-600",
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
} as const;
