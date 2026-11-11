import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bitcoin,
  ChevronRight,
  CircleDollarSign,
  Flame,
  DollarSign,
  Eye,
  Gem,
  Globe2,
  Link2Off,
  Loader2,
  TrendingUp,
  Users,
  Wallet,
  Radio,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Type definitions
interface Stats {
  totalCopiers: number;
  totalInvestment: number;
  totalProfit: number;
  commissionPaid: number;
}

interface Copier {
  id: number;
  account: string;
  balance: number;
  profit: number;
  commissionPaid: number;
  joinedDate: string;
  equity?: number;
}

interface Master {
  id: number;
  name: string;
  account: string;
  commission: number;
  profit: number;
  started: string;
  commissionPaid: number;
  noCopiers: number;
  copiers: Copier[];
}

interface Trade {
  id: number;
  symbol: string;
  symbolName?: string;
  type: "BUY" | "SELL";
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  openTime: string;
}

interface CopierDetailsResponse {
  login?: string | number;
  mt5Account?: string | number;
  balance?: number | string;
  equity?: number | string;
  totalProfit?: number | string;
  profit?: number | string;
  totalMasterCommission?: number | string;
  commissionPaid?: number | string;
  status?: string;
  created_at?: string;
  joinedDate?: string;
  [key: string]: unknown;
}

interface SelectedCopier extends Copier {
  masterAccount: string;
  status?: string;
}

type View = "main" | "copiers" | "trades";

// API Service
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  "x-active-role": sessionStorage.getItem("active_role") || "",
});

const SYMBOL_METADATA: Record<
  string,
  {
    label: string;
    subtitle: string;
    icon: LucideIcon;
    accent: string;
  }
> = {
  EURUSD: {
    label: "EUR / USD",
    subtitle: "Euro vs US Dollar",
    icon: Globe2,
    accent: "from-accent/25 to-blue-500/15 text-accent border-accent/20",
  },
  GBPUSD: {
    label: "GBP / USD",
    subtitle: "British Pound vs US Dollar",
    icon: Globe2,
    accent: "from-indigo-500/25 to-accent-hover/15 text-indigo-100 border-indigo-300/20",
  },
  USDJPY: {
    label: "USD / JPY",
    subtitle: "US Dollar vs Japanese Yen",
    icon: Globe2,
    accent: "from-accent/25 to-teal-500/15 text-accent border-accent/20",
  },
  USDCHF: {
    label: "USD / CHF",
    subtitle: "US Dollar vs Swiss Franc",
    icon: Globe2,
    accent: "from-emerald-500/25 to-accent-hover/15 text-emerald-100 border-emerald-300/20",
  },
  AUDUSD: {
    label: "AUD / USD",
    subtitle: "Australian Dollar vs US Dollar",
    icon: Globe2,
    accent: "from-blue-500/25 to-accent-hover/15 text-blue-100 border-blue-300/20",
  },
  NZDUSD: {
    label: "NZD / USD",
    subtitle: "New Zealand Dollar vs US Dollar",
    icon: Globe2,
    accent: "from-teal-500/25 to-accent-hover/15 text-teal-100 border-teal-300/20",
  },
  USDCAD: {
    label: "USD / CAD",
    subtitle: "US Dollar vs Canadian Dollar",
    icon: Globe2,
    accent: "from-rose-500/25 to-red-500/15 text-rose-100 border-rose-300/20",
  },
  XAUUSD: {
    label: "Gold Spot",
    subtitle: "XAU / USD",
    icon: Gem,
    accent: "from-amber-500/25 to-yellow-500/15 text-amber-100 border-amber-300/20",
  },
  XAGUSD: {
    label: "Silver Spot",
    subtitle: "XAG / USD",
    icon: Gem,
    accent: "from-slate-400/25 to-slate-200/10 text-heading border-border/20",
  },
  BTCUSD: {
    label: "Bitcoin",
    subtitle: "BTC / USD",
    icon: Bitcoin,
    accent: "from-orange-500/25 to-amber-500/15 text-orange-100 border-orange-300/20",
  },
  ETHUSD: {
    label: "Ethereum",
    subtitle: "ETH / USD",
    icon: CircleDollarSign,
    accent: "from-violet-500/25 to-indigo-500/15 text-violet-100 border-violet-300/20",
  },
  XRPUSD: {
    label: "Ripple",
    subtitle: "XRP / USD",
    icon: CircleDollarSign,
    accent: "from-accent/25 to-slate-500/15 text-accent border-accent/20",
  },
  LTCUSD: {
    label: "Litecoin",
    subtitle: "LTC / USD",
    icon: CircleDollarSign,
    accent: "from-slate-500/25 to-slate-300/15 text-heading border-border/20",
  },
  BCOUSD: {
    label: "Brent Crude",
    subtitle: "Brent Oil CFD",
    icon: Flame,
    accent: "from-orange-500/25 to-red-500/15 text-orange-100 border-orange-300/20",
  },
  WTICOUSD: {
    label: "WTI Crude",
    subtitle: "WTI Oil CFD",
    icon: Flame,
    accent: "from-red-500/25 to-amber-500/15 text-red-100 border-red-300/20",
  },
  NATGAS: {
    label: "Natural Gas",
    subtitle: "Henry Hub Natural Gas",
    icon: Flame,
    accent: "from-accent/25 to-accent-hover/15 text-accent border-accent/20",
  },
  SPX500: {
    label: "S&P 500",
    subtitle: "US 500 Index",
    icon: Activity,
    accent: "from-blue-500/25 to-indigo-500/15 text-blue-100 border-blue-300/20",
  },
  NAS100: {
    label: "Nasdaq 100",
    subtitle: "US Tech 100 Index",
    icon: Activity,
    accent: "from-fuchsia-500/25 to-violet-500/15 text-fuchsia-100 border-fuchsia-300/20",
  },
  DJI30: {
    label: "Dow 30",
    subtitle: "US 30 Index",
    icon: Activity,
    accent: "from-emerald-500/25 to-green-500/15 text-emerald-100 border-emerald-300/20",
  },
  GER40: {
    label: "Germany 40",
    subtitle: "DAX Index",
    icon: Activity,
    accent: "from-yellow-500/25 to-amber-500/15 text-yellow-100 border-yellow-300/20",
  },
};

