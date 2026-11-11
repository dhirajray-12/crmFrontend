import { ChevronDown, ChevronUp, Edit, Trash2, Users } from "lucide-react";
import type { MasterAccount } from "@/types/MasterPage.type";
import {
  formatCurrency,
  getInitials,
  getStatusColor,
} from "@/utils/MasterPage.helper";
import { CopiersTable } from "./CopiersTable";

interface MasterMobileCardProps {
  master: MasterAccount;
  onUpdate: (master: MasterAccount) => void;
  onDelete: (accountId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (masterId: string) => void;
}

export const MasterMobileCard = ({
  master,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}: MasterMobileCardProps) => {
  const statusColor = getStatusColor(master.isActive);

  return (
    <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10">
            <span className="text-sm font-bold text-heading">
              {getInitials(master.nickname)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-heading">{master.nickname}</p>
            <p className="truncate text-xs text-subtle">
              {master.accountDetails.mt5Account}
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 rounded-full border px-2 py-1 text-xs font-medium ${statusColor}`}
        >
          {master.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-subtle">Commission</p>
          <p className="font-medium text-heading">{master.commission}%</p>
        </div>
        <div>
          <p className="text-subtle">Copiers</p>
          <p className="flex items-center gap-1 font-medium text-accent">
            <Users className="h-3 w-3" />
            {master.totalCopiers}
          </p>
        </div>
        <div>
          <p className="text-subtle">Profit</p>
          <p className="font-medium text-emerald-700 dark:text-emerald-300">
            {formatCurrency(master.totalProfit)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onUpdate(master)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 transition-colors hover:bg-amber-500/20"
        >
          <Edit className="h-3.5 w-3.5" />
          Update
        </button>
        <button
          onClick={() => onToggleExpand(master._id)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent/20 bg-accent/10 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
        >
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          Copiers
        </button>
        <button
          onClick={() => onDelete(master.accountDetails.mt5Account)}
          className="flex items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-500/20"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 rounded-lg border border-border bg-surface p-3">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-heading">
            <Users className="h-4 w-4 text-accent" />
            Copier Details ({master.copiers.length})
          </h3>
          <CopiersTable copiers={master.copiers} masterNickname={master.nickname} />
        </div>
      )}
    </div>
  );
};
