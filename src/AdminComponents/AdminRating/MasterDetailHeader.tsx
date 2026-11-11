import { MessageCircle } from "lucide-react";
import type { MasterTrader } from "@/types/rating.types";

interface MasterDetailHeaderProps {
  master: MasterTrader;
  onBack: () => void;
  onCopy: () => void;
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

const getRiskColor = (score: number): string => {
  if (score <= 3) return "from-green-500 to-emerald-600";
  if (score <= 6) return "from-yellow-500 to-amber-600";
  return "from-red-500 to-rose-600";
};

export const MasterDetailHeader = ({
  master,
  onBack,
  onCopy,
}: MasterDetailHeaderProps) => {
  const badge = getExpertiseBadge(master.expertise);

  return (
    <>
      <button
        onClick={onBack}
        className="mb-6 bg-surface-strong rounded-xl px-6 py-3 border border-border text-heading hover:bg-surface transition-all duration-300 font-medium shadow-sm"
      >
        ← Back to Masters
      </button>

      <div className="bg-surface-strong rounded-3xl p-8 border border-border shadow-xl mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-heading font-bold text-3xl shadow-lg">
            {master.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-heading">
                {master.name}
              </h2>
              <div
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r ${badge.color} text-heading text-sm font-bold`}
              >
                <span>{badge.icon}</span>
                <span className="capitalize">
                  {master.expertise.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <p className="text-body mb-4">{master.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-body text-sm mb-1">Risk Score</p>
                <div
                  className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${getRiskColor(master.riskScore)} text-heading font-bold`}
                >
                  {master.riskScore}/10
                </div>
              </div>
              <div>
                <p className="text-body text-sm mb-1">Capital</p>
                <p className="text-heading font-bold text-lg">
                  ${master.capital}
                </p>
              </div>
              <div>
                <p className="text-body text-sm mb-1">Fee</p>
                <p className="text-heading font-bold text-lg">{master.fees}</p>
              </div>
              <div>
                <p className="text-body text-sm mb-1">Active Since</p>
                <p className="text-heading font-bold text-lg">
                  {master.activeSince}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <div className="bg-surface rounded-xl px-4 py-2 border border-border">
                <p className="text-body text-xs">Min. Investment</p>
                <p className="text-heading font-bold">
                  ${master.minInvestment}
                </p>
              </div>
              <button
                onClick={onCopy}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-heading hover:shadow-lg transition-all duration-300 font-bold"
              >
                Copy This Master
              </button>
              {master.telegramLink && (
                <a
                  href={master.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-accent-hover text-heading hover:shadow-lg transition-all duration-300 font-bold flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Telegram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
