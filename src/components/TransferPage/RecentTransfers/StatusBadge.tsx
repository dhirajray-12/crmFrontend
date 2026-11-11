import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { normalizeTransferStatus } from "@/utils/TransferHelper";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const normalized = normalizeTransferStatus(status);

  const styles: Record<string, string> = {
    Completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300",
    Failed: "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300",
    Pending: "border-amber-300/20 bg-amber-300/10 text-amber-700 dark:text-amber-200",
  };

  const icons = {
    Completed: CheckCircle2,
    Failed: XCircle,
    Pending: Clock3,
  } as const;

  const Icon = icons[normalized as keyof typeof icons] ?? Clock3;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
        styles[normalized] ?? styles.Pending
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {normalized}
    </span>
  );
};
