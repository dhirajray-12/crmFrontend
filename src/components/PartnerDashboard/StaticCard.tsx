// components/Overview/StatsCards.tsx
import React from "react";
import { Wallet, DollarSign, CreditCard, Users, CalendarClock } from "lucide-react";
import type { DashboardSummary } from "@/types/PartnerDasboard.types";
import { formatCurrency } from "@/utils/PartnerDashboard.utils";

interface StatsCardsProps {
  summary: DashboardSummary;
}

interface StatConfig {
  key: keyof DashboardSummary;
  label: string;
  icon: typeof Wallet;
  accentColor: string;
  iconColor: string;
  hint: string;
  decimals?: number;
  isCount?: boolean;
}

const statsConfig: StatConfig[] = [
  {
    key: "withdrawableBalance",
    label: "Withdrawable Balance",
    icon: Wallet,
    accentColor: "bg-emerald-400",
    iconColor: "text-emerald-700 dark:text-emerald-300",
    hint: "Available for payout",
    decimals: 4,
  },
  {
    key: "totalCommission",
    label: "Total Commission",
    icon: DollarSign,
    accentColor: "bg-accent",
    iconColor: "text-accent",
    hint: "Accumulated rebate earnings",
    decimals: 4,
  },
  {
    key: "todayCommission",
    label: "Today's Commission",
    icon: CalendarClock,
    accentColor: "bg-teal-400",
    iconColor: "text-teal-700 dark:text-teal-300",
    hint: "Earned today",
    decimals: 4,
  },
  {
    key: "totalWithdrawals",
    label: "Total Withdrawn",
    icon: CreditCard,
    accentColor: "bg-purple-400",
    iconColor: "text-purple-700 dark:text-purple-300",
    hint: "Processed partner withdrawals",
    decimals: 4,
  },
  {
    key: "partnersCount",
    label: "Total Partners",
    icon: Users,
    accentColor: "bg-amber-400",
    iconColor: "text-amber-700 dark:text-amber-300",
    hint: "Current downline footprint",
    isCount: true,
  },
];

export const StatsCards: React.FC<StatsCardsProps> = ({ summary }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {statsConfig.map((stat) => {
      const Icon = stat.icon;
      const value = summary[stat.key];

      return (
        <div
          key={stat.key}
          className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <div className={`absolute inset-y-0 left-0 w-1 ${stat.accentColor}`} />
          <div className="flex items-center justify-between gap-2 pl-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              {stat.label}
            </span>
            <Icon className={`h-4 w-4 ${stat.iconColor}`} />
          </div>
          <p className="mt-3 pl-2 text-2xl font-bold text-heading sm:text-[28px]">
            {stat.isCount
              ? value
              : formatCurrency(value as number, stat.decimals || 2)}
          </p>
          <p className="mt-1 pl-2 text-xs text-subtle">{stat.hint}</p>
        </div>
      );
    })}
  </div>
);
