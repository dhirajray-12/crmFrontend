// src/hooks/useRealtimeSync.ts
import { useEffect, useCallback, useMemo, useRef } from "react";
import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { DashboardData } from "@/types/dashboard.types";
import type { DepositData } from "@/types/depositePage.types";
import { mapDepositToDepositData } from "@/services/DepositPage.service";
import type { Transfer } from "@/types/transfer.types";
import { useAuthStore } from "@/Store/auth.store";
import { useToastStore } from "@/Store/toast.store";
import { getSocketServerUrl } from "@/utils/socketUrl";
import { subscribeToClientRealtime } from "@/lib/clientRealtimeSocket";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface RealtimeSyncOptions {
  enabled?: boolean;
  events?: string[];
  onEvent?: (event: string, data: any) => void;
  onStatusChange?: (
    status:
      | "idle"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "disconnected"
      | "failed",
    details?: { message?: string },
  ) => void;
}

const ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS = [
  "accountTransactions",
  "accountActivity",
  "transactionsExport",
  "performanceData",
];

const invalidateExactQueries = (queryClient: QueryClient, keys: string[]) => {
  keys.forEach((key) => {
    queryClient.invalidateQueries({
      queryKey: [key],
      exact: false,
      refetchType: "active",
    });
  });
};

const parseAmount = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const formatAmount = (value: number): string => value.toFixed(2);

const isApprovedStatus = (value?: string) =>
  ["approved", "completed", "success"].includes(
    String(value || "").trim().toLowerCase(),
  );

const getDepositIdentity = (deposit: Partial<DepositData>) =>
  String(
    deposit.id ??
      deposit._id ??
      `${deposit.createdAt || deposit.dateInitiated}-${deposit.amount}-${deposit.method}`,
  );

const upsertDepositList = (
  previous: DepositData[] | undefined,
  nextDeposit: DepositData,
): DepositData[] => {
  if (!Array.isArray(previous) || previous.length === 0) {
    return [nextDeposit];
  }

  const nextIdentity = getDepositIdentity(nextDeposit);
  let found = false;

  const updated = previous.map((item) => {
    if (getDepositIdentity(item) !== nextIdentity) {
      return item;
    }

    found = true;
    return {
      ...item,
      ...nextDeposit,
    };
  });

  return found ? updated : [nextDeposit, ...updated];
};

const patchDashboardDepositMetrics = (
  previous: DashboardData | undefined,
  depositAmount: number,
  wasApproved: boolean,
  isNowApproved: boolean,
) => {
  if (!previous || wasApproved === isNowApproved || depositAmount <= 0) {
    return previous;
  }

  const direction = isNowApproved ? 1 : -1;
  const totalDeposits =
    parseAmount(previous.totalDeposits) + depositAmount * direction;
  const netCashFlow =
    parseAmount(previous.netCashFlow ?? previous.totalDeposits) +
    depositAmount * direction;
  const totalTransactions =
    (previous.totalTransactions ?? 0) + (isNowApproved ? 1 : -1);

  return {
    ...previous,
    totalDeposits: formatAmount(Math.max(0, totalDeposits)),
    netCashFlow: formatAmount(netCashFlow),
    totalTransactions: Math.max(0, totalTransactions),
  };
};

const patchDashboardWithdrawalMetrics = (
  previous: DashboardData | undefined,
  withdrawalAmount: number,
  wasApproved: boolean,
  isNowApproved: boolean,
) => {
  if (!previous || wasApproved === isNowApproved || withdrawalAmount <= 0) {
    return previous;
  }

  const direction = isNowApproved ? 1 : -1;
  const totalWithdrawals =
    parseAmount(previous.totalWithdrawals) + withdrawalAmount * direction;
  // Withdrawal reduces balance; direction=1 means now approved → subtract
  const totalBalance =
    parseAmount(previous.totalBalance) - withdrawalAmount * direction;
  const netBalance =
    parseAmount(previous.netBalance ?? previous.totalBalance) - withdrawalAmount * direction;
  const netCashFlow =
    parseAmount(previous.netCashFlow ?? 0) - withdrawalAmount * direction;
  const totalTransactions =
    (previous.totalTransactions ?? 0) + (isNowApproved ? 1 : -1);

  return {
    ...previous,
    totalWithdrawals: formatAmount(Math.max(0, totalWithdrawals)),
    totalBalance: formatAmount(Math.max(0, totalBalance)),
    netBalance: formatAmount(Math.max(0, netBalance)),
    netCashFlow: formatAmount(netCashFlow),
    totalTransactions: Math.max(0, totalTransactions),
  };
};

