export const TRADE_TYPES = {
  BUY: "buy",
  SELL: "sell",
} as const;

export const TRADE_STATUS = {
  OPEN: "open",
  CLOSED: "closed",
} as const;

export const STATS_CONFIG = [
  {
    key: "totalTrades",
    label: "Total Trades",
    icon: "TrendingUp",
    gradient: "from-blue-500/30 to-cyan-500/30",
    iconColor: "text-cyan-300",
    textColor: "text-blue-200",
  },
  {
    key: "openTrades",
    label: "Open Positions",
    icon: "DollarSign",
    gradient: "from-green-500/30 to-emerald-500/30",
    iconColor: "text-emerald-300",
    textColor: "text-green-200",
  },
  {
    key: "profitableTrades",
    label: "Profitable",
    icon: "TrendingUp",
    gradient: "from-green-500/30 to-lime-500/30",
    iconColor: "text-lime-300",
    textColor: "text-green-200",
  },
  {
    key: "lossTrades",
    label: "Loss Trades",
    icon: "TrendingUp",
    gradient: "from-red-500/30 to-rose-500/30",
    iconColor: "text-red-300",
    textColor: "text-red-200",
  },
] as const;

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
