import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  Gauge,
  RefreshCw,
  Settings2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAPI } from "../../../API/api";

interface SymbolExposure {
  symbol: string;
  longLots: number;
  shortLots: number;
  netLots: number;
  pl: number;
  positions: number;
}

interface TraderTrade {
  symbol: string;
  direction: "buy" | "sell";
  lots: number;
  profit: number;
  account: string | null;
}

interface TraderPosition {
  userId: string;
  name: string;
  email: string | null;
  totalPL: number;
  positionCount: number;
  trades: TraderTrade[];
}

interface RiskAlert {
  severity: "critical" | "warning";
  message: string;
}

interface RiskThresholds {
  enabled: boolean;
  maxFloatingLossUsd: number;
  maxSymbolNetLots: number;
}

interface RiskExposureData {
  totalFloatingPL: number;
  openPositions: number;
  activeTraders: number;
  symbolExposure: SymbolExposure[];
  traderPositions: TraderPosition[];
  alerts: RiskAlert[];
  thresholds: RiskThresholds;
  lastUpdated: number | null;
  scope: string;
}

const fmtMoney = (n: number) =>
  `${n >= 0 ? "" : "-"}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtLots = (n: number) => n.toFixed(2);

export default function RiskExposureDashboard() {
  const { dashboardAPI } = useAPI();
  const [data, setData] = useState<RiskExposureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrader, setExpandedTrader] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [draftThresholds, setDraftThresholds] = useState<RiskThresholds | null>(
    null,
  );

  const fetchExposure = async () => {
    try {
      const response = await dashboardAPI.getRiskExposure();
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load risk exposure");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExposure();
    // The server-side cache this reads from refreshes every ~5s; poll a
    // little slower than that so we're not re-fetching faster than the
    // underlying data can actually change.
    const interval = setInterval(() => void fetchExposure(), 15_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSettings = () => {
    if (data?.thresholds) setDraftThresholds({ ...data.thresholds });
    setSettingsOpen(true);
  };

  const saveThresholds = async () => {
    if (!draftThresholds) return;
    setSettingsSaving(true);
    try {
      await dashboardAPI.updateRiskThresholds(draftThresholds);
      await fetchExposure();
      setSettingsOpen(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save thresholds");
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-56 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--status-red)]">
        <AlertTriangle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!data) return null;

  const isProfit = data.totalFloatingPL >= 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface">
            <Gauge className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-heading">Live Risk &amp; Exposure</h3>
            <p className="text-xs text-body">
              Floating P&amp;L across currently-active traders
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (settingsOpen ? setSettingsOpen(false) : openSettings())}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-body transition-colors hover:bg-surface-strong"
            aria-label="Alert threshold settings"
            title="Alert threshold settings"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-[var(--status-green)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-green)]" />
            Live
          </div>
        </div>
      </div>

      {/* Threshold settings panel */}
      {settingsOpen && draftThresholds && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-heading">
              <input
                type="checkbox"
                checked={draftThresholds.enabled}
                onChange={(e) =>
                  setDraftThresholds({
                    ...draftThresholds,
                    enabled: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-accent"
              />
              Enable risk alerts
            </label>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-subtle">
              Max floating loss (USD)
              <input
                type="number"
                min={0}
                value={draftThresholds.maxFloatingLossUsd}
                onChange={(e) =>
                  setDraftThresholds({
                    ...draftThresholds,
                    maxFloatingLossUsd: Number(e.target.value) || 0,
                  })
                }
                className="admin-input rounded-lg px-3 py-2 text-sm text-heading"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-subtle">
              Max net lots per symbol
              <input
                type="number"
                min={0}
                value={draftThresholds.maxSymbolNetLots}
                onChange={(e) =>
                  setDraftThresholds({
                    ...draftThresholds,
                    maxSymbolNetLots: Number(e.target.value) || 0,
                  })
                }
                className="admin-input rounded-lg px-3 py-2 text-sm text-heading"
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-body transition-colors hover:bg-surface-strong"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveThresholds()}
              disabled={settingsSaving}
              className="rounded-lg bg-linear-to-r from-accent to-accent-hover px-4 py-2 text-xs font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
            >
              {settingsSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      {/* Active alerts - only rendered once thresholds are enabled and
          breached; each one maps to a check computed server-side in
          getRiskExposure against the thresholds above. */}
      {data.alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {data.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
                alert.severity === "critical"
                  ? "border-[color-mix(in_srgb,var(--status-red)_45%,var(--border))] bg-[color-mix(in_srgb,var(--status-red)_14%,var(--surface))] text-[var(--status-red)]"
                  : "border-[color-mix(in_srgb,var(--status-blue)_45%,var(--border))] bg-[color-mix(in_srgb,var(--status-blue)_14%,var(--surface))] text-[var(--status-blue)]"
              }`}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Scope disclaimer - this reads a warm cache of only the clients who
          have their Live Trade page open recently, not every account in the
          system, so it's important admins don't mistake it for a full-book
          figure. */}
      <p className="mt-3 text-[11px] leading-relaxed text-subtle">
        Based on clients who have viewed their live trades in the last minute
        ({data.activeTraders} right now) - not a full-book total across every
        client.
      </p>

      {data.activeTraders === 0 ? (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-10 text-center">
          <Users className="h-6 w-6 text-subtle" />
          <p className="text-sm text-body">
            No clients are actively watching live trades right now.
          </p>
        </div>
      ) : (
        <>
          {/* Hero + stat row */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-4 sm:col-span-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
                Total Floating P&amp;L
              </div>
              <div
                className={`mt-1 flex items-center gap-1.5 text-2xl font-black tracking-tight ${
                  isProfit
                    ? "text-[var(--status-green)]"
                    : "text-[var(--status-red)]"
                }`}
              >
                {isProfit ? (
                  <ArrowUpRight className="h-5 w-5" />
                ) : (
                  <ArrowDownRight className="h-5 w-5" />
                )}
                {fmtMoney(data.totalFloatingPL)}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
                Active Traders
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-2xl font-black tracking-tight text-heading">
                <Users className="h-5 w-5 text-accent" />
                {data.activeTraders}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
                Open Positions
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-2xl font-black tracking-tight text-heading">
                <Activity className="h-5 w-5 text-accent" />
                {data.openPositions}
              </div>
            </div>
          </div>

          {/* Per-symbol exposure */}
          {data.symbolExposure.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
                Top Symbol Exposure
              </div>
              <div className="overflow-hidden rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface text-left text-[10px] font-semibold uppercase tracking-widest text-subtle">
                      <th className="px-4 py-2.5">Symbol</th>
                      <th className="px-4 py-2.5 text-right">Long / Short (lots)</th>
                      <th className="px-4 py-2.5 text-right">Net</th>
                      <th className="px-4 py-2.5 text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.symbolExposure.map((row) => (
                      <tr key={row.symbol} className="bg-surface-strong">
                        <td className="px-4 py-2.5 font-semibold text-heading">
                          {row.symbol}
                        </td>
                        <td className="px-4 py-2.5 text-right text-body">
                          <span className="text-[var(--status-green)]">
                            {fmtLots(row.longLots)}
                          </span>
                          {" / "}
                          <span className="text-[var(--status-red)]">
                            {fmtLots(row.shortLots)}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            row.netLots >= 0
                              ? "text-[var(--status-green)]"
                              : "text-[var(--status-red)]"
                          }`}
                        >
                          {row.netLots >= 0 ? "+" : ""}
                          {fmtLots(row.netLots)}
                        </td>
                        <td
                          className={`px-4 py-2.5 text-right font-semibold ${
                            row.pl >= 0
                              ? "text-[var(--status-green)]"
                              : "text-[var(--status-red)]"
                          }`}
                        >
                          {fmtMoney(row.pl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Who's holding what - lets an admin drill down from an
              aggregate P&L number to the actual client behind it. */}
          {data.traderPositions.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
                By Trader
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {data.traderPositions.map((trader) => {
                  const isOpen = expandedTrader === trader.userId;
                  const traderIsProfit = trader.totalPL >= 0;
                  return (
                    <div key={trader.userId} className="bg-surface-strong">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedTrader(isOpen ? null : trader.userId)
                        }
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-accent to-accent-hover text-xs font-bold text-accent-foreground">
                            {trader.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-heading">
                              {trader.name}
                            </div>
                            <div className="truncate text-xs text-subtle">
                              {trader.email || "—"} · {trader.positionCount}{" "}
                              position{trader.positionCount === 1 ? "" : "s"}
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              traderIsProfit
                                ? "text-[var(--status-green)]"
                                : "text-[var(--status-red)]"
                            }`}
                          >
                            {fmtMoney(trader.totalPL)}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-subtle transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="border-t border-border bg-surface px-4 py-2">
                          {trader.trades.map((trade, idx) => (
                            <div
                              key={`${trader.userId}-${idx}`}
                              className="flex items-center justify-between gap-3 py-2 text-xs first:pt-1 last:pb-1"
                            >
                              <div className="flex items-center gap-2 text-body">
                                <span className="font-semibold text-heading">
                                  {trade.symbol}
                                </span>
                                <span
                                  className={
                                    trade.direction === "buy"
                                      ? "text-[var(--status-green)]"
                                      : "text-[var(--status-red)]"
                                  }
                                >
                                  {trade.direction.toUpperCase()}
                                </span>
                                <span>{fmtLots(trade.lots)} lots</span>
                                {trade.account && (
                                  <span className="text-subtle">
                                    · #{trade.account}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`font-semibold ${
                                  trade.profit >= 0
                                    ? "text-[var(--status-green)]"
                                    : "text-[var(--status-red)]"
                                }`}
                              >
                                {fmtMoney(trade.profit)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
