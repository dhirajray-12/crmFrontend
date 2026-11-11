import { useState } from "react";
import { Key, ChevronDown } from "lucide-react";
import { GradientIcon } from "@/components/OpenNewAccount/common/GradientIcon";

interface CustomSettingsProps {
  customMT5Account: string;
  masterPassword: string;
  investorPassword: string;
  onCustomMT5Change: (value: string) => void;
  onMasterPasswordChange: (value: string) => void;
  onInvestorPasswordChange: (value: string) => void;
}

export const CustomSettings = ({
  customMT5Account,
  masterPassword,
  investorPassword,
  onCustomMT5Change,
  onMasterPasswordChange,
  onInvestorPasswordChange,
}: CustomSettingsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-rose-300/25">
      <div className="mb-4 flex items-center gap-3">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <GradientIcon tone="rose" icon={<Key className="h-4 w-4 sm:h-5 sm:w-5" />} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-heading sm:text-base">
            Custom credentials
          </h3>
          <p className="text-xs text-subtle">
            Optional overrides for account number and passwords
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-strong/[0.04] px-4 py-3 transition-all duration-200 hover:border-rose-300/30 hover:bg-surface-strong/[0.06]"
      >
        <div className="text-left">
          <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
            Optional section
          </p>
          <span className="mt-1 block text-sm font-semibold text-heading">
            {isExpanded ? "Hide custom settings" : "Show custom settings"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-subtle transition-transform duration-200 sm:h-5 sm:w-5 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="ona-fade-up mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              MT5 account number (optional)
            </label>
            <input
              type="text"
              value={customMT5Account}
              onChange={(e) => onCustomMT5Change(e.target.value)}
              placeholder="Leave empty for auto-generation"
              className="client-theme-input w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-surface-strong/[0.02] p-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Master password (optional)
              </label>
              <input
                type="text"
                value={masterPassword}
                onChange={(e) => onMasterPasswordChange(e.target.value)}
                placeholder="Leave empty for auto-generation"
                className="client-theme-input w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Investor password (optional)
              </label>
              <input
                type="text"
                value={investorPassword}
                onChange={(e) => onInvestorPasswordChange(e.target.value)}
                placeholder="Leave empty for auto-generation"
                className="client-theme-input w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
