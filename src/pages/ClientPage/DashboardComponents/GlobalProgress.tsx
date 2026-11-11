import { useEffect } from "react";
import { Activity, Layers3, Wallet, Wallet2 } from "lucide-react";
import { useAccountsData } from "@/hooks/useAccountsData";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import { useGlobalProgressStore } from "@/Store/globalProgressStore";
import { colorSchemes } from "@/types/globalProgress.types";
import { calculateMetrics, formatCurrency } from "@/utils/globalProgressUtils";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";

export default function GlobalProgress() {
  const { data: accounts = [], isLoading, error } = useAccountsData();
  const { lastUpdated, setLastUpdated } = useGlobalProgressStore();

  useEffect(() => {
    if (accounts.length > 0) {
      setLastUpdated(new Date());
    }
  }, [accounts, setLastUpdated]);

  const metrics = calculateMetrics(accounts, colorSchemes);
  const totalBalance = metrics.reduce((sum, metric) => sum + metric.balance, 0);
  const topMetric = metrics[0];

  return (
    <Panel>
      <SectionHeader
        eyebrow="Global progress"
        icon={Wallet2}
        title="Balance by account"
        description="Ranked, highest balance first"
        action={
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">Total</p>
            <p className="font-mono text-base font-semibold tabular-nums text-heading">
              {formatCurrency(totalBalance)}
            </p>
          </div>
        }
      />

      <div className="p-4 sm:p-5">
        <StatRow columns={3}>
          <StatCell label="Accounts" icon={Wallet} value={metrics.length} />
          <StatCell label="Lead account" icon={Layers3} value={topMetric?.label || "No data"} />
          <StatCell
            label="Status"
            icon={Activity}
            value={isLoading ? "Syncing" : metrics.length > 0 ? "Live" : "Idle"}
          />
        </StatRow>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-subtle">Highest-balance accounts stay pinned to the top.</p>
          {!error && lastUpdated && (
            <span className="text-[11px] text-subtle">
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: getConfiguredTimezone(),
              })}
            </span>
          )}
        </div>

        <div className="mt-3 max-h-[420px] space-y-1 overflow-y-auto pr-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-border bg-surface-strong/[0.03] p-4">
                <div className="h-3.5 w-28 animate-pulse rounded bg-surface-strong/10" />
                <div className="mt-3 h-1.5 w-full animate-pulse rounded-full bg-surface-strong/10" />
              </div>
            ))
          ) : metrics.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface-strong/[0.03] px-4 py-8 text-center text-sm text-subtle">
              No account progress data available.
            </div>
          ) : (
            metrics.map((metric, index) => (
              <div
                key={`${metric.label}-${index}`}
                className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-strong/[0.03]"
              >
                <span className="w-7 shrink-0 rounded-lg bg-surface-strong/[0.04] py-1 text-center font-mono text-[11px] font-semibold text-subtle">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-heading">{metric.label}</p>
                    <p className="shrink-0 font-mono text-sm font-semibold tabular-nums text-heading">
                      {formatCurrency(metric.balance)}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-strong/[0.07]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-[width] duration-700"
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-subtle">
                  {metric.percentage}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </Panel>
  );
}