const getRealtimeAccountLabel = (value: any) =>
  String(
    value?.mt5Account ||
      value?.accountNumber ||
      value?.login ||
      value?.account ||
      value ||
      "N/A",
  );

const formatCurrencyAmount = (value: unknown) =>
  `$${formatAmount(parseAmount(value))}`;

const mapRealtimeAccountListItem = (account: any) => ({
  _id: account?._id ?? account?.id,
  mt5Account: String(
    account?.mt5Account || account?.accountNumber || account?.login || "",
  ),
  accountNumber: String(
    account?.mt5Account || account?.accountNumber || account?.login || "N/A",
  ),
  balance: parseAmount(account?.balance),
  equity: parseAmount(account?.equity),
  leverage: account?.leverage,
  accountType: account?.accountType,
  groupName: account?.groupName || "",
  platform: account?.platform || "MT5",
  status: account?.status,
  createdAt: account?.createdAt,
});

const mapRealtimeAvailableBalance = (account: any) => {
  const normalized = mapRealtimeAccountListItem(account);

  return {
    _id: normalized._id,
    account: normalized.mt5Account,
    balance: formatCurrencyAmount(normalized.balance),
    accountType: normalized.accountType,
    accountNumber: normalized.accountNumber,
    rawBalance: normalized.balance,
  };
};

const mapRealtimeWithdrawalAccount = (account: any) => {
  const normalized = mapRealtimeAvailableBalance(account);

  return {
    ...normalized,
    color: "",
  };
};

const mapRealtimeWithdrawal = (withdrawal: any) => {
  const processedAt =
    withdrawal?.approvedDate ??
    withdrawal?.approvedAt ??
    withdrawal?.rejectedDate ??
    withdrawal?.rejectedAt ??
    withdrawal?.updatedAt;

  const timeZone = getConfiguredTimezone();

  return {
    id: withdrawal?._id ?? withdrawal?.id,
    rawDate: withdrawal?.createdAt
      ? new Date(withdrawal.createdAt).toLocaleDateString("en-CA", { timeZone })
      : "",
    dateInitiated: withdrawal?.createdAt
      ? new Date(withdrawal.createdAt).toLocaleDateString(undefined, { timeZone })
      : "",
    initiatedtime: withdrawal?.createdAt
      ? new Date(withdrawal.createdAt).toLocaleTimeString(undefined, { timeZone })
      : "",
    processedtime: processedAt
      ? new Date(processedAt).toLocaleTimeString(undefined, { timeZone })
      : "",
    processedDate: processedAt
      ? new Date(processedAt).toLocaleDateString(undefined, { timeZone })
      : "",
    method:
      withdrawal?.paymentMethod === "bank"
        ? "Bank Transfer"
        : `E-Wallet (${withdrawal?.eWalletDetails?.type || ""})`,
    amount: formatCurrencyAmount(withdrawal?.amount),
    account: getRealtimeAccountLabel(
      withdrawal?.accountNumber || withdrawal?.account,
    ),
    accounttype:
      withdrawal?.accountType ||
      withdrawal?.account?.accountType ||
      withdrawal?.type ||
      "N/A",
    status: withdrawal?.status || "Pending",
    timetaken: processedAt && withdrawal?.createdAt ? "Updated just now" : "-",
  };
};

