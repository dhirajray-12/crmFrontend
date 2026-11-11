import { Eye, Link2Off, Loader2 } from "lucide-react";
import type { Copier } from "@/types/copyTrading.types";

interface CopierRowProps {
  copier: Copier;
  masterAccount: string;
  onViewTrades: (copier: Copier, masterAccount: string) => void;
  onUnlink: (account: string) => void;
  isUnlinking: boolean;
}

export const CopierRow = ({
  copier,
  masterAccount,
  onViewTrades,
  onUnlink,
  isUnlinking,
}: CopierRowProps) => (
  <div className="bg-surface-strong rounded-2xl p-6 border-2 border-border hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
      <div>
        <p className="text-xs text-body mb-1">Account</p>
        <p className="text-sm font-bold text-heading">{copier.account}</p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Balance</p>
        <p className="text-sm font-semibold text-blue-600">
          ${copier.balance.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Profit</p>
        <p
          className={`text-sm font-bold ${copier.profit >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          ${copier.profit.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-xs text-body mb-1">Commission Paid</p>
        <p className="text-sm font-semibold text-purple-600">
          ${copier.commissionPaid.toLocaleString()}
        </p>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <button
        onClick={() => onViewTrades(copier, masterAccount)}
        className="flex-1 py-2 px-4 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg text-blue-700 font-medium transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" /> View Trades
      </button>
      <button
        onClick={() => onUnlink(copier.account)}
        disabled={isUnlinking}
        className="flex-1 py-2 px-4 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-red-700 font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUnlinking ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Unlinking...
          </>
        ) : (
          <>
            <Link2Off className="w-4 h-4" /> Unlink
          </>
        )}
      </button>
    </div>
  </div>
);
