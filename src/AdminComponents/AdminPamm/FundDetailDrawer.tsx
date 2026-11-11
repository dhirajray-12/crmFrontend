import { useEffect, useState } from "react";
import { X, RefreshCw, Lock } from "lucide-react";
import { adminPammApi, type PammFund, type PammInvestment, type PammTransaction } from "@/API/pammApi";
import { useToastStore } from "@/Store/toast.store";
import { formatCurrency } from "@/utils/dashboardUtils";

const secondaryButton =
  "inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-body transition-colors hover:bg-surface-strong disabled:opacity-60";

const personName = (p: any) => (p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "—");

interface FundDetailDrawerProps {
  fundId: string;
  onClose: () => void;
  onChanged: () => void;
}

export const FundDetailDrawer = ({ fundId, onClose, onChanged }: FundDetailDrawerProps) => {
  const { addToast } = useToastStore();
  const [loading, setLoading] = useState(true);
  const [fund, setFund] = useState<PammFund | null>(null);
  const [investors, setInvestors] = useState<PammInvestment[]>([]);
  const [transactions, setTransactions] = useState<PammTransaction[]>([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminPammApi.getFundById(fundId);
      setFund(data.fund);
      setInvestors(data.investors);
      setTransactions(data.transactions);
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to load fund");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundId]);

  const handleSettle = async () => {
    setBusy(true);
    try {
      const result = await adminPammApi.triggerSettlement(fundId);
      if (result?.skipped) {
        addToast("info", result.reason || "Nothing to settle");
      } else {
        addToast("success", `Settled — fees credited: ${formatCurrency(result.totalFeeCash || 0)}`);
      }
      await load();
      onChanged();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Settlement failed");
    } finally {
      setBusy(false);
    }
  };

  const handleClose = async () => {
    if (!confirm("Close this fund? This is only possible once every investor has been redeemed.")) return;
    setBusy(true);
    try {
      await adminPammApi.closeFund(fundId);
      addToast("success", "Fund closed");
      await load();
      onChanged();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to close fund");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-border bg-surface-strong p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">{fund?.name || "Fund"}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-subtle hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading || !fund ? (
          <p className="text-sm text-subtle">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">Manager</p>
                <p className="font-medium text-heading">{personName(fund.manager)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">Pool Account</p>
                <p className="font-medium text-heading">
                  {typeof fund.account === "object" ? fund.account.mt5Account : fund.account}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">NAV / Unit</p>
                <p className="font-medium text-heading">{formatCurrency(fund.navPerUnit)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">AUM</p>
                <p className="font-medium text-heading">{formatCurrency(fund.aum)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">Management Fee</p>
                <p className="font-medium text-heading">
                  {fund.managementFeePercent}% / yr ({fund.managementFeeFrequency})
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-3">
                <p className="text-xs text-subtle">Performance Fee</p>
                <p className="font-medium text-heading">{fund.performanceFeePercent}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className={secondaryButton} onClick={handleSettle} disabled={busy}>
                <RefreshCw className="h-4 w-4" /> Run Settlement Now
              </button>
              <button className={secondaryButton} onClick={handleClose} disabled={busy || fund.status === "closed"}>
                <Lock className="h-4 w-4" /> Close Fund
              </button>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-heading">
                Investors ({investors.filter((i) => i.status === "active").length})
              </h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase text-subtle">
                    <tr>
                      <th className="px-3 py-2">Investor</th>
                      <th className="px-3 py-2">Units</th>
                      <th className="px-3 py-2">Principal</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {investors.map((inv) => (
                      <tr key={inv._id}>
                        <td className="px-3 py-2 text-body">{personName(inv.investor)}</td>
                        <td className="px-3 py-2 text-body">{inv.units.toFixed(4)}</td>
                        <td className="px-3 py-2 text-body">{formatCurrency(inv.principalInvested)}</td>
                        <td className="px-3 py-2 text-body capitalize">{inv.status}</td>
                      </tr>
                    ))}
                    {investors.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-subtle">
                          No investors yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-heading">Recent Transactions</h3>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface text-xs uppercase text-subtle">
                    <tr>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td className="px-3 py-2 capitalize text-body">{tx.type.replace("_", " ")}</td>
                        <td className="px-3 py-2 text-body">{formatCurrency(tx.amount)}</td>
                        <td className="px-3 py-2 capitalize text-body">{tx.status}</td>
                        <td className="px-3 py-2 text-subtle">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-4 text-center text-subtle">
                          No transactions yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundDetailDrawer;