const mapRealtimeTransactionRow = (
  kind: "deposit" | "withdrawal",
  payload: any,
) => {
  const sourceDate =
    payload?.createdAt ||
    payload?.date ||
    payload?.approvedDate ||
    payload?.updatedAt ||
    new Date().toISOString();
  const processedAt =
    payload?.approvedDate ??
    payload?.approvedAt ??
    payload?.processedDate ??
    payload?.rejectedDate ??
    payload?.rejectedAt ??
    payload?.updatedAt;
  const rawStatus = String(payload?.status || "Pending").toLowerCase();

  return {
    id: payload?._id ?? payload?.id,
    date: new Date(sourceDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: getConfiguredTimezone(),
    }),
    rawDate: sourceDate,
    time: new Date(sourceDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: getConfiguredTimezone(),
    }),
    timetaken:
      processedAt && payload?.createdAt
        ? "Updated just now"
        : rawStatus === "approved" || rawStatus === "completed"
          ? "Instant"
          : "Pending",
    type: kind,
    description: kind === "deposit" ? "Deposit" : "Withdrawal",
    amount: parseAmount(payload?.rawAmount ?? payload?.amount),
    transactionType:
      payload?.accountType ||
      payload?.account?.accountType ||
      payload?.type ||
      "N/A",
    account: getRealtimeAccountLabel(payload?.accountNumber || payload?.account),
    accountType:
      payload?.accountType ||
      payload?.account?.accountType ||
      payload?.type ||
      "N/A",
    status:
      rawStatus === "approved" || rawStatus === "completed"
        ? "Success"
        : rawStatus === "rejected" || rawStatus === "failed"
          ? "Failed"
          : "Pending",
    createdAt: payload?.createdAt,
    approveDate: payload?.approvedDate ?? payload?.processedDate,
    processedDate: payload?.processedDate ?? payload?.approvedDate,
    details:
      payload?.paymentMethod?.type ||
      payload?.paymentType ||
      payload?.method ||
      "",
  };
};

const upsertTransferList = (
  previous: Transfer[] | undefined,
  nextTransfer: Transfer,
): Transfer[] => {
  if (!Array.isArray(previous) || previous.length === 0) {
    return [nextTransfer];
  }

  let found = false;
  const updated = previous.map((item) => {
    if (String(item._id) !== String(nextTransfer._id)) {
      return item;
    }

    found = true;
    return {
      ...item,
      ...nextTransfer,
    };
  });

  return found ? updated : [nextTransfer, ...updated];
};

const getTradeTicketId = (trade: any) =>
  String(trade?.ticketNumber ?? trade?.ticket ?? "");

const upsertTradeList = (previous: any[] | undefined, nextTrade: any): any[] => {
  if (!Array.isArray(previous) || previous.length === 0) {
    return [nextTrade];
  }

  const nextId = getTradeTicketId(nextTrade);
  let found = false;
  const updated = previous.map((item) => {
    if (getTradeTicketId(item) !== nextId) {
      return item;
    }

    found = true;
    return { ...item, ...nextTrade };
  });

  return found ? updated : [nextTrade, ...updated];
};

const removeTradeFromList = (previous: any[] | undefined, ticketId: string): any[] => {
  if (!Array.isArray(previous)) {
    return previous ?? [];
  }

  return previous.filter((item) => getTradeTicketId(item) !== ticketId);
};

