import { CheckCircle2, Clock3, XCircle, type LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, { className: string; icon: LucideIcon }> = {
  approved: {
    className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  rejected: {
    className: "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300",
    icon: XCircle,
  },
};

const DEFAULT_STYLE = {
  className: "border-amber-300/20 bg-amber-300/10 text-amber-700 dark:text-amber-200",
  icon: Clock3,
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { className, icon: Icon } =
    STATUS_STYLES[status.toLowerCase()] ?? DEFAULT_STYLE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
