import { ChevronDown } from "lucide-react";
import type { Account } from "@/types/transfer.types";
import { getAccountTypeColor } from "@/utils/TransferHelper";

interface AccountSelectorProps {
  label: string;
  selectedAccount: Account | null;
  accounts: Account[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (account: Account) => void;
  excludeAccountId?: string;
  placeholder?: string;
  voiceField?: string;
}

export const AccountSelector = ({
  label,
  selectedAccount,
  accounts,
  isOpen,
  onToggle,
  onSelect,
  excludeAccountId,
  placeholder = "Select account",
  voiceField,
}: AccountSelectorProps) => {
  const filteredAccounts = excludeAccountId
    ? accounts.filter((acc) => acc._id !== excludeAccountId)
    : accounts;

  return (
    <div data-voice-scope={voiceField ?? label.toLowerCase()}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
          data-voice-target={voiceField ?? label.toLowerCase()}
          data-voice-field={voiceField ?? label.toLowerCase()}
          className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-3 text-left transition-colors hover:bg-surface-strong/[0.06]"
        >
          {selectedAccount ? (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-bold text-heading"
                style={{
                  background: getAccountTypeColor(selectedAccount.accountType),
                }}
              >
                {selectedAccount.accountType}
              </span>
              <span className="truncate font-mono text-sm text-heading">
                {selectedAccount.mt5Account}
              </span>
              <span className="text-xs text-subtle">
                ${selectedAccount.balance.toLocaleString()}
              </span>
            </div>
          ) : (
            <span className="text-sm text-subtle">{placeholder}</span>
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-subtle transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1.5 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-surface-strong shadow-xl">
            {filteredAccounts.length === 0 && (
              <p className="px-3.5 py-3 text-sm text-subtle">
                No accounts available
              </p>
            )}
            {filteredAccounts.map((acc) => (
              <button
                key={acc._id}
                type="button"
                onClick={() => onSelect(acc)}
                data-voice-target={`${voiceField ?? label.toLowerCase()} ${acc.accountType} ${acc.mt5Account}`}
                data-voice-value={`${voiceField ?? label.toLowerCase()} ${acc.mt5Account}`}
                className="flex w-full items-center justify-between gap-2 border-b border-border px-3.5 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-strong/[0.05]"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="rounded-md px-2 py-0.5 text-[11px] font-bold text-heading"
                    style={{
                      background: getAccountTypeColor(acc.accountType),
                    }}
                  >
                    {acc.accountType}
                  </span>
                  <span className="truncate font-mono text-sm text-heading">
                    {acc.mt5Account}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-subtle">
                  ${acc.balance.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
