import type {
  ColorScheme,
  TransactionApiData,
  Transaction,
} from "@/types/TransactionHistory.type";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const generateColorFromString = (value: string): ColorScheme => {
  let hash = 0;

  for (let i = 0; i < value?.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);

  return {
    color1: `hsl(${hue}, 70%, 58%)`,
    color2: `hsl(${(hue + 35) % 360}, 78%, 46%)`,
  };
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const buildMonthDays = (
  year: number,
  month: number,
): (Date | null)[] => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: getConfiguredTimezone(),
  });
};

const formatDateTime = (value: string | Date) => {
  const date = new Date(value);
  const timeZone = getConfiguredTimezone();

  return {
    formattedDate: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone,
    }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
    }),
  };
};

const formatTimeTaken = (value?: number | null): string => {
  if (!value || value <= 0) {
    return "Pending";
  }

  const totalMinutes = Math.floor(value / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d ${hours}h ${minutes}m`;
};

const buildDescription = (tx: any): string => {
  const rawType = String(tx?.type || "").toLowerCase();

  if (rawType === "deposit") {
    return "Deposit";
  }

  if (rawType === "withdrawal") {
    return "Withdrawal";
  }

  if (rawType === "transfer") {
    // Backend sends "Transfer to <mt5Account>" / "Transfer from <mt5Account>"
    // for the two legs of an internal transfer - keep that instead of
    // collapsing it to a bare "Transfer" with no from/to info.
    return tx?.description || "Transfer";
  }

  return tx?.type || "Unknown";
};

export const transformTransactionData = (
  apiData: TransactionApiData[] | { transactions: TransactionApiData[] },
): Transaction[] => {
  const transactions = Array.isArray(apiData)
    ? apiData
    : Array.isArray(apiData?.transactions)
      ? apiData.transactions
      : [];

  return transactions.map((tx: TransactionApiData, index: number) => {
    const sourceDate = tx.date || tx.createdAt || tx.approvedDate || new Date().toISOString();
    const { formattedDate, formattedTime } = formatDateTime(sourceDate);
    const normalizedType = String(tx.type || "Unknown");
    const normalizedStatus =
      tx.status === "Approved" || tx.status === "Completed"
        ? "Success"
        : tx.status === "Rejected" || tx.status === "Failed"
          ? "Failed"
          : "Pending";

    return {
      id: tx.id || `${normalizedType}-${index}`,
      date: formattedDate,
      rawDate: sourceDate,
      time: formattedTime,
      timetaken: formatTimeTaken(tx.timeTaken),
      type: normalizedType,
      description: buildDescription(tx),
      amount: Number(tx.rawAmount ?? tx.amount ?? 0),
      transactionType: tx.accountType || "N/A",
      account: String(tx.account || "N/A"),
      accountType: tx.accountType || "N/A",
      status: normalizedStatus,
      createdAt: tx.createdAt,
      approveDate: tx.approvedDate ?? tx.processedDate,
      processedDate: tx.processedDate ?? tx.approvedDate,
      details: tx.details || "",
    };
  });
};

export const exportToCSV = (
  transactions: Transaction[],
  filename: string = "transaction-history.csv",
) => {
  const headers = ["Date", "Time", "Description", "Account", "Amount", "Status"];

  const rows = transactions.map((tx) => [
    tx.date,
    tx.time,
    tx.description,
    tx.accountType,
    tx.amount,
    tx.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
