import { useState } from "react";
import { X, CheckCircle2, Lock } from "lucide-react";
import type { BackendAccountResponse } from "@/types/OpenAccount.type";
import { CredentialsField } from "./CredentialsField";
import { WarningNotice } from "./WarningNotice";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAccountList: () => void;
  accountData: BackendAccountResponse["data"] | null;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  onNavigateToAccountList,
  accountData,
}: SuccessModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !accountData) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onNavigateToAccountList}
      />

      <div className="ona-scale-in relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface-strong shadow-2xl">
        <div className="relative rounded-t-2xl border-b border-border bg-emerald-500/10 p-5 sm:p-8">
          <button
            type="button"
            onClick={onNavigateToAccountList}
            className="group absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-strong/[0.05] text-subtle transition-colors duration-150 hover:bg-surface-strong/[0.1] sm:right-4 sm:top-4"
          >
            <X className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90 sm:h-5 sm:w-5" />
          </button>

          <div className="text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 sm:mb-4 sm:h-16 sm:w-16">
              <CheckCircle2 className="h-8 w-8 text-emerald-700 dark:text-emerald-400 sm:h-9 sm:w-9" />
            </div>
            <h2 className="mb-1.5 text-lg font-bold text-heading sm:text-xl">
              Account created successfully
            </h2>
            <p className="text-xs text-subtle sm:text-sm">
              Welcome to your new trading account
            </p>
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-8">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] p-4 sm:p-6">
            <h3 className="mb-3 flex items-center text-base font-bold text-heading sm:mb-4 sm:text-lg">
              <Lock className="mr-2 h-4 w-4 text-amber-700 dark:text-amber-300 sm:h-5 sm:w-5" />
              Login credentials
            </h3>

            <div className="space-y-3 sm:space-y-4">
              <CredentialsField
                label="MT5 Login:"
                value={accountData.mt5Account}
                fieldName="login"
                onCopy={copyToClipboard}
                copiedField={copiedField}
              />

              <CredentialsField
                label="Master Password:"
                value={accountData.master_pwd}
                fieldName="master"
                onCopy={copyToClipboard}
                copiedField={copiedField}
              />

              <CredentialsField
                label="Investor Password:"
                value={accountData.investor_pwd}
                fieldName="investor"
                onCopy={copyToClipboard}
                copiedField={copiedField}
              />
            </div>
          </div>

          <WarningNotice />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-surface-strong/[0.04] py-3 text-sm font-semibold text-heading transition-all duration-200 hover:border-border hover:bg-surface-strong/[0.07] sm:py-3.5"
            >
              Stay here
            </button>
            <button
              type="button"
              onClick={onNavigateToAccountList}
              className="ona-shine flex-1 rounded-xl bg-accent py-3 text-sm font-bold text-accent-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_12px_28px_rgba(56,189,248,0.35)] sm:py-3.5"
            >
              View all accounts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
