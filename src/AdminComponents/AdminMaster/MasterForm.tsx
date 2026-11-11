import { ArrowLeft, Award, Crown } from "lucide-react";
import type {
  Account,
  CreateMasterFormData,
  MasterAccount,
} from "@/types/master.types";

interface MasterFormProps {
  mode: "create" | "update";
  master?: MasterAccount;
  accounts: Account[];
  formData: CreateMasterFormData;
  formLoading: boolean;
  formError: string;
  onBack: () => void;
  onFormChange: (data: Partial<CreateMasterFormData>) => void;
  onSubmit: () => void;
}

const fieldClassName =
  "w-full rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-heading placeholder:text-subtle focus:border-accent focus:outline-none";

export const MasterForm = ({
  mode,
  accounts,
  formData,
  formLoading,
  formError,
  onBack,
  onFormChange,
  onSubmit,
}: MasterFormProps) => {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
      <section className="rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_18px_36px_rgba(102,76,36,0.10)] sm:p-6">
        <div className="mb-6 flex items-start gap-4">
          <button
            onClick={onBack}
            className="rounded-2xl border border-border bg-surface-strong p-3 text-body"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
              Profile Setup
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-heading">
              {mode === "create"
                ? "Create master account"
                : "Update master account"}
            </h2>
            <p className="mt-1 text-sm text-body">
              Fill in the trading profile, commission, and strategy details.
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-5 rounded-2xl border border-border bg-surface-strong p-4 text-sm font-medium text-[#7a2a2a] dark:text-[#d58686]">
            {formError}
          </div>
        )}

        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
              Nickname
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => onFormChange({ nickname: e.target.value })}
              placeholder="Enter nickname"
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
              Account
            </label>
            {mode === "create" ? (
              <select
                value={formData.accountId}
                onChange={(e) => onFormChange({ accountId: e.target.value })}
                className={fieldClassName}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account.mt5Account}>
                    {account.mt5Account} - {account.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.accountId}
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm text-subtle"
              />
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-heading">
                Commission %
              </label>
              <input
                type="number"
                value={formData.commission}
                onChange={(e) => onFormChange({ commission: e.target.value })}
                placeholder="0-50"
                min="0"
                max="50"
                step="0.1"
                className={fieldClassName}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-heading">
                Minimum Investment
              </label>
              <input
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) =>
                  onFormChange({ minimumInvestment: e.target.value })
                }
                placeholder="1000"
                className={fieldClassName}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
              Public Chat Link
            </label>
            <input
              type="url"
              value={formData.publicChatLink}
              onChange={(e) => onFormChange({ publicChatLink: e.target.value })}
              placeholder="https://..."
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
              Strategy Description
            </label>
            <textarea
              value={formData.strategyDescription}
              onChange={(e) =>
                onFormChange({ strategyDescription: e.target.value })
              }
              placeholder="Describe the strategy clearly"
              rows={6}
              className={`${fieldClassName} resize-none`}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <button
            onClick={onBack}
            disabled={formLoading}
            className="rounded-2xl border border-border bg-surface-strong px-5 py-3 text-sm font-semibold text-body disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={formLoading}
            className="rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-5 py-3 text-sm font-semibold text-accent-foreground disabled:opacity-50"
          >
            {formLoading
              ? "Processing..."
              : mode === "create"
                ? "Create Master"
                : "Save Changes"}
          </button>
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_18px_36px_rgba(102,76,36,0.10)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#deeee5] dark:bg-surface-strong text-[#3f6f53] dark:text-[#91caa9]">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-heading">
                Commission Notes
              </div>
              <div className="text-xs text-subtle">
                Keep rates competitive and clear
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm text-body">
            <p>Typical positioning works best around 5% to 15%.</p>
            <p>Lower commission usually attracts more copier interest.</p>
            <p>Higher commission needs a strategy profile that feels proven.</p>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface-strong p-5 shadow-[0_18px_36px_rgba(102,76,36,0.10)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-strong text-body">
              <Crown className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-heading">
                Best Practice
              </div>
              <div className="text-xs text-subtle">
                Keep the profile easy to trust
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm text-body">
            <p>Use a specific strategy description instead of generic claims.</p>
            <p>Keep trading activity consistent to support copier confidence.</p>
            <p>Set minimum investment to qualify expectations upfront.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
