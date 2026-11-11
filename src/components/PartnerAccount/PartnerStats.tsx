import type { ComponentType } from "react";
import { CheckCircle, Link2, UserPlus } from "lucide-react";
import type { DashboardSummary } from "@/types/partner.types";

interface PartnerStatsProps {
  summary: DashboardSummary | null | undefined;
}

export const PartnerStats = ({ summary }: PartnerStatsProps) => {
  const stats = [
    {
      label: "Total Partners",
      value: summary?.partnersCount ?? 0,
      icon: UserPlus,
      accentColor: "bg-emerald-400",
      iconColor: "text-emerald-700 dark:text-emerald-300",
    },
    {
      label: "Total Earnings",
      value: `$${summary?.totalCommission.toFixed(4) ?? "0"}`,
      icon: CheckCircle,
      accentColor: "bg-accent",
      iconColor: "text-accent",
    },
    {
      label: "Withdrawable",
      value: `$${summary?.withdrawableBalance.toFixed(4) ?? "0"}`,
      icon: Link2,
      accentColor: "bg-purple-400",
      iconColor: "text-purple-700 dark:text-purple-300",
    },
    {
      label: "Withdrawn",
      value: `$${summary?.totalWithdrawals.toFixed(4) ?? "0.00"}`,
      icon: CheckCircle,
      accentColor: "bg-amber-400",
      iconColor: "text-amber-700 dark:text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  accentColor: string;
  iconColor: string;
}

const StatCard = ({ label, value, icon: Icon, accentColor, iconColor }: StatCardProps) => (
  <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
    <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
    <div className="flex items-center justify-between gap-2 pl-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        {label}
      </span>
      <Icon className={`h-4 w-4 ${iconColor}`} />
    </div>
    <p className="mt-3 pl-2 text-2xl font-bold text-heading sm:text-[28px]">
      {value}
    </p>
  </div>
);
