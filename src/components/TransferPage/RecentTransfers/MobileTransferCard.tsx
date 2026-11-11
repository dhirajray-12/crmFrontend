import { ArrowRight } from "lucide-react";
import type { Transfer } from "@/types/transfer.types";
import { formatCurrency, formatDate } from "@/utils/TransferHelper";
import { StatusBadge } from "./StatusBadge";

interface MobileTransferCardProps {
  transfer: Transfer;
}

export const MobileTransferCard = ({ transfer }: MobileTransferCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              From
            </p>
            <p className="truncate font-mono text-heading">
              {transfer.fromAccount?.mt5Account ?? "N/A"}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-subtle" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              To
            </p>
            <p className="truncate font-mono text-heading">
              {transfer.toAccount?.mt5Account ?? "N/A"}
            </p>
          </div>
        </div>
        <StatusBadge status={transfer.status} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Date
          </p>
          <p className="mt-1 text-sm text-heading">
            {formatDate(transfer.createdAt)}
          </p>
        </div>
        <span className="text-lg font-bold text-heading">
          {formatCurrency(transfer.amount)}
        </span>
      </div>
    </div>
  );
};
