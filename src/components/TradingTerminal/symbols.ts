// Known-good symbols for the trading bridge (confirmed against the live
// chart-data endpoint). Not a dynamic fetch from the bridge's own
// get-symbols endpoint - that has been unreliable when probed directly -
// so this is a curated static list, categorized for the watchlist filter
// tabs. Update directly if new tradeable symbols are added.
export interface WatchlistSymbol {
  symbol: string;
  label: string;
  description: string;
  category: "Forex" | "Metals" | "Crypto";
}

export const WATCHLIST_SYMBOLS: WatchlistSymbol[] = [
  { symbol: "BTCUSDs", label: "BTCUSD", description: "Bitcoin vs US Dollar", category: "Crypto" },
  { symbol: "ETHUSDs", label: "ETHUSD", description: "Ethereum vs US Dollar", category: "Crypto" },
  { symbol: "XAUUSDs", label: "XAUUSD", description: "Gold vs US Dollar", category: "Metals" },
  { symbol: "XAGUSDs", label: "XAGUSD", description: "Silver vs US Dollar", category: "Metals" },
  { symbol: "AUDUSD.s", label: "AUDUSD", description: "Australian Dollar vs US Dollar", category: "Forex" },
  { symbol: "EURUSD.s", label: "EURUSD", description: "Euro vs US Dollar", category: "Forex" },
  { symbol: "GBPUSD.s", label: "GBPUSD", description: "British Pound vs US Dollar", category: "Forex" },
  { symbol: "USDJPY.s", label: "USDJPY", description: "US Dollar vs Japanese Yen", category: "Forex" },
  { symbol: "USDCHF.s", label: "USDCHF", description: "US Dollar vs Swiss Franc", category: "Forex" },
  { symbol: "USDCAD.s", label: "USDCAD", description: "US Dollar vs Canadian Dollar", category: "Forex" },
  { symbol: "NZDUSD.s", label: "NZDUSD", description: "New Zealand Dollar vs US Dollar", category: "Forex" },
  { symbol: "EURJPY.s", label: "EURJPY", description: "Euro vs Japanese Yen", category: "Forex" },
];

export const WATCHLIST_CATEGORIES = ["All", "Forex", "Metals", "Crypto"] as const;
export type WatchlistCategory = (typeof WATCHLIST_CATEGORIES)[number];

export const decimalsForSymbol = (symbol: string): number => {
  const upper = symbol.toUpperCase();
  if (upper.includes("BTC") || upper.includes("ETH")) return 2;
  if (upper.includes("JPY")) return 3;
  if (upper.includes("XAU") || upper.includes("XAG")) return 2;
  return 5;
};

export const formatSymbolPrice = (symbol: string, value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return "--";
  return value.toFixed(decimalsForSymbol(symbol));
};
