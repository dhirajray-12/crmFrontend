// components/Modals/WithdrawalFormModal.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, CreditCard, Wallet, X } from "lucide-react";
import type { WithdrawalFormData } from "@/types/PartnerDasboard.types";
import { formatCurrency } from "@/utils/PartnerDashboard.utils";

interface WithdrawalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: WithdrawalFormData;
  onFormChange: (data: Partial<WithdrawalFormData>) => void;
  availableBalance: number;
}

export const WithdrawalFormModal: React.FC<WithdrawalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormChange,
  availableBalance,
}) => {
  if (!isOpen) return null;

  return (
    <div
      data-voice-scope="partner withdrawal modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-surface-strong p-3 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto mt-6 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface-strong p-4 sm:mt-0 sm:max-w-[30rem] sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold text-heading sm:text-xl">
            <ArrowDownCircle className="h-5 w-5 text-accent" />
            Request Withdrawal
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-subtle transition hover:bg-surface-strong/10 hover:text-heading"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-heading/90">
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              data-voice-field="amount"
              value={formData.amount}
              onChange={(e) => onFormChange({ amount: e.target.value })}
              placeholder="Enter amount"
              className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none"
            />
            <p className="mt-1 text-xs text-subtle">
              Available: {formatCurrency(availableBalance)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-heading/90">
              Withdrawal Method
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(["bank", "crypto"] as const).map((method) => (
                <label
                  key={method}
                  onClick={() => onFormChange({ method })}
                  className={`flex cursor-pointer items-center rounded-lg border p-3 transition ${
                    formData.method === method
                      ? "border-accent/30 bg-accent/10"
                      : "border-border bg-surface-strong/[0.04] hover:bg-surface-strong/[0.06]"
                  }`}
                >
                  <input
                    type="radio"
                    checked={formData.method === method}
                    onChange={() => {}}
                    className="h-4 w-4 accent-sky-400"
                  />
                  <div className="ml-3 flex items-center gap-2">
                    {method === "bank" ? (
                      <CreditCard className="h-4 w-4 text-subtle" />
                    ) : (
                      <Wallet className="h-4 w-4 text-subtle" />
                    )}
                    <span className="text-sm font-medium capitalize text-heading">
                      {method === "bank" ? "Bank Transfer" : "Cryptocurrency"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {formData.method === "bank" && (
            <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
              <input
                type="text"
                data-voice-field="bank name"
                value={formData.bankName}
                onChange={(e) => onFormChange({ bankName: e.target.value })}
                placeholder="Bank Name"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none"
              />
              <input
                type="text"
                data-voice-field="bank account number"
                value={formData.accountNumber}
                onChange={(e) =>
                  onFormChange({ accountNumber: e.target.value })
                }
                placeholder="Account Number"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none"
              />
              <input
                type="text"
                data-voice-field="account holder name"
                value={formData.accountHolderName}
                onChange={(e) =>
                  onFormChange({ accountHolderName: e.target.value })
                }
                placeholder="Account Holder Name"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none sm:col-span-2"
              />
              <input
                type="text"
                data-voice-field="ifsc code"
                value={formData.ifscCode}
                onChange={(e) => onFormChange({ ifscCode: e.target.value })}
                placeholder="IFSC Code"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none sm:col-span-2"
              />
            </div>
          )}

          {formData.method === "crypto" && (
            <div className="space-y-3 pt-1">
              <select
                data-voice-field="crypto network"
                value={formData.cryptoNetwork}
                onChange={(e) =>
                  onFormChange({ cryptoNetwork: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading focus:border-accent/40 focus:outline-none"
              >
                <option value="TRC20">TRC20 (USDT)</option>
                <option value="ERC20">ERC20 (USDT)</option>
                <option value="BEP20">BEP20 (USDT)</option>
              </select>
              <input
                type="text"
                data-voice-field="wallet address"
                value={formData.cryptoAddress}
                onChange={(e) =>
                  onFormChange({ cryptoAddress: e.target.value })
                }
                placeholder="Wallet Address"
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            data-voice-target="cancel withdrawal"
            className="flex-1 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-bold text-heading transition hover:bg-surface-strong/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            data-voice-target="submit withdrawal request"
            className="flex-1 rounded-lg bg-accent/15 px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/25"
          >
            Submit Request
          </button>
        </div>
      </motion.div>
    </div>
  );
};
