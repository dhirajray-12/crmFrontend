import { useMemo, useState } from "react";
import { Check, Loader2, Pencil, X } from "lucide-react";
import { useTradingData } from "@/hooks/useTradingData";
import { useLiveTradeActions } from "@/hooks/useLiveTradeActions";
import { useToastStore } from "@/Store/toast.store";
import { cn } from "@/lib/utils";
import type { AccountListItem } from "@/hooks/useAccountsData";

type Tab = "positions" | "orders" | "history";

interface PositionsPanelProps {
  account: AccountListItem | undefined;
}

const formatMoney = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
const formatSlTp = (value: number) => (value ? value.toString() : "--");

export default function PositionsPanel({ account }: PositionsPanelProps) {
  const [tab, setTab] = useState<Tab>("positions");
  const [closingTicket, setClosingTicket] = useState<string | null>(null);
  const [editingTicket, setEditingTicket] = useState<string | null>(null);
  const [editSl, setEditSl] = useState("");
  const [editTp, setEditTp] = useState("");
  const { data: tradingData } = useTradingData();
  const { closeTrade, modifyTrade } = useLiveTradeActions();
  const addToast = useToastStore((state) => state.addToast);

  const forAccount = <T extends { account?: string }>(trades: T[] = []) =>
    account ? trades.filter((t: any) => String(t.account) === String(account.mt5Account)) : trades;

  const openTrades = useMemo(
    () => forAccount((tradingData?.openTrades as any[]) ?? []),
    [tradingData, account],
  );
  const closedTrades = useMemo(
    () => forAccount((tradingData?.closedTrades as any[]) ?? []),
    [tradingData, account],
  );

  const positions = openTrades.filter((t: any) => (t.status ?? "open") !== "pending");
  const pendingOrders = openTrades.filter((t: any) => t.status === "pending");

  const handleClose = async (position: any) => {
    const ticket = position.ticket ?? position.ticketNumber;
    const closePrice = Number(position.currentPrice ?? position.openPrice) || 0;
    if (!closePrice) {
      addToast("error", "No live price available to close this position");
      return;
    }
    setClosingTicket(String(ticket));
    try {
      await closeTrade.mutateAsync({
        positionId: position.ticketNumber ?? ticket,
        price: closePrice,
      });
      addToast("success", `Position ${ticket} closed`);
    } catch (err: any) {
      addToast("error", err?.message || "Failed to close position");
    } finally {
      setClosingTicket(null);
    }
  };

  const startEdit = (position: any) => {
    const ticket = String(position.ticket ?? position.ticketNumber);
    setEditingTicket(ticket);
    setEditSl(position.stopLoss ? String(position.stopLoss) : "");
    setEditTp(position.takeProfit ? String(position.takeProfit) : "");
  };

  const cancelEdit = () => setEditingTicket(null);

  const handleSaveEdit = async (position: any) => {
    const ticket = position.ticket ?? position.ticketNumber;
    const sl = editSl.trim() === "" ? 0 : Number.parseFloat(editSl);
    const tp = editTp.trim() === "" ? 0 : Number.parseFloat(editTp);
    if (Number.isNaN(sl) || Number.isNaN(tp)) {
      addToast("error", "Enter valid numbers for SL/TP");
      return;
    }
    try {
      await modifyTrade.mutateAsync({
        positionId: position.ticketNumber ?? ticket,
        sl,
        tp,
      });
      addToast("success", `SL/TP updated for ${ticket}`);
      setEditingTicket(null);
    } catch (err: any) {
      addToast("error", err?.message || "Failed to update SL/TP");
    }
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "positions", label: "Positions", count: positions.length },
    { key: "orders", label: "Orders", count: pendingOrders.length },
    { key: "history", label: "History", count: closedTrades.length },
  ];

  const rows = tab === "positions" ? positions : tab === "orders" ? pendingOrders : closedTrades;
  const showSlTp = tab === "positions";
  const columnCount = 6 + (showSlTp ? 2 : 0) + (tab === "positions" ? 1 : 0);

  return (
    <div className="flex h-[220px] shrink-0 flex-col gap-2 border-t border-border pt-3">
      <div className="flex items-center gap-4 border-b border-border px-3 pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "text-xs font-semibold transition-colors",
              tab === t.key ? "text-accent" : "text-subtle hover:text-heading",
            )}
          >
            {t.label} <span className="text-subtle">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-3">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-subtle">
              <th className="px-3 py-2 font-semibold">Symbol</th>
              <th className="px-3 py-2 font-semibold">Side</th>
              <th className="px-3 py-2 font-semibold">Lots</th>
              <th className="px-3 py-2 font-semibold">Open</th>
              {tab === "history" ? (
                <th className="px-3 py-2 font-semibold">Close</th>
              ) : (
                <th className="px-3 py-2 font-semibold">Current</th>
              )}
              <th className="px-3 py-2 font-semibold">P&amp;L</th>
              {showSlTp && (
                <>
                  <th className="px-3 py-2 font-semibold">SL</th>
                  <th className="px-3 py-2 font-semibold">TP</th>
                </>
              )}
              {tab === "positions" && <th className="px-3 py-2 font-semibold" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-3 py-6 text-center text-subtle">
                  {tab === "positions" && "No open positions"}
                  {tab === "orders" && "No pending orders"}
                  {tab === "history" && "No trade history"}
                </td>
              </tr>
            ) : (
              rows.map((row: any, index: number) => {
                const ticket = row.ticket ?? row.ticketNumber ?? index;
                const profit = Number(row.profit) || 0;
                const isEditing = tab === "positions" && editingTicket === String(ticket);

                return (
                  <tr key={ticket} className="border-b border-border/60">
                    <td className="px-3 py-2 font-semibold text-heading">{row.symbol}</td>
                    <td
                      className={cn(
                        "px-3 py-2 font-semibold uppercase",
                        String(row.trade).toLowerCase() === "buy"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {row.trade}
                    </td>
                    <td className="px-3 py-2 font-mono text-heading">{row.volume}</td>
                    <td className="px-3 py-2 font-mono text-heading">{row.openPrice}</td>
                    <td className="px-3 py-2 font-mono text-heading">
                      {tab === "history" ? row.closePrice ?? "--" : row.currentPrice ?? row.openPrice}
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 font-mono font-semibold",
                        profit >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {formatMoney(profit)}
                    </td>
                    {showSlTp && (
                      <>
                        <td className="px-3 py-2 font-mono text-heading">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.00001"
                              placeholder="0"
                              value={editSl}
                              onChange={(e) => setEditSl(e.target.value)}
                              className="w-20 rounded-md border border-border bg-surface-strong/[0.03] px-1.5 py-1 text-xs text-heading"
                            />
                          ) : (
                            formatSlTp(row.stopLoss)
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-heading">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.00001"
                              placeholder="0"
                              value={editTp}
                              onChange={(e) => setEditTp(e.target.value)}
                              className="w-20 rounded-md border border-border bg-surface-strong/[0.03] px-1.5 py-1 text-xs text-heading"
                            />
                          ) : (
                            formatSlTp(row.takeProfit)
                          )}
                        </td>
                      </>
                    )}
                    {tab === "positions" && (
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(row)}
                                disabled={modifyTrade.isPending}
                                title="Save SL/TP"
                                className="rounded-md border border-border p-1 text-subtle transition-colors hover:border-emerald-400/40 hover:text-emerald-700 disabled:opacity-50 dark:hover:text-emerald-300"
                              >
                                {modifyTrade.isPending ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Check className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                title="Cancel"
                                className="rounded-md border border-border p-1 text-subtle transition-colors hover:text-heading"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(row)}
                                title="Edit SL/TP"
                                className="rounded-md border border-border p-1 text-subtle transition-colors hover:border-accent/40 hover:text-accent"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleClose(row)}
                                disabled={closingTicket === String(ticket)}
                                title="Close position"
                                className="rounded-md border border-border p-1 text-subtle transition-colors hover:border-rose-400/40 hover:text-rose-700 disabled:opacity-50 dark:hover:text-rose-300"
                              >
                                {closingTicket === String(ticket) ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
