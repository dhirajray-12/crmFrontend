import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Icons;
  accentColor: string;
  iconColor: string;
  valueColor?: string;
}

export const StatCard = ({
  label,
  value,
  icon,
  accentColor,
  iconColor,
  valueColor = "text-heading",
}: StatCardProps) => {
  const IconComponent = Icons[icon] as LucideIcon;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
      <div className="flex items-center justify-between gap-2 pl-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
          {label}
        </span>
        <IconComponent className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className={`mt-3 truncate pl-2 text-2xl font-bold sm:text-[28px] ${valueColor}`}>
        {value}
      </p>
    </div>
  );
};
