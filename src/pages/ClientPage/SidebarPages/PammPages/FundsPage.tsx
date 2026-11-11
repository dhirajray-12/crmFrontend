import { useEffect, useState } from "react";
import { PieChart, TrendingUp, X } from "lucide-react";
import { clientPammApi, type PammFund } from "@/API/pammApi";
import { getAccounts } from "@/API/clientApi";
import { useToastStore } from "@/Store/toast.store";
import { formatCurrency } from "@/utils/dashboardUtils";

const inputClass = "admin-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryButton =
  "rounded-xl border border-border bg-surface-strong px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface";

const personName = (p: any) => (p && typeof p === "object" ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "—");

const InvestModal = ({ fund, onClose, onInvested }: { fund: PammFund; onClose: () => void; onInvested: () => void }) => {
  const { addToast } = useToastStore();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState(fund.minInvestment > 0 ? String(fund.minInvestment) : "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAccounts()
      .then((data) => setAccounts(data.filter((a: any) => a._id !== (typeof fund.account === "object" ? fund.account._id : fund.account))))
      .catch(() => addToast("error", "Failed to load your accounts"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!accountId) {
      addToast("error", "Select a funding account");
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      addToast("error", "Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await clientPammApi.invest({ fundId: fund._id, accountId, amount: numericAmount });
      addToast("success", "Investment request submitted for admin approval");
      onInvested();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to submit investment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface-strong p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">Invest in {fund.name}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-subtle hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-subtle">Funding Account</label>
            <select className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">Select account</option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.mt5Account} (${Number(acc.balance || 0).toFixed(2)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-subtle">
              Amount (min {formatCurrency(fund.minInvestment)})
            </label>
            <input
              type="number"
              min={fund.minInvestment}
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className={secondaryButton} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={primaryButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Invest"}
          </button>
        </div>
      </div>
    </div>
  );
};

const FundsPage = () => {
  const { addToast } = useToastStore();
  const [funds, setFunds] = useState<PammFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [investFund, setInvestFund] = useState<PammFund | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setFunds(await clientPammApi.getFunds());
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to load funds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-heading">
          <PieChart className="h-6 w-6 text-accent" /> PAMM Funds
        </h1>
        <p className="text-sm text-subtle">
          Invest alongside professional traders. Your money stays real — it moves from your own
          account into the fund's pooled account and back.
        </p>
      </div>

      {loading && <p className="text-sm text-subtle">Loading funds...</p>}
      {!loading && funds.length === 0 && (
        <p className="text-sm text-subtle">No funds are currently open for investment.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funds.map((fund) => (
          <div key={fund._id} className="rounded-2xl border border-border bg-surface-strong p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-heading">{fund.name}</h3>
                <p className="text-xs text-subtle">Managed by {personName(fund.manager)}</p>
              </div>
              <span
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  (fund.sinceInceptionReturnPercent || 0) >= 0
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-red-500/15 text-red-700 dark:text-red-300"
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {(fund.sinceInceptionReturnPercent || 0).toFixed(2)}%
              </span>
            </div>

            {fund.description && <p className="mb-3 text-sm text-body">{fund.description}</p>}

            <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-subtle">AUM</p>
                <p className="font-medium text-heading">{formatCurrency(fund.aum)}</p>
              </div>
              <div>
                <p className="text-xs text-subtle">Investors</p>
                <p className="font-medium text-heading">{fund.totalInvestors}</p>
              </div>
              <div>
                <p className="text-xs text-subtle">Mgmt Fee</p>
                <p className="font-medium text-heading">{fund.managementFeePercent}%/yr</p>
              </div>
              <div>
                <p className="text-xs text-subtle">Perf. Fee</p>
                <p className="font-medium text-heading">{fund.performanceFeePercent}%</p>
              </div>
            </div>

            <button className={`${primaryButton} w-full`} onClick={() => setInvestFund(fund)}>
              Invest
            </button>
          </div>
        ))}
      </div>

      {investFund && (
        <InvestModal
          fund={investFund}
          onClose={() => setInvestFund(null)}
          onInvested={() => {
            setInvestFund(null);
            load();
          }}
        />
      )}
    </div>
  );
};

export default FundsPage;
