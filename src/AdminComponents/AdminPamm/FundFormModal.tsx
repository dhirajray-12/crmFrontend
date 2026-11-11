import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { adminPammApi, type PammFeeFrequency, type PammFund } from "@/API/pammApi";
import { useToastStore } from "@/Store/toast.store";

interface EligibleAccount {
  _id: string;
  mt5Account: string;
  balance: number;
  user: { firstName: string; lastName: string; email: string };
}

const inputClass =
  "admin-input w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none";
const labelClass = "mb-1.5 block text-xs font-medium text-subtle";
const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-heading shadow-[0_14px_28px_rgba(74,50,24,0.22)] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0";
const secondaryButton =
  "rounded-xl border border-border bg-surface-strong px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:bg-surface";

interface FundFormModalProps {
  fund: PammFund | null; // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

export const FundFormModal = ({ fund, onClose, onSaved }: FundFormModalProps) => {
  const { addToast } = useToastStore();
  const isEdit = Boolean(fund);

  const [accounts, setAccounts] = useState<EligibleAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [name, setName] = useState(fund?.name || "");
  const [description, setDescription] = useState(fund?.description || "");
  const [managementFeePercent, setManagementFeePercent] = useState(
    fund?.managementFeePercent?.toString() || "2",
  );
  const [managementFeeFrequency, setManagementFeeFrequency] = useState<PammFeeFrequency>(
    fund?.managementFeeFrequency || "monthly",
  );
  const [performanceFeePercent, setPerformanceFeePercent] = useState(
    fund?.performanceFeePercent?.toString() || "20",
  );
  const [minInvestment, setMinInvestment] = useState(fund?.minInvestment?.toString() || "100");
  const [status, setStatus] = useState(fund?.status || "active");

  useEffect(() => {
    if (isEdit) return;
    setLoadingAccounts(true);
    adminPammApi
      .getEligibleAccounts()
      .then((data) => setAccounts(data))
      .catch(() => addToast("error", "Failed to load eligible accounts"))
      .finally(() => setLoadingAccounts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit]);

  const handleSubmit = async () => {
    if (!isEdit && !accountId) {
      addToast("error", "Select an account to designate as the fund's pool");
      return;
    }
    if (!name.trim()) {
      addToast("error", "Fund name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && fund) {
        await adminPammApi.updateFund(fund._id, {
          name,
          description,
          managementFeePercent: Number(managementFeePercent),
          managementFeeFrequency,
          performanceFeePercent: Number(performanceFeePercent),
          minInvestment: Number(minInvestment),
          status: status as PammFund["status"],
        });
        addToast("success", "Fund updated");
      } else {
        await adminPammApi.createFund({
          accountId,
          name,
          description,
          managementFeePercent: Number(managementFeePercent),
          managementFeeFrequency,
          performanceFeePercent: Number(performanceFeePercent),
          minInvestment: Number(minInvestment),
        });
        addToast("success", "PAMM fund created");
      }
      onSaved();
    } catch (error: any) {
      addToast("error", error?.response?.data?.message || "Failed to save fund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface-strong p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-heading">
            {isEdit ? "Edit PAMM Fund" : "Create PAMM Fund"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-subtle hover:bg-surface">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {!isEdit && (
            <div>
              <label className={labelClass}>Client Account (pool account)</label>
              <select
                className={inputClass}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={loadingAccounts}
              >
                <option value="">
                  {loadingAccounts ? "Loading accounts..." : "Select an account"}
                </option>
                {accounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.mt5Account} — {acc.user?.firstName} {acc.user?.lastName} (${acc.balance?.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Fund Name</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Management Fee % (annual)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                className={inputClass}
                value={managementFeePercent}
                onChange={(e) => setManagementFeePercent(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Charged</label>
              <select
                className={inputClass}
                value={managementFeeFrequency}
                onChange={(e) => setManagementFeeFrequency(e.target.value as PammFeeFrequency)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Performance Fee %</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                className={inputClass}
                value={performanceFeePercent}
                onChange={(e) => setPerformanceFeePercent(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Min. Investment ($)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={minInvestment}
                onChange={(e) => setMinInvestment(e.target.value)}
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={status}
                onChange={(e) => setStatus(e.target.value as PammFund["status"])}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className={secondaryButton} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className={primaryButton} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Fund"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FundFormModal;
