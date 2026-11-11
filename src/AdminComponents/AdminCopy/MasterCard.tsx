import { ChevronRight } from "lucide-react";
import type { Master } from "@/types/copyTrading.types";

interface MasterCardProps {
  master: Master;
  onViewCopiers: (master: Master) => void;
}

export const MasterCard = ({ master, onViewCopiers }: MasterCardProps) => (
  <div className="group bg-surface-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-border hover:border-purple-400 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-heading mb-1 truncate">
          {master.name}
        </h3>
        <p className="text-sm text-body">{master.account}</p>
      </div>
      <div className="px-3 py-1 bg-gradient-to-r from-accent to-blue-500 rounded-lg shadow-md">
        <p className="text-sm font-semibold text-heading">{master.commission}%</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
        <p className="text-xs text-body mb-1">Copiers</p>
        <p className="text-lg font-bold text-heading">{master.noCopiers}</p>
      </div>
      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
        <p className="text-xs text-body mb-1">Total Profit</p>
        <p className="text-lg font-bold text-green-600">
          ${master.profit.toLocaleString()}
        </p>
      </div>
    </div>

    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 mb-4">
      <p className="text-xs text-body mb-1">Commission Paid</p>
      <p className="text-xl font-bold text-purple-600">
        ${master.commissionPaid.toLocaleString()}
      </p>
    </div>

    <button
      onClick={() => onViewCopiers(master)}
      className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-accent to-blue-600 hover:from-accent hover:to-blue-700 rounded-lg sm:rounded-xl text-accent-foreground text-sm sm:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
    >
      View Copiers <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);
