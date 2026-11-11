// frontend/src/utils/AccountListHelper.ts
import type {
  Account,
  AccountSummary,
  Transaction,
} from "@/types/Accountlist.type";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

// ✅ Format currency with $ sign
export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ✅ Format profit/loss with $ sign and +/- sign
export const formatProfitLoss = (value: number): string => {
  const formattedValue = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return value >= 0
    ? `+$${formattedValue}`
    : `-$${formattedValue}`;
};

export const calculateTimeTaken = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diff = now.getTime() - created.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} Days, ${hours} hours, ${minutes} Minutes ago`;
};

// ✅ Updated to return numbers, not formatted strings
export const calculateSummary = (accounts: Account[]): AccountSummary => {
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalEquity = accounts.reduce((sum, acc) => sum + (acc.equity || 0), 0);
  const totalProfitLoss = totalEquity - totalBalance;

  return {
    totalBalance,  // ✅ Number
    totalEquity,   // ✅ Number
    totalProfitLoss: formatProfitLoss(totalProfitLoss), // ✅ Formatted string with $
  };
};

export const calculateTransactionStats = (transactions: Transaction[]): any => {
  const deposits = transactions.filter((t) => t.type === "deposit");
  const withdrawals = transactions.filter((t) => t.type === "withdrawal");
  const transfers = transactions.filter((t) => t.type === "transfer");

  return {
    totalDeposits: deposits.reduce((sum, t) => sum + t.amount, 0),
    totalWithdrawals: withdrawals.reduce((sum, t) => sum + t.amount, 0),
    totalTransfers: transfers.reduce((sum, t) => sum + t.amount, 0),
  };
};

// ✅ Keep balance and equity as numbers
export const formatAccountData = (apiAccounts: any): Account[] => {
  return apiAccounts.map((acc: any, index: number) => ({
    id: index + 1,
    _id: acc._id,
    accountType: acc.accountType,
    accountNumber: acc.mt5Account,
    name: acc.name,
    platform: acc.platform,
    leverage: acc.leverage,
    balance: acc.balance || 0,  // ✅ Number - NO $ sign here
    equity: acc.equity || 0,    // ✅ Number - NO $ sign here
    profitLoss: formatProfitLoss((acc.equity || 0) - (acc.balance || 0)), // ✅ Formatted with $ and +/-
    status: acc.status ? "Active" : "Inactive",
    transactions: [],
    investorPassword: acc.investor_pwd,
    masterPassword: acc.master_pwd,
  }));
};

export const formatTransactionData = (
  apiTransactions: any[],
  accountNumber: string,
): Transaction[] => {
  const accountSpecificTx = apiTransactions.filter(
    (tx: any) => String(tx.account) === String(accountNumber),
  );

  return accountSpecificTx.map((tx: any, index: number) => {
    const type = String(tx.type || "").toLowerCase() as
      | "deposit"
      | "withdrawal"
      | "transfer";

    const rawAmount = Number(tx.rawAmount ?? tx.amount ?? 0);

    const signedAmount =
      type === "deposit" ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    return {
      id: index + 1,
      type,
      amount: signedAmount,
      date: new Date(tx.date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: getConfiguredTimezone(),
      }),
      timetaken: calculateTimeTaken(tx.createdAt ?? tx.date),
      status: (
        tx.status === "Approved" || tx.status === "Completed"
          ? "completed"
          : tx.status === "Pending" || tx.status === "pending"
            ? "pending"
            : "failed"
      ) as "completed" | "pending" | "failed",
      method: tx.description || "Bank Transfer",
    };
  });
};

export const formatDepositTransactionData = (
  apiDeposits: any[],
  accountNumber: string,
): Transaction[] => {
  const accountSpecificDeposits = apiDeposits.filter((deposit: any) => {
    const depositAccount =
      deposit.account?.mt5Account ??
      deposit.accountNumber ??
      deposit.account ??
      deposit.mt5Account;

    return String(depositAccount) === String(accountNumber);
  });

  return accountSpecificDeposits.map((deposit: any, index: number) => ({
    id: index + 1,
    type: "deposit" as const,
    amount: Math.abs(Number(deposit.amount ?? deposit.rawAmount ?? 0)),
    date: new Date(deposit.createdAt ?? deposit.dateInitiated ?? Date.now()).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: getConfiguredTimezone(),
    }),
    timetaken: calculateTimeTaken(deposit.createdAt ?? deposit.dateInitiated ?? new Date().toISOString()),
    status: (
      deposit.status === "Approved" || deposit.status === "Completed"
        ? "completed"
        : deposit.status === "Pending" || deposit.status === "pending"
          ? "pending"
          : "failed"
    ) as "completed" | "pending" | "failed",
    method:
      deposit.paymentMethod?.type === "bank"
        ? "Bank Account"
        : deposit.paymentMethod?.type === "crypto"
          ? "Crypto Wallet"
          : deposit.method || deposit.paymentType || "Deposit",
  }));
};

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return "ArrowDownLeft";
    case "withdrawal":
      return "ArrowUpRight";
    default:
      return "Activity";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const getAccountTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    BASIC: "from-blue-400 to-indigo-500",
    PRIME: "from-purple-400 to-pink-500",
    ALPHA: "from-gray-400 to-slate-500",
    PROEDGE: "from-yellow-400 to-orange-500",
    INFINITY: "from-green-400 to-emerald-500",
  };
  return colors[type] || "from-blue-400 to-indigo-500";
};
