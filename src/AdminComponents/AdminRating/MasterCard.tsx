import { Users, Shield, TrendingUp, DollarSign, Trash2 } from "lucide-react";
import type { MasterTrader } from "@/types/rating.types";

interface MasterCardProps {
  master: MasterTrader;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const getExpertiseBadge = (expertise: MasterTrader["expertise"]) => {
  const badges: Record<
    MasterTrader["expertise"],
    { color: string; icon: string }
  > = {
    legend: { color: "from-yellow-500 to-orange-600", icon: "👑" },
    expert: { color: "from-blue-500 to-accent-hover", icon: "🏆" },
    vertical_take_off: { color: "from-green-500 to-emerald-600", icon: "🚀" },
    young_talent: { color: "from-purple-500 to-pink-600", icon: "⭐" },
    new_comers: { color: "from-gray-500 to-slate-600", icon: "🌱" },
  };
  return badges[expertise] || badges.new_comers;
};

export const MasterCard = ({ master, onSelect, onDelete }: MasterCardProps) => {
  const badge = getExpertiseBadge(master.expertise);

  return (
    <div
      onClick={onSelect}
      className="group bg-surface-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border hover:border-purple-300 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl relative"
    >
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all duration-300 border border-red-200 opacity-0 group-hover:opacity-100"
        title="Delete Master"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-heading font-bold text-2xl shadow-lg">
          {master.avatar}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-heading mb-1">
            {master.name}
          </h3>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${badge.color} text-heading text-xs font-bold`}
          >
            <span>{badge.icon}</span>
            <span className="capitalize">
              {master.expertise.replace(/_/g, " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-body text-xs">Copiers</span>
          </div>
          <p className="text-heading font-bold text-lg">{master.copiers}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-yellow-600" />
            <span className="text-body text-xs">Risk</span>
          </div>
          <p className="text-heading font-bold text-lg">
            {master.riskScore}/10
          </p>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-body text-xs">Growth</span>
          </div>
          <p className="text-green-600 font-bold text-lg">{master.growth}</p>
        </div>
        <div className="bg-surface rounded-xl p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-body text-xs">Fee</span>
          </div>
          <p className="text-heading font-bold text-lg">{master.fees}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
        <p className="text-body text-xs mb-1">Profit & Loss</p>
        <p className="text-2xl font-bold text-green-600">
          ${master.profitLoss.toLocaleString()}
        </p>
      </div>

      <div className="mt-3 text-center">
        <p className="text-subtle text-xs">
          Active since {master.activeSince}
        </p>
      </div>
    </div>
  );
};
