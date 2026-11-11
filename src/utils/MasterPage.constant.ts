export const COMMISSION_RANGES = {
  MIN: 0,
  MAX: 50,
  STEP: 0.1,
} as const;

export const DEFAULT_MIN_INVESTMENT = 1000;

export const COMMISSION_TIPS = [
  "Set competitive rates (5-15% typical)",
  "Lower rates attract more copiers",
  "Higher rates work for proven strategies",
];

export const BEST_PRACTICES = [
  "Maintain consistent trading activity",
  "Share detailed strategy descriptions",
  "Engage with your copiers regularly",
];

export const SUMMARY_CARDS = [
  {
    key: "totalMasters",
    label: "Total Masters",
    icon: "Users",
    iconColor: "text-blue-300",
    subLabelKey: "activeMasters",
    subLabel: "Active",
    subLabelPrefix: "active",
    isCurrency: false,
  },
  {
    key: "totalCopiers",
    label: "Total Copiers",
    icon: "Users",
    iconColor: "text-emerald-300",
    subLabel: "Following your strategies",
    subLabelKey: "activeCopiers",
    isCurrency: false,
  },
  {
    key: "totalProfit",
    label: "Total Profit",
    icon: "TrendingUp",
    iconColor: "text-purple-300",
    subLabel: "Lifetime earnings",
    subLabelKey: "totalProfit",
    isCurrency: true,
  },
  {
    key: "commissionEarned",
    label: "Commission Earned",
    icon: "IndianRupee",
    iconColor: "text-amber-300",
    subLabel: "From copiers",
    subLabelKey: "commissionEarned",
    isCurrency: true,
  },
] as const;