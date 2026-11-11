import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  History,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAPI } from "../../API/api";

type RequestStatus = "Approved" | "Rejected" | "Pending";

interface DepositRecord {
  id: string;
  amount: number;
  status: RequestStatus;
  paymentType: string | null;
  paymentMethod: { type: string | null; bankName: string | null; walletName: string | null } | null;
  bonus: number;
  requestedDate: string;
  approvedDate: string | null;
  remarks: string;
}

interface WithdrawalRecord {
  id: string;
  amount: number;
  status: RequestStatus;
  paymentMethod: string | null;
  bankDetails: {
    bankName?: string;
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
  } | null;
  eWalletDetails: { walletId?: string; type?: string } | null;
  requestedDate: string;
  approvedDate: string | null;
  remarks: string;
}

interface TimeMachineAccount {
  accountId: string;
  mt5Account: string;
  name: string;
  accountType: string;
  currentBalance: number;
  currentEquity: number;
  depositsTotal: number;
  withdrawalsTotal: number;
  closedPnlTotal: number;
  reconstructedBalance: number;
  openPositionsCount: number;
  openPositionsAsOf: {
    symbol: string;
    direction: "buy" | "sell";
    volume: number;
    openTime: string;
    openPrice: number;
  }[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
}

interface TimelineEntry {
  type: "deposit" | "withdrawal" | "trade-closed";
  at: string;
  amount?: number;
  profit?: number;
  symbol?: string;
  status?: RequestStatus;
  accountId: string | null;
}

interface TimeMachineData {
  clientId: string;
  at: string;
  accounts: TimeMachineAccount[];
  timeline: TimelineEntry[];
  caveats: string[];
  computedAt: string;
}

const PRESETS = [
  { label: "Now", days: 0 },
  { label: "7d ago", days: 7 },
  { label: "30d ago", days: 30 },
  { label: "90d ago", days: 90 },
];

// Formats a Date into the value a <input type="datetime-local"> expects
// (local time, no timezone suffix, minute precision).
const toDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

const money = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ClientTimeMachinePanel({ clientId }: { clientId: string }) {
  const { clientAPI } = useAPI();
  const [at, setAt] = useState(() => toDateTimeLocal(new Date()));
  const [data, setData] = useState<TimeMachineData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchSnapshot = async (isoOverride?: string) => {
    const isoAt = new Date(isoOverride ?? at).toISOString();
    setLoading(true);
    try {
      const response = await clientAPI.getTimeMachine(clientId, isoAt);
      setData(response.data);
      setError(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load time machine data",
      );
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  const applyPreset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    const localValue = toDateTimeLocal(d);
    setAt(localValue);
    void fetchSnapshot(localValue);
  };

  const totals = useMemo(() => {
    if (!data) return null;
    return data.accounts.reduce(
      (acc, a) => ({
        reconstructedBalance: acc.reconstructedBalance + a.reconstructedBalance,
        currentBalance: acc.currentBalance + a.currentBalance,
      }),
      { reconstructedBalance: 0, currentBalance: 0 },
    );
  }, [data]);

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-subtle">
        Reconstructs what this client's account(s) looked like at a past
        moment - balance and open positions derived from approved deposits,
        approved withdrawals, and closed trades. Not a stored snapshot;
        recomputed on demand for the date you pick.
      </p>

      <div className="rounded-2xl border border-border bg-surface p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-widest text-body block mb-1.5">
              Point in time
            </label>
            <input
              type="datetime-local"
              value={at}
              max={toDateTimeLocal(new Date())}
              onChange={(e) => setAt(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface-strong px-3 py-2.5 text-sm text-heading focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => void fetchSnapshot()}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            View
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="rounded-full border border-border bg-surface-strong px-3 py-1 text-xs font-medium text-body transition-colors hover:border-accent hover:text-accent"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-4 text-sm text-[var(--status-red)]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex h-32 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-accent" />
        </div>
      )}

      {!loading && !error && !hasFetched && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-subtle">
          Pick a date/time above and hit View to reconstruct this client's
          account state as of that moment.
        </div>
      )}