export const useRealtimeSync = (options: RealtimeSyncOptions = {}) => {
  const { enabled = true, events = [], onEvent, onStatusChange } = options;
  const userId = useAuthStore((state) => state.user?._id);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const activeRole = useAuthStore(
    (state) => state.activeRole ?? state.user?.role ?? undefined,
  );
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const serverUrl = getSocketServerUrl();
  const onEventRef = useRef(onEvent);
  const onStatusChangeRef = useRef(onStatusChange);
  const lastStatusRef = useRef<{
    status:
      | "idle"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "disconnected"
      | "failed";
    message?: string;
  } | null>(null);
  const customEvents = useMemo(() => [...new Set(events)].sort(), [events]);
  const customEventsKey = customEvents.join("|");

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const patchDepositCaches = useCallback(
    (data: { id: string; data: any; previousStatus?: string }) => {
      if (!data?.data) return;

      const mappedDeposit = mapDepositToDepositData(data.data);
      const amount = parseAmount(data.data.amount ?? mappedDeposit.amount);
      const wasApproved = isApprovedStatus(data.previousStatus);
      const isNowApproved = isApprovedStatus(data.data.status);

      queryClient.setQueryData(["deposit", data.id], mappedDeposit);

      queryClient.setQueryData(["deposits"], (old: DepositData[] | undefined) =>
        upsertDepositList(old, mappedDeposit),
      );

      queryClient.setQueryData(
        ["dashboardData"],
        (old: DashboardData | undefined) =>
          patchDashboardDepositMetrics(old, amount, wasApproved, isNowApproved),
      );

      queryClient.setQueryData(["transactions"], (old: any) => {
        const nextTransaction = mapRealtimeTransactionRow("deposit", data.data);

        if (!Array.isArray(old) || old.length === 0) {
          return [nextTransaction];
        }

        let found = false;
        const updated = old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          found = true;
          return {
            ...item,
            ...nextTransaction,
          };
        });

        return found ? updated : [nextTransaction, ...updated];
      });
    },
    [queryClient],
  );

  const patchWithdrawalCaches = useCallback(
    (data: { id: string; data: any }) => {
      if (!data?.data) return;

      const mappedWithdrawal = mapRealtimeWithdrawal(data.data);
      const previousWithdrawal =
        queryClient
          .getQueryData<any[]>(["withdrawals"])
          ?.find((item) => String(item?.id ?? item?._id) === String(data.id)) ??
        queryClient.getQueryData<any>(["withdrawal", data.id]);
      const wasApproved = isApprovedStatus(previousWithdrawal?.status);
      const isNowApproved = isApprovedStatus(data.data?.status);
      const amount = parseAmount(data.data?.amount ?? mappedWithdrawal.amount);

      queryClient.setQueryData(["withdrawal", data.id], mappedWithdrawal);

      queryClient.setQueryData(["withdrawals"], (old: any) => {
        if (!Array.isArray(old) || old.length === 0) {
          return [mappedWithdrawal];
        }

        let found = false;
        const updated = old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          found = true;
          return {
            ...item,
            ...mappedWithdrawal,
          };
        });

        return found ? updated : [mappedWithdrawal, ...updated];
      });

      queryClient.setQueryData(
        ["dashboardData"],
        (old: DashboardData | undefined) =>
          patchDashboardWithdrawalMetrics(old, amount, wasApproved, isNowApproved),
      );

      queryClient.setQueryData(["transactions"], (old: any) => {
        const nextTransaction = mapRealtimeTransactionRow(
          "withdrawal",
          data.data,
        );

        if (!Array.isArray(old) || old.length === 0) {
          return [nextTransaction];
        }

        let found = false;
        const updated = old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          found = true;
          return {
            ...item,
            ...nextTransaction,
          };
        });

        return found ? updated : [nextTransaction, ...updated];
      });
    },
    [queryClient],
  );

  const patchAccountCaches = useCallback(
    (data: { id: string; data: any; action?: string }) => {
      if (!data?.data) return;

      const accountsCache = queryClient.getQueryData<any[]>(["accounts"]);
      const previousAccount =
        accountsCache?.find(
          (item) => String(item?._id ?? item?.id) === String(data.id),
        ) ?? queryClient.getQueryData<any>(["account", data.id]);

      const normalizedAccount = mapRealtimeAccountListItem(data.data);
      const normalizedAvailableBalance = mapRealtimeAvailableBalance(data.data);
      const normalizedWithdrawalAccount = mapRealtimeWithdrawalAccount(data.data);

      // Only calculate delta when we have a reliable previous value.
      // If previous is unknown, skip the dashboard patch — the cache_invalidate
      // refetch will bring the correct totals from the server.
      const hasPreviousBalance = previousAccount != null;
      const balanceDelta = hasPreviousBalance
        ? parseAmount(normalizedAccount.balance) - parseAmount(previousAccount.balance)
        : 0;
      const equityDelta = hasPreviousBalance
        ? parseAmount(normalizedAccount.equity) - parseAmount(previousAccount.equity)
        : 0;

      queryClient.setQueryData(["account", data.id], normalizedAccount);

      queryClient.setQueryData(["accounts"], (old: any) => {
        if (!Array.isArray(old)) {
          return old;
        }

        let found = false;
        const updated = old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          found = true;
          return {
            ...item,
            ...normalizedAccount,
          };
        });

        return found ? updated : old;
      });

      queryClient.setQueryData(["availableBalances"], (old: any) => {
        if (!Array.isArray(old)) {
          return old;
        }

        return old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          return {
            ...item,
            ...normalizedAvailableBalance,
          };
        });
      });

      queryClient.setQueryData(["withdrawalAccounts"], (old: any) => {
        if (!Array.isArray(old)) {
          return old;
        }

        return old.map((item: any) => {
          const itemId = item?._id ?? item?.id;
          if (String(itemId) !== String(data.id)) {
            return item;
          }

          return {
            ...item,
            ...normalizedWithdrawalAccount,
          };
        });
      });

      // Apply delta to dashboard totals only when we had a known previous balance
      if (hasPreviousBalance && (balanceDelta !== 0 || equityDelta !== 0)) {
        queryClient.setQueryData(
          ["dashboardData"],
          (old: DashboardData | undefined) => {
            if (!old) return old;

            return {
              ...old,
              totalBalance: formatAmount(
                Math.max(0, parseAmount(old.totalBalance) + balanceDelta),
              ),
              totalEquity: formatAmount(
                Math.max(0, parseAmount(old.totalEquity) + equityDelta),
              ),
              netBalance: formatAmount(
                Math.max(0, parseAmount(old.netBalance) + balanceDelta),
              ),
            };
          },
        );
      }
    },
    [queryClient],
  );

  const patchTransferCaches = useCallback(
    (data: { id: string; data: Transfer }) => {
      if (!data?.data) return;

      queryClient.setQueryData(["transfer", data.id], data.data);

      queryClient.setQueriesData(
        { queryKey: ["transfers"], exact: false },
        (old: Transfer[] | undefined) => upsertTransferList(old, data.data),
      );

      if (data.data.fromAccount?._id) {
        patchAccountCaches({
          id: data.data.fromAccount._id,
          data: data.data.fromAccount,
        });
      }

      if (data.data.toAccount?._id) {
        patchAccountCaches({
          id: data.data.toAccount._id,
          data: data.data.toAccount,
        });
      }
    },
    [patchAccountCaches, queryClient],
  );

  // Position opened/closed pushed straight from placeTrade/closeTrade (see
  // liveTradingController.js's io.emitEntityUpdate calls) - patches
  // ["tradingData"] directly with the actual trade, so every open tab/
  // device for this user sees it with zero extra HTTP round trip, rather
  // than only reacting to a generic "go refetch" cache_invalidate signal.
  const patchTradeOpenedCache = useCallback(
    (data: { id: string | number; data: any }) => {
      if (!data?.data) return;

      queryClient.setQueryData(["tradingData"], (old: any) => {
        if (!old) return old;
        return { ...old, openTrades: upsertTradeList(old.openTrades, data.data) };
      });
    },
    [queryClient],
  );

  const patchTradeClosedCache = useCallback(
    (data: { id: string | number; data: any }) => {
      const ticketId = String(data?.id ?? getTradeTicketId(data?.data));
      if (!ticketId) return;

      queryClient.setQueryData(["tradingData"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          openTrades: removeTradeFromList(old.openTrades, ticketId),
          // data.data carries a best-effort closed-trade record built from
          // the position's last-known state (see closeTrade) - upsert it so
          // History shows the trade immediately; tradeSyncService's own DB
          // sync overwrites it with the exact final figures on its normal
          // cycle (same ticket id, so it replaces rather than duplicates).
          closedTrades: data?.data?.closeTime
            ? upsertTradeList(old.closedTrades, data.data)
            : old.closedTrades,
        };
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!enabled || !isInitialized || !userId) {
      onStatusChangeRef.current?.("idle");
      lastStatusRef.current = { status: "idle" };
      return;
    }

    const identity = { userId, serverUrl, activeRole };

    const publishStatus = (
      status:
        | "idle"
        | "connecting"
        | "connected"
        | "reconnecting"
        | "disconnected"
        | "failed",
      details?: { message?: string },
    ) => {
      const previous = lastStatusRef.current;
      if (
        previous?.status === status &&
        previous?.message === details?.message
      ) {
        return;
      }

      lastStatusRef.current = { status, message: details?.message };
      onStatusChangeRef.current?.(status, details);
    };

    publishStatus("connecting");

      const handleCacheInvalidate = (data: {
      keys: string[];
      timestamp: string;
      global?: boolean;
    }) => {
      if (data?.keys?.length) {
        const expandedKeys = new Set(data.keys);

        if (
          data.keys.some((key) =>
            ["transactions", "accountTransactions", "accountActivity"].includes(
              key,
            ),
          )
        ) {
          ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS.forEach((key) =>
            expandedKeys.add(key),
          );
        }

        invalidateExactQueries(queryClient, Array.from(expandedKeys));
      }

      onEventRef.current?.("cache_invalidate", data);
    };

    const handleDepositUpdated = (data: {
      id: string;
      data: any;
      previousStatus?: string;
    }) => {
      patchDepositCaches(data);

        invalidateExactQueries(queryClient, [
        ...ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS,
        "accounts",
        "myAccountsList",
        "availableBalances",
        "withdrawalAccounts",
        "performanceData",
      ]);

      onEventRef.current?.("deposit_updated", data);
    };

    const handleWithdrawalUpdated = (data: {
      id: string;
      data: any;
    }) => {
      patchWithdrawalCaches(data);

      invalidateExactQueries(queryClient, [
        ...ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS,
        "accounts",
        "myAccountsList",
        "availableBalances",
        "withdrawalAccounts",
        "dashboardData",
        "partner",
        "performanceData",
      ]);

      onEventRef.current?.("withdrawal_updated", data);
    };

    const handleAccountUpdated = (data: {
      id: string;
      data: any;
      action?: string;
    }) => {
      patchAccountCaches(data);

      invalidateExactQueries(queryClient, [
        "transfers",
        "transactions",
        ...ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS,
        "dashboard",
        "dashboardData",
        "performanceData",
        // patchAccountCaches only in-place-patches ["accounts"] (the raw
        // shape) — ["myAccountsList"] caches an already-formatted shape
        // with different field names, so it can't be safely merged the
        // same way. Invalidate it instead so the My Accounts page still
        // picks up live balance/equity changes, just via a refetch rather
        // than an instant in-place patch.
        "myAccountsList",
      ]);

      onEventRef.current?.("account_updated", data);
    };

    const handleTransferUpdated = (data: { id: string; data: Transfer }) => {
      patchTransferCaches(data);

      invalidateExactQueries(queryClient, [
        "transactions",
        ...ACCOUNT_ACTIVITY_RELATED_QUERY_KEYS,
        "dashboard",
        "dashboardData",
        "performanceData",
        // patchTransferCaches patches ["accounts"] via patchAccountCaches
        // for both sides of the transfer, but that can't safely reach
        // ["myAccountsList"]'s differently-shaped cache — see the comment
        // in handleAccountUpdated above.
        "myAccountsList",
      ]);

      onEventRef.current?.("transfer_updated", data);
    };

    const handleCommissionUpdated = (data: any) => {
      invalidateExactQueries(queryClient, [
        "commission",
        "partners",
        "partner",
        "dashboard",
        "ibConfig",
        "ib_dashboard",
      ]);

      onEventRef.current?.("commission_updated", data);
    };

    const handleTradeOpened = (data: { id: string | number; data: any }) => {
      patchTradeOpenedCache(data);
      onEventRef.current?.("trade_opened", data);
    };

    const handleTradeClosed = (data: { id: string | number; data: any }) => {
      patchTradeClosedCache(data);
      onEventRef.current?.("trade_closed", data);
    };

    // SL/TP change on an already-open position (see modifyTrade) - same
    // upsert-by-ticket merge as a fresh open, so this just updates the
    // existing row's stopLoss/takeProfit in place.
    const handleTradeUpdated = (data: { id: string | number; data: any }) => {
      patchTradeOpenedCache(data);
      onEventRef.current?.("trade_updated", data);
    };

    const handleAppSettingsUpdated = (data: any) => {
      invalidateExactQueries(queryClient, ["appSettings"]);
      invalidateExactQueries(queryClient, ["publicPlatformStatus"]);
      invalidateExactQueries(queryClient, ["billingSuspension"]);

      if (data?.currentState || data?.serverName || data?.theme) {
        queryClient.setQueryData(["publicPlatformStatus"], (current: any) => ({
          ...(current || {}),
          serverName: data?.serverName ?? current?.serverName,
          currentState: data?.currentState ?? current?.currentState,
          theme: data?.theme ?? current?.theme,
        }));
      }
      onEventRef.current?.("app_settings_updated", data);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);
      publishStatus("failed", {
        message: error?.message || "Connection failed",
      });
      addToast("error", "Real-time connection failed. Retrying...");
    };

    const handleConnect = () => {
      publishStatus("connected");
    };

    const handleDisconnect = (reason?: string) => {
      publishStatus("disconnected", {
        message: reason || "Disconnected from realtime server",
      });
    };

    const handleReconnectAttempt = (attempt?: number) => {
      publishStatus("reconnecting", {
        message:
          typeof attempt === "number"
            ? `Retry attempt ${attempt}`
            : "Retrying realtime connection",
      });
    };

    const unsubscribers = [
      subscribeToClientRealtime(identity, "connect", () => handleConnect()),
      subscribeToClientRealtime(identity, "disconnect", (reason) =>
        handleDisconnect(reason),
      ),
      subscribeToClientRealtime(identity, "reconnect_attempt", (attempt) =>
        handleReconnectAttempt(attempt),
      ),
      subscribeToClientRealtime(identity, "cache_invalidate", (data) =>
        handleCacheInvalidate(data),
      ),
      subscribeToClientRealtime(identity, "deposit_updated", (data) =>
        handleDepositUpdated(data),
      ),
      subscribeToClientRealtime(identity, "withdrawal_updated", (data) =>
        handleWithdrawalUpdated(data),
      ),
      subscribeToClientRealtime(identity, "transfer_updated", (data) =>
        handleTransferUpdated(data),
      ),
      subscribeToClientRealtime(identity, "account_updated", (data) =>
        handleAccountUpdated(data),
      ),
      subscribeToClientRealtime(identity, "commission_updated", (data) =>
        handleCommissionUpdated(data),
      ),
      subscribeToClientRealtime(identity, "trade_opened", (data) =>
        handleTradeOpened(data),
      ),
      subscribeToClientRealtime(identity, "trade_closed", (data) =>
        handleTradeClosed(data),
      ),
      subscribeToClientRealtime(identity, "trade_updated", (data) =>
        handleTradeUpdated(data),
      ),
      subscribeToClientRealtime(identity, "app_settings_updated", (data) =>
        handleAppSettingsUpdated(data),
      ),
      subscribeToClientRealtime(identity, "connect_error", (error) =>
        handleConnectError(error),
      ),
    ];

    const customUnsubscribers: Array<() => void> = [];

    customEvents.forEach((event) => {
      const builtInEvents = [
        "cache_invalidate",
        "deposit_updated",
        "withdrawal_updated",
        "transfer_updated",
        "account_updated",
        "commission_updated",
        "app_settings_updated",
        "trade_opened",
        "trade_closed",
        "trade_updated",
      ];

      if (builtInEvents.includes(event)) return;

      const handler = (data: any) => {
        onEventRef.current?.(event, data);
      };

      customUnsubscribers.push(
        subscribeToClientRealtime(identity, event, (data) => handler(data)),
      );
    });

    return () => {
      publishStatus("idle");
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      customUnsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    enabled,
    isInitialized,
    userId,
    serverUrl,
    activeRole,
    customEventsKey,
    queryClient,
    addToast,
    patchDepositCaches,
    patchWithdrawalCaches,
    patchTransferCaches,
    patchAccountCaches,
    patchTradeOpenedCache,
    patchTradeClosedCache,
  ]);
};
