import { useEffect, useState } from "react";
import { Wallet, X, History } from "lucide-react";
import { clientPammApi, type PammInvestment, type PammTransaction } from "@/API/pammApi";
import { useToastStore } from "@/Store/toast.store";
import { formatCurrency } from "@/utils/dashboardUtils";

const inputClass = "admin-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryButton =
  "rounded-xl border border-border bg-surface-strong px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface";

const fundName = (p: any) => (p && typeof p === "object" ? p.name : p);

const RedeemModal = ({
  investment,
  onClose,
  onRedeemed,
}: {
  investment: PammInvestment;
  onClose: () => void;
  onRedeemed: () => void;
}) => {
  const { addToast } = useToastStore();
  const [mode, setMode] = useState<"all" | "partial">("all");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (mode === "all") {
        await clientPammApi.redeem({ investmentId: investment._id, all: true });
      } else {
        const numericAmount = Number(amount);
        if (!numericAmount || numericAmount <= 0) {
          addToast("error", "Enter a valid amount");
          setSubmitting(false);
          return;
        }
        await clientPammApi.redeem({ investmentId: investment._id, amount: numericAmount });
      }
      addToast("success", "Redemption request submitted for admin approval");
      onRedeemed();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to submit redemption");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-strong p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Redeem from {fundName(investment.pamm)}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-subtle hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-subtle">
          Current value: <span className="font-medium text-heading">{formatCurrency(investment.currentValue || 0)}</span>
        </p>

        <div className="mb-4 flex gap-2">
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${mode === "all" ? "bg-accent text-heading" : "bg-surface text-body"}`}
            onClick={() => setMode("all")}
          >
            Redeem All
          </button>
          <button
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium ${mode === "partial" ? "bg-accent text-heading" : "bg-surface text-body"}`}
            onClick={() => setMode("partial")}
          >
            Partial
          </button>
        </div>

        {mode === "partial" && (
          <input
            type="number"
            min={0}
            max={investment.currentValue}
            className={inputClass}
            placeholder="Amount to redeem ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button className={secondaryButton} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={primaryButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Request Redemption"}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatementModal = ({ investment, onClose }: { investment: PammInvestment; onClose: () => void }) => {
  const { addToast } = useToastStore();
  const [transactions, setTransactions] = useState<PammTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientPammApi
      .getInvestmentTransactions(investment._id)
      .then(setTransactions)
      .catch(() => addToast("error", "Failed to load statement"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investment._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-strong p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Statement — {fundName(investment.pamm)}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-subtle hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-subtle">Loading...</p>
        ) : (
          <div className="space-y-2">
            {transactions.length === 0 && <p className="text-sm text-subtle">No transactions yet.</p>}
            {transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm">
                <div>
                  <p className="font-medium capitalize text-heading">{tx.type.replace("_", " ")}</p>
                  <p className="text-xs text-subtle">{new Date(tx.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-heading">{formatCurrency(tx.amount)}</p>
                  <p className="text-xs capitalize text-subtle">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const MyInvestmentsPage = () => {
  const { addToast } = useToastStore();
  const [investments, setInvestments] = useState<PammInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemTarget, setRedeemTarget] = useState<PammInvestment | null>(null);
  const [statementTarget, setStatementTarget] = useState<PammInvestment | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setInvestments(await clientPammApi.getMyInvestments());
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to load your investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-heading">
          <Wallet className="h-6 w-6 text-accent" /> My PAMM Investments
        </h1>
        <p className="text-sm text-subtle">Portfolio value: {formatCurrency(totalValue)}</p>
      </div>

      {loading && <p className="text-sm text-subtle">Loading...</p>}
      {!loading && investments.length === 0 && (
        <p className="text-sm text-subtle">You don't have any active PAMM investments yet.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {investments.map((inv) => (
          <div key={inv._id} className="rounded-2xl border border-border bg-surface-strong p-5">
            <h3 className="mb-3 font-semibold text-heading">{fundName(inv.pamm)}</h3>
            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-subtle">Current Value</p>
                <p className="font-medium text-heading">{formatCurrency(inv.currentValue || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-subtle">ROI</p>
                <p className={`font-medium ${(inv.roiPercent || 0) >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>
                  {(inv.roiPercent || 0).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-subtle">Principal</p>
                <p className="font-medium text-heading">{formatCurrency(inv.principalInvested)}</p>
              </div>
              <div>
                <p className="text-xs text-subtle">Units</p>
                <p className="font-medium text-heading">{inv.units.toFixed(4)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className={`${secondaryButton} flex-1`} onClick={() => setStatementTarget(inv)}>
                <History className="mr-1 inline h-4 w-4" /> Statement
              </button>
              <button className={`${primaryButton} flex-1`} onClick={() => setRedeemTarget(inv)}>
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>

      {redeemTarget && (
        <RedeemModal
          investment={redeemTarget}
          onClose={() => setRedeemTarget(null)}
          onRedeemed={() => {
            setRedeemTarget(null);
            load();
          }}
        />
      )}

      {statementTarget && (
        <StatementModal investment={statementTarget} onClose={() => setStatementTarget(null)} />
      )}
    </div>
  );
};

export default MyInvestmentsPage;
