import { useState } from "react";
import { MessageCircle, Activity, ShieldCheck } from "lucide-react";
import type { MasterTrader } from "@/types/rating.types";
import { getExpertiseBadge, getRiskColor } from "@/utils/helpers";
import { PerformanceOverview } from "@/components/Rating/MasterDetails/PerformanceOverview";
import { AccountDetails } from "@/components/Rating/MasterDetails/AccountDetails";
import { TradesTable } from "@/components/Rating/MasterDetails/TradesTable";
import { BackButton } from "@/components/Rating/common/BackButton";

interface MasterDetailsProps {
  master: MasterTrader;
  onBack: () => void;
  onCopyClick: () => void;
}

export const MasterDetails = ({
  master,
  onBack,
  onCopyClick,
}: MasterDetailsProps) => {
  const [timeFilter, setTimeFilter] = useState("1M");
  const [activeTab, setActiveTab] = useState<"closed" | "open">("closed");
  const badge = getExpertiseBadge(master.expertise);

  return (
    <div>
      <BackButton onClick={onBack} />

      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" />
        <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:gap-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-strong/[0.04] text-xl font-bold text-heading">
            {master.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-heading sm:text-xl">{master.name}</h2>
              <div
                className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r px-2.5 py-1 text-xs font-bold text-heading ${badge.color}`}
              >
                <span>{badge.icon}</span>
                <span className="capitalize">
                  {master.expertise.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <p className="mb-4 max-w-2xl text-sm text-subtle">{master.description}</p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
                <p className="mb-1 text-[11px] text-subtle">Risk Score</p>
                <div
                  className={`inline-block rounded-md bg-gradient-to-r px-2 py-0.5 text-sm font-bold text-heading ${getRiskColor(master.riskScore)}`}
                >
                  {master.riskScore}/10
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
                <p className="mb-1 text-[11px] text-subtle">Capital</p>
                <p className="text-sm font-bold text-heading">${master.capital}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
                <p className="mb-1 text-[11px] text-subtle">Fee</p>
                <p className="text-sm font-bold text-heading">{master.fees}</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
                <p className="mb-1 text-[11px] text-subtle">Active Since</p>
                <p className="text-sm font-bold text-heading">{master.activeSince}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <div className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.1em] text-amber-700 dark:text-amber-300/80">Min. Investment</p>
                <p className="text-sm font-bold text-heading">${master.minInvestment}</p>
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.03] px-3 py-2 text-xs font-medium text-subtle sm:flex">
                <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                Ready for copier setup
              </div>
              <button
                onClick={onCopyClick}
                data-voice-target="start copying"
                className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20"
              >
                Copy This Master
              </button>
              {master.telegramLink && (
                <a
                  href={master.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Telegram
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-4 sm:mt-6 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-semibold text-heading">
            <Activity className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
            Performance Overview
          </h3>
          <div className="flex flex-wrap gap-2">
            {["1W", "1M", "3M", "6M", "ALL"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeFilter(period)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  timeFilter === period
                    ? "border border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border border-border bg-surface-strong/[0.03] text-subtle hover:bg-surface-strong/[0.06]"
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <PerformanceOverview master={master} timeFilter={timeFilter} />
      </div>

      <div className="mt-4 sm:mt-6">
        <AccountDetails master={master} />
      </div>

      <div className="mt-4 sm:mt-6">
        <TradesTable
          master={master}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};