      {!loading && !error && data && (
        <div className="space-y-5">
          {totals && data.accounts.length > 1 && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-subtle">
                  Reconstructed balance across {data.accounts.length} accounts as of{" "}
                  {new Date(data.at).toLocaleString()}
                </span>
                <span className="text-lg font-black text-heading">
                  ${money(totals.reconstructedBalance)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {data.accounts.map((acc) => {
              const delta = acc.currentBalance - acc.reconstructedBalance;
              return (
                <div
                  key={acc.accountId}
                  className="rounded-2xl border border-border bg-surface p-4 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-accent" />
                      <span className="text-sm font-bold text-heading">
                        {acc.name || acc.mt5Account}
                      </span>
                      <span className="rounded-full bg-surface-strong px-2 py-0.5 text-[10px] uppercase tracking-widest text-subtle">
                        {acc.accountType}
                      </span>
                    </div>
                    <span className="text-xs text-subtle font-mono">#{acc.mt5Account}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Balance as of date" value={`$${money(acc.reconstructedBalance)}`} emphasis />
                    <Stat label="Current balance" value={`$${money(acc.currentBalance)}`} />
                    <Stat
                      label="Change since then"
                      value={`${delta >= 0 ? "+" : "-"}$${money(Math.abs(delta))}`}
                      tone={delta >= 0 ? "positive" : "negative"}
                    />
                    <Stat label="Open positions then" value={String(acc.openPositionsCount)} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-subtle">
                      <ArrowDownCircle className="h-3.5 w-3.5 text-[var(--status-green)]" />
                      Deposits: <span className="text-body font-semibold">${money(acc.depositsTotal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-subtle">
                      <ArrowUpCircle className="h-3.5 w-3.5 text-[var(--status-red)]" />
                      Withdrawals: <span className="text-body font-semibold">${money(acc.withdrawalsTotal)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-subtle">
                      {acc.closedPnlTotal >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-[var(--status-green)]" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-[var(--status-red)]" />
                      )}
                      Closed P&amp;L: <span className="text-body font-semibold">${money(acc.closedPnlTotal)}</span>
                    </div>
                  </div>

                  {acc.openPositionsAsOf.length > 0 && (
                    <div className="space-y-1.5 border-t border-border pt-3">
                      <span className="text-[10px] uppercase tracking-widest text-subtle">
                        Open positions at that moment
                      </span>
                      {acc.openPositionsAsOf.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-surface-strong px-3 py-1.5 text-xs"
                        >
                          <span className="text-body">
                            {p.symbol}{" "}
                            <span
                              className={
                                p.direction === "buy"
                                  ? "text-[var(--status-green)]"
                                  : "text-[var(--status-red)]"
                              }
                            >
                              {p.direction.toUpperCase()}
                            </span>{" "}
                            {p.volume} lots
                          </span>
                          <span className="text-subtle">
                            @ {p.openPrice} · opened {new Date(p.openTime).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {acc.deposits.length > 0 && (
                    <div className="space-y-1.5 border-t border-border pt-3">
                      <span className="text-[10px] uppercase tracking-widest text-subtle">
                        Deposit requests as of that date ({acc.deposits.length})
                      </span>
                      <div className="max-h-56 space-y-1.5 overflow-y-auto">
                        {acc.deposits.map((d) => (
                          <div
                            key={d.id}
                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-surface-strong px-3 py-1.5 text-xs"
                          >
                            <span className="flex items-center gap-2 text-body">
                              <StatusBadge status={d.status} />$
                              {money(d.amount)}
                              {d.bonus > 0 && (
                                <span className="text-subtle">+${money(d.bonus)} bonus</span>
                              )}
                              <span className="text-subtle">
                                {d.paymentMethod?.type ||
                                  d.paymentMethod?.bankName ||
                                  d.paymentMethod?.walletName ||
                                  d.paymentType ||
                                  ""}
                              </span>
                            </span>
                            <span className="text-subtle">
                              requested {new Date(d.requestedDate).toLocaleString()}
                              {d.approvedDate &&
                                ` · approved ${new Date(d.approvedDate).toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {acc.withdrawals.length > 0 && (
                    <div className="space-y-1.5 border-t border-border pt-3">
                      <span className="text-[10px] uppercase tracking-widest text-subtle">
                        Withdrawal requests as of that date ({acc.withdrawals.length})
                      </span>
                      <div className="max-h-56 space-y-1.5 overflow-y-auto">
                        {acc.withdrawals.map((w) => {
                          const destination =
                            w.bankDetails?.bankName || w.bankDetails?.accountNumber
                              ? `${w.bankDetails?.bankName ?? ""} ${
                                  w.bankDetails?.accountNumber
                                    ? `••${w.bankDetails.accountNumber.slice(-4)}`
                                    : ""
                                }`.trim()
                              : w.eWalletDetails?.walletId
                                ? `${w.eWalletDetails.type ?? "Wallet"} ••${w.eWalletDetails.walletId.slice(-4)}`
                                : w.paymentMethod || "";
                          return (
                            <div
                              key={w.id}
                              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-surface-strong px-3 py-1.5 text-xs"
                            >
                              <span className="flex items-center gap-2 text-body">
                                <StatusBadge status={w.status} />$
                                {money(w.amount)}
                                {destination && <span className="text-subtle">{destination}</span>}
                              </span>
                              <span className="text-subtle">
                                requested {new Date(w.requestedDate).toLocaleString()}
                                {w.approvedDate &&
                                  ` · approved ${new Date(w.approvedDate).toLocaleString()}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {data.timeline.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-heading">
                  Activity leading up to this moment
                </span>
              </div>
              <div className="max-h-64 space-y-1.5 overflow-y-auto">
                {data.timeline.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-border py-1.5 text-xs last:border-0"
                  >
                    <span className="flex items-center gap-2 text-body">
                      {e.status && <StatusBadge status={e.status} />}
                      {e.type === "deposit" && `Deposit`}
                      {e.type === "withdrawal" && `Withdrawal`}
                      {e.type === "trade-closed" && `Trade closed - ${e.symbol}`}
                    </span>
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          (e.type === "deposit" || (e.profit ?? 0) >= 0) &&
                          e.type !== "withdrawal"
                            ? "text-[var(--status-green)]"
                            : "text-[var(--status-red)]"
                        }
                      >
                        {e.type === "deposit" && `+$${money(e.amount ?? 0)}`}
                        {e.type === "withdrawal" && `-$${money(e.amount ?? 0)}`}
                        {e.type === "trade-closed" &&
                          `${(e.profit ?? 0) >= 0 ? "+" : "-"}$${money(Math.abs(e.profit ?? 0))}`}
                      </span>
                      <span className="text-subtle">{new Date(e.at).toLocaleString()}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1 text-[11px] leading-relaxed text-subtle">
            {data.caveats.map((c, idx) => (
              <p key={idx}>· {c}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const meta: Record<RequestStatus, { label: string; className: string }> = {
    Approved: { label: "Approved", className: "bg-[var(--status-green)]/15 text-[var(--status-green)]" },
    Rejected: { label: "Rejected", className: "bg-[var(--status-red)]/15 text-[var(--status-red)]" },
    Pending: { label: "Pending", className: "bg-accent/15 text-accent" },
  };
  const m = meta[status];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${m.className}`}>
      {m.label}
    </span>
  );
}

function Stat({
  label,
  value,
  emphasis,
  tone,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  tone?: "positive" | "negative";
}) {
  const toneColor =
    tone === "positive"
      ? "text-[var(--status-green)]"
      : tone === "negative"
        ? "text-[var(--status-red)]"
        : "text-heading";
  return (
    <div className="rounded-xl bg-surface-strong px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-subtle">{label}</div>
      <div className={`mt-0.5 font-bold ${emphasis ? "text-base" : "text-sm"} ${toneColor}`}>
        {value}
      </div>
    </div>
  );
}