const normalizeTradeSymbol = (symbol: string) =>
  symbol.replace(/\./g, "").replace(/_/g, "").replace(/\s/g, "").toUpperCase();

const getSymbolMetadata = (symbol: string) => {
  const normalized = normalizeTradeSymbol(symbol);
  const directMatch = SYMBOL_METADATA[normalized];

  if (directMatch) {
    return { code: normalized, ...directMatch };
  }

  const slashLabel =
    normalized.length === 6 ? `${normalized.slice(0, 3)} / ${normalized.slice(3)}` : normalized;

  return {
    code: normalized,
    label: slashLabel,
    subtitle: "Market Instrument",
    icon: Globe2,
    accent: "from-slate-500/25 to-slate-400/15 text-heading border-border/20",
  };
};

const apiService = {
  getMastersAndCopiers: async () => {
    const response = await fetch(
      `${API_BASE_URL}/copy-copier/masters-copiers`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch masters and copiers");
    return response.json();
  },

  getTradeHistory: async (
    copierAccounts: number[],
    page: number,
    pageSize: number,
  ) => {
    const response = await fetch(`${API_BASE_URL}/copy-copier/trade-history`, {
      method: "POST",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ copierAccounts, page, pageSize }),
    });
    if (!response.ok) throw new Error("Failed to fetch trade history");
    return response.json();
  },

  getCopierDetails: async (mt5Account: string) => {
    const response = await fetch(
      `${API_BASE_URL}/copy-copier/details/${mt5Account}`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      },
    );
    if (!response.ok) throw new Error("Failed to fetch copier details");
    return response.json();
  },

  checkOpenTrades: async (copierAccounts: number[]) => {
    const response = await fetch(
      `${API_BASE_URL}/copy-copier/check-open-trades`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({ copierAccounts }),
      },
    );
    if (!response.ok) throw new Error("Failed to check open trades");
    return response.json();
  },

  unlinkCopier: async (mt5Account: string) => {
    const response = await fetch(`${API_BASE_URL}/copy-copier/unlink-copier`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
      body: JSON.stringify({ mt5Account }),
    });
    if (!response.ok) throw new Error("Failed to unlink copier");
    return response.json();
  },
};

