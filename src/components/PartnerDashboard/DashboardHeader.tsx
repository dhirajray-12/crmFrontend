import React from "react";
import { CheckCircle, Copy, Network, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import type { IBConfiguration } from "@/types/PartnerDasboard.types";

interface DashboardHeaderProps {
  ibConfig: IBConfiguration;
  onRefresh: () => void;
  onCopyCode: () => void;
  isRefreshing: boolean;
  copiedCode: boolean;
  commissionMode?: "waterfall" | "flat";
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  ibConfig,
  onRefresh,
  onCopyCode,
  isRefreshing,
  copiedCode,
  commissionMode,
}) => (
  <motion.div
    initial={{ opacity: 0, y: -12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6"
  >
    <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

    <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
          <Network className="h-3.5 w-3.5" />
          Partner zone
        </div>
        <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
          Partner Dashboard
        </h1>
        <p className="mt-1 max-w-xl text-sm text-subtle">
          Track your referral network, commission balance, and payout
          history in one place.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2">
            <span className="text-xs uppercase tracking-[0.14em] text-subtle">
              Code
            </span>
            <span className="text-sm font-semibold text-heading">
              {ibConfig.referralCode}
            </span>
            <button
              onClick={onCopyCode}
              data-voice-target="copy referral code"
              className="ml-1 rounded-md p-1 text-subtle transition hover:bg-surface-strong/10 hover:text-heading"
              title="Copy referral code"
            >
              {copiedCode ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          {ibConfig.parentDetails && (
            <span className="text-xs text-subtle">
              Referred by {ibConfig.parentDetails.name}
            </span>
          )}
          <span className="rounded-lg border border-accent/20 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">
            IB tier {ibConfig.level}
          </span>
          {commissionMode && (
            <span
              className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                commissionMode === "flat"
                  ? "border-teal-400/20 bg-teal-500/10 text-teal-700 dark:text-teal-300"
                  : "border-purple-400/20 bg-purple-500/10 text-purple-700 dark:text-purple-300"
              }`}
            >
              {commissionMode === "flat" ? "Normal Commission" : "Sub-IB"}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        data-voice-target="refresh partner dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] hover:text-heading disabled:opacity-50 sm:self-start"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  </motion.div>
);
