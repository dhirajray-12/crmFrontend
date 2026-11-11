import { ChevronUp, Edit, Eye, Trash2, Users } from "lucide-react";
import type { MasterAccount } from "@/types/MasterPage.type";
import {
  formatCurrency,
  getInitials,
  getStatusColor,
} from "@/utils/MasterPage.helper";
import { CopiersTable } from "./CopiersTable";

interface TableRowProps {
  master: MasterAccount;
  index: number;
  onUpdate: (master: MasterAccount) => void;
  onDelete: (accountId: string) => void;
  isExpanded: boolean;
  onToggleExpand: (masterId: string) => void;
}

export const TableRow = ({
  master,
  onUpdate,
  onDelete,
  isExpanded,
  onToggleExpand,
}: TableRowProps) => {
  const statusColor = getStatusColor(master.isActive);

  return (
    <>
      <tr
        data-voice-value={`${master.nickname} ${master.accountDetails.mt5Account}`}
        className="cursor-pointer border-b border-border transition-colors hover:bg-surface-strong/[0.04]"
        onClick={() => onToggleExpand(master._id)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/20 bg-violet-500/10">
              <span className="text-sm font-bold text-heading">
                {getInitials(master.nickname)}
              </span>
            </div>
            <span className="font-medium text-heading">{master.nickname}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-subtle">
          {master.accountDetails.mt5Account}
        </td>
        <td className="px-4 py-3">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor}`}
          >
            {master.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3 font-medium text-heading">
          {master.commission}%
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/10 px-2 py-1 text-sm text-accent">
            <Users className="h-3 w-3" />
            {master.totalCopiers}
          </span>
        </td>
        <td className="px-4 py-3 font-medium text-emerald-700 dark:text-emerald-300">
          {formatCurrency(master.totalProfit)}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              data-voice-target={`update master ${master.accountDetails.mt5Account}`}
              className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300 transition-colors hover:bg-amber-500/20"
              onClick={() => onUpdate(master)}
              title="Update"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              data-voice-target={`view copiers ${master.accountDetails.mt5Account}`}
              className="rounded-lg border border-accent/20 bg-accent/10 p-2 text-accent transition-colors hover:bg-accent/20"
              onClick={() => onToggleExpand(master._id)}
              title={isExpanded ? "Hide Copiers" : "View Copiers"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            <button
              data-voice-target={`delete master ${master.accountDetails.mt5Account}`}
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2 text-rose-700 dark:text-rose-300 transition-colors hover:bg-rose-500/20"
              onClick={() => onDelete(master.accountDetails.mt5Account)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="bg-surface-strong/[0.02] p-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-heading">
                <Users className="h-4 w-4 text-accent" />
                Copier Details ({master.copiers.length})
              </h3>
              <CopiersTable
                copiers={master.copiers}
                masterNickname={master.nickname}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