// Stable empty-array identity so `mastersData ?? EMPTY_MASTERS` doesn't
// recreate a new reference (and re-trigger the stats useMemo) every render
// while the query has no data yet.
const EMPTY_MASTERS: Master[] = [];

const calculateStats = (mastersData: Master[]): Stats => {
  const totalCopiers = mastersData.reduce((sum, m) => sum + m.noCopiers, 0);
  const totalInvestment = mastersData.reduce(
    (sum, m) => sum + m.copiers.reduce((s, c) => s + c.balance, 0),
    0,
  );
  const totalProfit = mastersData.reduce((sum, m) => sum + m.profit, 0);
  const commissionPaid = mastersData.reduce(
    (sum, m) => sum + m.commissionPaid,
    0,
  );

  return { totalCopiers, totalInvestment, totalProfit, commissionPaid };
};

const CopyTradingCRM = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("main");
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  // The copier the user clicked into, as it looked at that moment — the
  // trade-view query below (keyed on this account) layers fresher
  // balance/profit/etc onto it without ever writing back into this state,
  // so there's no fetch -> setState -> refetch loop on this key.
  const [selectedCopierBase, setSelectedCopierBase] =
    useState<SelectedCopier | null>(null);
  const [unlinkingAccount, setUnlinkingAccount] = useState<string | null>(null);
  const [tradePage, setTradePage] = useState(1);

  const {
    data: mastersData,
    isLoading: loading,
    error: mastersQueryError,
  } = useQuery({
    queryKey: ["copyMastersAndCopiers"],
    queryFn: async () => {
      const response = await apiService.getMastersAndCopiers();
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch data");
      }
      return transformMastersData(response.data);
    },
    staleTime: 15 * 1000,
  });
  const masters = mastersData ?? EMPTY_MASTERS;
  const error =
    mastersQueryError instanceof Error
      ? mastersQueryError.message
      : mastersQueryError
        ? "Failed to fetch data"
        : "";
  const stats = useMemo(() => calculateStats(masters), [masters]);

  const invalidateMastersAndCopiers = () =>
    queryClient.invalidateQueries({ queryKey: ["copyMastersAndCopiers"] });

  const applyCopierDetails = (
    copier: SelectedCopier,
    details?: CopierDetailsResponse,
  ): SelectedCopier => {
    if (!details) return copier;

    return {
      ...copier,
      balance: Number(details.balance ?? copier.balance ?? 0),
      equity: Number(details.equity ?? copier.equity ?? 0),
      profit: Number(
        details.totalProfit ?? details.profit ?? copier.profit ?? 0,
      ),
      commissionPaid: Number(
        details.totalMasterCommission ??
          details.commissionPaid ??
          copier.commissionPaid ??
          0,
      ),
      joinedDate: String(
        details.created_at ?? details.joinedDate ?? copier.joinedDate ?? "N/A",
      ),
      status:
        typeof details.status === "string" ? details.status : copier.status,
    };
  };

  const copierAccountKey = selectedCopierBase?.account;

  const {
    data: tradeViewData,
    isLoading: tradeLoading,
    error: tradeQueryError,
  } = useQuery({
    queryKey: ["copierTradeView", copierAccountKey, tradePage],
    queryFn: async () => {
      const account = copierAccountKey!;
      const [detailsResponse, tradesResponse] = await Promise.all([
        apiService.getCopierDetails(account).catch(() => null),
        apiService.getTradeHistory([parseInt(account, 10)], tradePage, 10),
      ]);

      const details =
        detailsResponse?.success && detailsResponse.data
          ? detailsResponse.data
          : undefined;

      if (!tradesResponse.success || !tradesResponse.data) {
        return {
          details,
          masterTrades: [] as Trade[],
          copierTrades: [] as Trade[],
          hasNext: false,
          empty: true,
        };
      }

      const transformed = transformTradesData(
        tradesResponse.data,
        parseInt(account, 10),
      );

      return {
        details,
        masterTrades: transformed.masterTrades,
        copierTrades: transformed.copierTrades,
        hasNext: resolveHasNextPage(tradesResponse.data, 10),
        empty: false,
      };
    },
    enabled: view === "trades" && !!copierAccountKey,
  });

  const selectedCopier = useMemo(() => {
    if (!selectedCopierBase) return null;
    return tradeViewData?.details
      ? applyCopierDetails(selectedCopierBase, tradeViewData.details)
      : selectedCopierBase;
  }, [selectedCopierBase, tradeViewData]);

  const masterTrades = tradeViewData?.masterTrades ?? [];
  const copierTrades = tradeViewData?.copierTrades ?? [];
  const tradeHasNext = tradeViewData?.hasNext ?? false;
  const tradeError = tradeQueryError
    ? tradeQueryError instanceof Error
      ? tradeQueryError.message
      : "Failed to fetch copier details"
    : tradeViewData?.empty
      ? "No trade data was returned for this copier."
      : "";

  const resolveHasNextPage = (data: any, pageSize: number) => {
    if (typeof data?.has_next === "boolean") return data.has_next;
    if (typeof data?.hasNext === "boolean") return data.hasNext;
    if (typeof data?.next_page === "number") return data.next_page > 0;
    if (typeof data?.nextPage === "number") return data.nextPage > 0;
    if (typeof data?.total_pages === "number" && typeof data?.page === "number") {
      return data.page < data.total_pages;
    }
    if (typeof data?.totalPages === "number" && typeof data?.currentPage === "number") {
      return data.currentPage < data.totalPages;
    }

    return Array.isArray(data?.trades) && data.trades.length >= pageSize;
  };

  const handleUnlinkCopier = async (mt5Account: string) => {
    if (!confirm("Are you sure you want to unlink this copier account?")) {
      return;
    }

    try {
      setUnlinkingAccount(mt5Account);

      // Check for open trades
      const openTradesCheck = await apiService.checkOpenTrades([
        parseInt(mt5Account),
      ]);

      if (openTradesCheck.hasOpenTrades) {
        alert(
          `Cannot unlink: This account has ${openTradesCheck.openTradesCount} open trade(s). Please close all trades first.`,
        );
        return;
      }

      await apiService.unlinkCopier(mt5Account);
      alert("Copier account unlinked successfully!");

      // Refresh data
      invalidateMastersAndCopiers();

      // Go back if viewing this copier
      if (selectedCopier?.account === mt5Account) {
        setView("main");
        setSelectedMaster(null);
        setSelectedCopierBase(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unlink copier";
      alert(errorMessage);
    } finally {
      setUnlinkingAccount(null);
    }
  };

  const transformMastersData = (data: any[]): Master[] => {
    return data.map((master, index) => {
      const copiers: Copier[] = (master.copiers || []).map(
        (copier: any, copierIndex: number) => ({
          id: copierIndex + 1,
          account: String(copier.login), // ✅ FIXED
          balance: Number(copier.balance ?? 0),
          equity: Number(copier.equity ?? 0),
          profit: Number(copier.totalProfit ?? 0), // ✅ FIXED
          commissionPaid: Number(copier.totalMasterCommission ?? 0), // ✅ FIXED
          joinedDate: copier.created_at ?? "N/A",
        }),
      );

      return {
        id: index + 1,
        name: master.name, // ✅ FIXED
        account: String(master.login), // ✅ FIXED
        commission: Number(master.commission ?? 0),
        profit: Number(master.total_profit ?? 0), // ✅ FIXED
        started: master.created_at ?? "N/A",
        commissionPaid: Number(master.total_commission ?? 0), // ✅ FIXED
        noCopiers: master.copiers_count ?? copiers.length,
        copiers,
      };
    });
  };

  const transformTradesData = (
    data: any,
    selectedCopierAccount?: number,
  ): { masterTrades: Trade[]; copierTrades: Trade[] } => {
    if (!data?.trades || !Array.isArray(data.trades)) {
      return { masterTrades: [], copierTrades: [] };
    }

    const masterTrades: Trade[] = [];
    const copierTrades: Trade[] = [];

    const resolveTradeSymbol = (trade: any, assocTrade?: any) => {
      const rawSymbol =
        trade?.Symbol ??
        trade?.symbol ??
        trade?.SYMBOL ??
        trade?.Pair ??
        trade?.pair ??
        trade?.Instrument ??
        trade?.instrument ??
        assocTrade?.Symbol ??
        assocTrade?.symbol ??
        assocTrade?.SYMBOL ??
        assocTrade?.Pair ??
        assocTrade?.pair ??
        assocTrade?.Instrument ??
        assocTrade?.instrument;

      return typeof rawSymbol === "string" && rawSymbol.trim()
        ? rawSymbol.trim()
        : "-";
    };

    data.trades.forEach((trade: any, tradeIndex: number) => {
      const matchingAssociatedTrades = Array.isArray(trade.associated_trades)
        ? trade.associated_trades.filter(
            (assocTrade: any) =>
              selectedCopierAccount == null ||
              Number(assocTrade.MT5Account) === selectedCopierAccount,
          )
        : [];

      if (matchingAssociatedTrades.length === 0) {
        return;
      }

      const firstAssociatedTrade = matchingAssociatedTrades[0];

      masterTrades.push({
        id: Number(`${trade.master_login}${tradeIndex}`),
        symbol: resolveTradeSymbol(trade, firstAssociatedTrade),
        symbolName: getSymbolMetadata(resolveTradeSymbol(trade, firstAssociatedTrade))
          .label,
        type: Number(trade.CMD) === 0 ? "BUY" : "SELL",
        volume: Number(trade.Volume ?? firstAssociatedTrade?.Volume ?? 0),
        openPrice: Number(
          trade.Open_Price ?? firstAssociatedTrade?.Open_Price ?? 0,
        ),
        currentPrice: Number(
          trade.Close_Price ??
            trade.Open_Price ??
            firstAssociatedTrade?.Close_Price ??
            firstAssociatedTrade?.Open_Price ??
            0,
        ),
        profit: Number(trade.Profit ?? 0),
        openTime: new Date(
          trade.Open_Time ?? firstAssociatedTrade?.Open_Time ?? Date.now(),
        ).toLocaleString(),
      });

      matchingAssociatedTrades.forEach((assocTrade: any, assocIndex: number) => {
        copierTrades.push({
          id: Number(`${trade.master_login}${assocTrade.MT5Account}${assocIndex}`),
          symbol: resolveTradeSymbol(trade, assocTrade),
          symbolName: getSymbolMetadata(resolveTradeSymbol(trade, assocTrade)).label,
          type: Number(trade.CMD) === 0 ? "BUY" : "SELL",
          volume: Number(assocTrade.Volume ?? 0),
          openPrice: Number(assocTrade.Open_Price ?? 0),
          currentPrice: Number(
            assocTrade.Close_Price ?? assocTrade.Open_Price ?? 0,
          ),
          profit: Number(assocTrade.Profit ?? 0),
          openTime: new Date(
            assocTrade.Open_Time ?? trade.Open_Time ?? Date.now(),
          ).toLocaleString(),
        });
      });
    });

    return { masterTrades, copierTrades };
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    accentColor,
  }: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    accentColor: string;
  }) => (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
      <div className="flex items-center justify-between gap-2 pl-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
          {label}
        </span>
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <p className="mt-3 truncate pl-2 text-xl font-bold text-heading sm:text-2xl">
        {value}
      </p>
    </div>
  );

  const MasterCard = ({ master }: { master: Master }) => (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong sm:p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <div className="mb-4 flex items-start justify-between gap-3 pl-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-heading">{master.name}</h3>
          <p className="text-xs text-subtle">{master.account}</p>
        </div>
        <div className="shrink-0 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1">
          <p className="text-xs font-semibold text-accent">
            {master.commission}%
          </p>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 pl-2">
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Copiers</p>
          <p className="text-sm font-bold text-heading">{master.noCopiers}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Total Profit</p>
          <p className="text-sm font-bold text-accent">
            ${master.profit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 ml-2 rounded-lg border border-amber-300/20 bg-amber-300/10 p-2.5">
        <p className="mb-1 text-[11px] text-amber-100/80">Commission Paid</p>
        <p className="text-base font-bold text-amber-100">
          ${master.commissionPaid.toLocaleString()}
        </p>
      </div>

      <button
        onClick={() => {
          setSelectedMaster(master);
          setView("copiers");
        }}
        data-voice-target={`view copiers ${master.account}`}
        data-voice-value={`${master.name} ${master.account}`}
        className="ml-2 flex w-[calc(100%-0.5rem)] items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/10 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
      >
        View Copiers <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );

  const CopierRow = ({
    copier,
    masterAccount,
  }: {
    copier: Copier;
    masterAccount: string;
  }) => (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong sm:p-5">
      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
      <div className="mb-4 grid grid-cols-2 gap-2 pl-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Account</p>
          <p className="truncate text-sm font-bold text-heading">{copier.account}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Balance</p>
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
            ${copier.balance.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Profit</p>
          <p
            className={`text-sm font-bold ${
              copier.profit >= 0 ? "text-accent" : "text-red-700 dark:text-red-400"
            }`}
          >
            ${copier.profit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <p className="mb-1 text-[11px] text-subtle">Commission Paid</p>
          <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            ${copier.commissionPaid.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-2 sm:flex-row">
        <button
          onClick={() => {
            setTradePage(1);
            setSelectedCopierBase({
              ...copier,
              masterAccount,
            });
            setView("trades");
          }}
          data-voice-target={`view trades ${copier.account}`}
          data-voice-value={`${copier.account} ${masterAccount}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          <Eye className="w-4 h-4" /> View Trades
        </button>
        <button
          onClick={() => handleUnlinkCopier(copier.account)}
          disabled={unlinkingAccount === copier.account}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 transition-colors hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {unlinkingAccount === copier.account ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Unlinking...
            </>
          ) : (
            <>
              <Link2Off className="w-4 h-4" /> Unlink
            </>
          )}
        </button>
      </div>
    </div>
  );

  const TradeRow = ({ trade }: { trade: Trade }) => {
    const symbolMeta = getSymbolMetadata(trade.symbol);
    const SymbolIcon = symbolMeta.icon;

    return (
      <>
        {/* Mobile: card */}
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3 sm:hidden">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br ${symbolMeta.accent}`}
              >
                <SymbolIcon className="h-3.5 w-3.5" />
              </div>
              <p className="truncate text-sm font-bold text-heading">
                {trade.symbolName || symbolMeta.label}
              </p>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-0.5 text-[11px] font-bold ${
                trade.type === "BUY"
                  ? "bg-accent/20 text-accent"
                  : "bg-red-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              {trade.type}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-subtle">
            <span>Vol: <span className="text-accent">{trade.volume}</span></span>
            <span>Open: <span className="text-heading">{trade.openPrice}</span></span>
            <span>Now: <span className="text-blue-700 dark:text-blue-400">{trade.currentPrice}</span></span>
            <span
              className={`font-bold ${trade.profit > 0 ? "text-accent" : "text-red-700 dark:text-red-400"}`}
            >
              ${trade.profit.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-subtle">{trade.openTime}</p>
        </div>

        {/* Desktop: row */}
        <div className="hidden rounded-lg border border-border bg-surface-strong/[0.03] p-3 transition-colors hover:bg-surface-strong/[0.05] sm:grid sm:grid-cols-7 sm:items-center sm:gap-3">
          <div>
            <p className="mb-1 text-[11px] text-subtle">Symbol</p>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-gradient-to-br ${symbolMeta.accent}`}
              >
                <SymbolIcon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-heading">
                  {trade.symbolName || symbolMeta.label}
                </p>
                <p className="truncate text-[11px] text-subtle">
                  {symbolMeta.code}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Type</p>
            <span
              className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                trade.type === "BUY"
                  ? "bg-accent/20 text-accent"
                  : "bg-red-500/20 text-red-700 dark:text-red-400"
              }`}
            >
              {trade.type}
            </span>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Volume</p>
            <p className="text-sm font-semibold text-accent">{trade.volume}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Open Price</p>
            <p className="text-sm text-heading">{trade.openPrice}</p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Current Price</p>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
              {trade.currentPrice}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Profit</p>
            <p
              className={`text-sm font-bold ${trade.profit > 0 ? "text-accent" : "text-red-700 dark:text-red-400"}`}
            >
              ${trade.profit.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-subtle">Open Time</p>
            <p className="text-xs text-heading">{trade.openTime}</p>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="client-theme-bg flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-accent" />
          <p className="text-base text-heading sm:text-xl">
            Loading your copy trading data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-theme-bg flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-surface p-6 sm:p-8">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-700 dark:text-red-400" />
          <h2 className="mb-2 text-center text-lg font-bold text-heading sm:text-xl">
            Error Loading Data
          </h2>
          <p className="mb-4 text-center text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => invalidateMastersAndCopiers()}
            className="w-full rounded-lg border border-accent/20 bg-accent/10 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-theme-bg min-h-screen p-3 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-4 overflow-hidden rounded-xl border border-border bg-surface p-4 sm:mb-6 sm:p-6">
          <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
          <div className="pl-2">
            <div className="mb-3 flex items-center gap-3">
              {view !== "main" && (
                <button
                  onClick={() => {
                    if (view === "trades") {
                      setView("copiers");
                      setSelectedCopierBase(null);
                    } else {
                      setView("main");
                      setSelectedMaster(null);
                    }
                  }}
                  className="rounded-lg border border-border bg-surface-strong/[0.04] p-2 transition-colors hover:bg-surface-strong/[0.08]"
                >
                  <ArrowLeft className="h-4 w-4 text-heading" />
                </button>
              )}
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Copier Command Flow
              </div>
            </div>
            <h1 className="mb-1 text-xl font-bold tracking-tight text-heading sm:text-2xl">
              {view === "main" && "Copy Trading Dashboard"}
              {view === "copiers" && `${selectedMaster?.name} Copier Board`}
              {view === "trades" && `Trade Mirror ${selectedCopier?.account}`}
            </h1>
            <p className="max-w-2xl text-sm text-subtle">
              {view === "main" && "Monitor your linked masters, copier performance, and mirrored trade activity from one control surface."}
              {view === "copiers" && `Master account ${selectedMaster?.account} with linked copier breakdown and action controls.`}
              {view === "trades" && `Trade activity view for copier ${selectedCopier?.account} linked to master ${selectedCopier?.masterAccount}.`}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-subtle">
                  <Users className="h-3.5 w-3.5 text-accent" />
                  Masters
                </div>
                <p className="text-base font-semibold text-heading sm:text-lg">{masters.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-subtle">
                  <Sparkles className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                  Copiers
                </div>
                <p className="text-base font-semibold text-heading sm:text-lg">{stats.totalCopiers}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
                <div className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-subtle">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  View
                </div>
                <p className="truncate text-sm font-semibold capitalize text-heading">{view}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main View */}
        {view === "main" && (
          <>
            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 lg:grid-cols-4">
              <StatCard
                icon={Users}
                label="Total Copiers"
                value={stats.totalCopiers}
                accentColor="bg-accent"
              />
              <StatCard
                icon={Wallet}
                label="Total Investment"
                value={`$${stats.totalInvestment.toLocaleString()}`}
                accentColor="bg-emerald-400"
              />
              <StatCard
                icon={TrendingUp}
                label="Total Profit"
                value={`$${stats.totalProfit.toLocaleString()}`}
                accentColor="bg-accent"
              />
              <StatCard
                icon={DollarSign}
                label="Commission Paid"
                value={`$${stats.commissionPaid.toLocaleString()}`}
                accentColor="bg-amber-400"
              />
            </div>

            {/* Masters Grid */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
                <Activity className="h-5 w-5 text-accent" />
                Your Masters
              </h2>
              <button
                onClick={() => (window.location.href = "/client/copy/rating")}
                className="flex items-center justify-center gap-2 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                Browse All Masters <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {masters.map((master) => (
                <MasterCard key={master.id} master={master} />
              ))}
            </div>
          </>
        )}

        {/* Copiers View */}
        {view === "copiers" && selectedMaster && (
          <div className="space-y-3 sm:space-y-4">
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
              <div className="grid grid-cols-2 gap-3 pl-2 sm:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs text-subtle">Total Copiers</p>
                  <p className="text-lg font-bold text-heading sm:text-xl">
                    {selectedMaster.noCopiers}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Total Profit</p>
                  <p className="text-lg font-bold text-accent sm:text-xl">
                    ${selectedMaster.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Commission Rate</p>
                  <p className="text-lg font-bold text-accent sm:text-xl">
                    {selectedMaster.commission}%
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Commission Paid</p>
                  <p className="text-lg font-bold text-amber-100 sm:text-xl">
                    ${selectedMaster.commissionPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {selectedMaster.copiers.map((copier) => (
              <CopierRow
                key={copier.id}
                copier={copier}
                masterAccount={selectedMaster.account}
              />
            ))}
          </div>
        )}

        {/* Trades View */}
        {view === "trades" && selectedCopier && (
          <div className="space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
              <div className="grid grid-cols-2 gap-3 pl-2 sm:grid-cols-4">
                <div>
                  <p className="mb-1 text-xs text-subtle">Your Account</p>
                  <p className="truncate text-base font-bold text-heading sm:text-xl">
                    {selectedCopier.account}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Balance</p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-400 sm:text-xl">
                    ${selectedCopier.balance.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Profit</p>
                  <p className="text-base font-bold text-accent sm:text-xl">
                    ${selectedCopier.profit.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-subtle">Equity</p>
                  <p className="text-base font-bold text-amber-100 sm:text-xl">
                    ${(selectedCopier.equity ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-heading">Trade Pagination</p>
                <p className="text-xs text-subtle">
                  Page {tradePage} with 10 backend records per request.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTradePage((current) => Math.max(1, current - 1))}
                  disabled={tradeLoading || tradePage === 1}
                  className="flex-1 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  Previous
                </button>
                <button
                  onClick={() => setTradePage((current) => current + 1)}
                  disabled={tradeLoading || !tradeHasNext}
                  className="flex-1 rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Master Trades */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-heading sm:text-lg">
                <TrendingUp className="h-4 w-4 text-accent" />
                Master Trades
              </h3>
              <div className="space-y-2">
                {tradeLoading ? (
                  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-6 text-sm text-subtle">
                    Loading copier trade details...
                  </div>
                ) : masterTrades.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-6 text-sm text-subtle">
                    {tradeError || "No source trades were returned for this copier."}
                  </div>
                ) : (
                  masterTrades.map((trade) => (
                    <TradeRow key={trade.id} trade={trade} />
                  ))
                )}
              </div>
            </div>

            {/* Your Copier Trades */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-heading sm:text-lg">
                <Users className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                Your Copier Trades
              </h3>
              <div className="space-y-2">
                {tradeLoading ? (
                  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-6 text-sm text-subtle">
                    Loading copier trade details...
                  </div>
                ) : copierTrades.length === 0 ? (
                  <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-6 text-sm text-subtle">
                    {tradeError || "No copier trades were returned for this account."}
                  </div>
                ) : (
                  copierTrades.map((trade) => (
                    <TradeRow key={trade.id} trade={trade} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopyTradingCRM;
