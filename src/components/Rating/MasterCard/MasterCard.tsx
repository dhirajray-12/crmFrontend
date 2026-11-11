import { Users, Shield, TrendingUp, DollarSign } from "lucide-react";
import type { MasterTrader } from "@/types/rating.types";
import { getExpertiseBadge } from "@/utils/helpers";

interface MasterCardProps {
  master: MasterTrader;
  onClick: () => void;
  rank?: number;
}

export const MasterCard = ({ master, onClick, rank }: MasterCardProps) => {
  const badge = getExpertiseBadge(master.expertise);

  return (
    <div
      onClick={onClick}
      data-voice-target={`master ${master.name}`}
      data-voice-value={`${master.name} ${master.id} ${master.expertise}`}
      className="relative cursor-pointer overflow-hidden rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong sm:p-5"
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />

      <div className="mb-4 flex items-start justify-between gap-3 pl-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] text-lg font-bold text-heading">
            {master.avatar}
          </div>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-bold text-heading">{master.name}</h3>
              {typeof rank === "number" && (
                <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 dark:text-amber-200">
                  #{rank}
                </span>
              )}
            </div>
            <div
              className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-heading ${badge.color}`}
            >
              <span>{badge.icon}</span>
              <span className="capitalize">
                {master.expertise.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] uppercase tracking-[0.1em] text-subtle">P&L</p>
          <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
            ${master.profitLoss.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 pl-2 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px] text-subtle">Copiers</span>
          </div>
          <p className="text-sm font-bold text-heading">{master.copiers}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
            <span className="text-[11px] text-subtle">Risk</span>
          </div>
          <p className="text-sm font-bold text-heading">{master.riskScore}/10</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
            <span className="text-[11px] text-subtle">Growth</span>
          </div>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{master.growth}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-subtle" />
            <span className="text-[11px] text-subtle">Fee</span>
          </div>
          <p className="text-sm font-bold text-heading">{master.fees}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-strong/[0.02] px-3 py-2 pl-2">
        <p className="text-xs text-subtle">
          Active since <span className="text-heading">{master.activeSince}</span>
        </p>
        <span className="text-xs font-semibold text-accent">Open profile →</span>
      </div>
    </div>
  );
};
