import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}

export const StatCard = ({ label, value, icon: Icon, accent = "text-accent" }: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-strong p-5">
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface ${accent}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0">
      <p className="truncate text-xs font-medium uppercase tracking-wide text-subtle">{label}</p>
      <p className="truncate text-xl font-semibold text-heading">{value}</p>
    </div>
  </div>
);

export default StatCard;
