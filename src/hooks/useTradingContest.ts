import { useState, useEffect, useCallback } from "react";
import type { Trade, TradeApiData, TradeCounts } from "@/types/TradingContest.types";
import { tradingApi } from "@/services/TradingContest.service";
import {
  transformTradeData,
  filterTrades,
} from "@/utils/TradingContest.Helper";
import { useAuthStore } from "@/Store/auth.store";
import { getSocketServerUrl } from "@/utils/socketUrl";
import { subscribeToClientRealtime } from "@/lib/clientRealtimeSocket";

const CLOSED_TRADES_PER_PAGE = 10;

export const useTrades = (initialType: "open" | "closed" = "open") => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [filterType, setFilterType] = useState<"open" | "closed">(initialType);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<TradeCounts>({ open: 0, closed: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const userId = useAuthStore((state) => state.user?._id);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const activeRole = useAuthStore(
    (state) => state.activeRole ?? state.user?.role ?? undefined,
  );
  const serverUrl = getSocketServerUrl();

  const fetchTrades = useCallback(
    async (type: "open" | "closed", page: number = 1) => {
      try {
        setLoading(true);
        setError(null);

        const result = await tradingApi.fetchTrades(
          type,
          type === "closed"
            ? {
                page,
                limit: CLOSED_TRADES_PER_PAGE,
              }
            : undefined,
        );

        if (result.success) {
          const tradesData = result.data.trades || [];
          const formattedTrades = tradesData.map((trade) =>
            transformTradeData(trade, type),
          );

          setTrades(formattedTrades);

          if (type === "open") {
            setCounts((prev) => ({
              ...prev,
              open: result.data.total ?? tradesData.length,
            }));
            setCurrentPage(1);
            setTotalPages(1);
            setTotalItems(tradesData.length);
          } else {
            const pagination = result.data.pagination;
            const closedTotal = result.data.total ?? tradesData.length;

            setCounts((prev) => ({
              ...prev,
              closed: closedTotal,
            }));
            setCurrentPage(pagination?.page ?? page);
            setTotalPages(Math.max(pagination?.pages ?? 1, 1));
            setTotalItems(closedTotal);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch trades");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchCounts = useCallback(async () => {
    const counts = await tradingApi.fetchTradeCounts();
    setCounts(counts);
  }, []);

  const refresh = useCallback(() => {
    setSearchQuery("");
    const nextPage = filterType === "closed" ? currentPage : 1;
    fetchTrades(filterType, nextPage);
    fetchCounts();
  }, [currentPage, fetchCounts, filterType, fetchTrades]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    if (filterType === "closed") {
      fetchTrades(filterType, currentPage);
      return;
    }

    fetchTrades(filterType, 1);
  }, [currentPage, filterType, fetchTrades]);

  useEffect(() => {
    if (filterType === "open" && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, filterType]);

  useEffect(() => {
    setFilteredTrades(filterTrades(trades, searchQuery));
  }, [trades, searchQuery]);

  // Real-time open-position push (services/mt5TradeWebSocketService.js's
  // "open_trades_updated") - covers trades placed straight in MT5, not just
  // ones made through this app, which a plain REST refetch would otherwise
  // only pick up on the next manual refresh/poll. Only the Open tab cares
  // about this; Closed trades still come from the paginated REST endpoint.
  useEffect(() => {
    if (!isInitialized || !userId || filterType !== "open") return;

    const identity = { userId, serverUrl, activeRole };
    const unsubscribe = subscribeToClientRealtime(
      identity,
      "open_trades_updated",
      (payload: { trades: TradeApiData[] }) => {
        const tradesData = payload?.trades || [];
        const formattedTrades = tradesData.map((trade) =>
          transformTradeData(trade, "open"),
        );

        setTrades(formattedTrades);
        setCounts((prev) => ({ ...prev, open: tradesData.length }));
        setCurrentPage(1);
        setTotalPages(1);
        setTotalItems(tradesData.length);
      },
    );

    return unsubscribe;
  }, [isInitialized, userId, serverUrl, activeRole, filterType]);

  // Real-time close push (same "trade_closed" event placeTradeCore/
  // closeTradeCore already emit for actions made through this app - see
  // liveTradingController.js - now also fired by mt5TradeWebSocketService.js
  // the moment a position disappears from the live MT5 feed, so a close
  // made directly in MT5 shows up here within seconds instead of waiting on
  // tradeSyncService's own ~30s DB sync cycle). The closed trade's own
  // fields (an estimate from the position's last-known P&L - see the
  // backend's own comment on emitClosedTrade) get replaced with the exact
  // settled figures once that DB sync lands and this page's next
  // fetch/refresh reads them.
  useEffect(() => {
    if (!isInitialized || !userId) return;

    const identity = { userId, serverUrl, activeRole };
    const unsubscribe = subscribeToClientRealtime(
      identity,
      "trade_closed",
      (payload: { data: TradeApiData }) => {
        const closed = payload?.data;
        if (!closed) return;

        setCounts((prev) => ({ ...prev, closed: prev.closed + 1 }));

        // Open tab already drops it via the next open_trades_updated push;
        // only page 1 of Closed can cleanly gain a row without breaking
        // this page's own pagination against the REST source of truth.
        if (filterType !== "closed" || currentPage !== 1) return;

        const ticketId = String(closed.ticket ?? closed.ticketNumber ?? "");
        setTrades((prev) => [
          transformTradeData(closed, "closed"),
          ...prev.filter((t) => String(t.id) !== ticketId),
        ]);
        setTotalItems((prev) => prev + 1);
      },
    );

    return unsubscribe;
  }, [isInitialized, userId, serverUrl, activeRole, filterType, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage((prev) => {
      const nextPage = Math.max(1, Math.min(page, totalPages));
      return prev === nextPage ? prev : nextPage;
    });
  }, [totalPages]);

  const handleFilterTypeChange = useCallback((type: "open" | "closed") => {
    setFilterType(type);
    setSearchQuery("");
    setCurrentPage(1);
  }, []);

  return {
    trades,
    filteredTrades,
    filterType,
    searchQuery,
    loading,
    error,
    counts,
    currentPage,
    totalPages,
    totalItems,
    setFilterType: handleFilterTypeChange,
    setSearchQuery,
    setCurrentPage: handlePageChange,
    refresh,
  };
};
