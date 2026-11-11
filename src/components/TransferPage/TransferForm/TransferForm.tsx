import { ArrowRightLeft } from "lucide-react";
import type { Account } from "@/types/transfer.types";
import type { Dispatch, FormEventHandler, RefObject, SetStateAction } from "react";
import { AccountSelector } from "./AccountSelector";
import { AmountInput } from "./AmountInput";
import { TransferButton } from "./TransferButton";

interface TransferFormProps {
  accounts: Account[];
  formData: {
    fromAccount: Account | null;
    toAccount: Account | null;
    amount: string;
  };
  fromDropdownOpen: boolean;
  toDropdownOpen: boolean;
  isProcessing: boolean;
  onFromToggle?: () => void;
  onToToggle?: () => void;
  onFromSelect?: (account: Account) => void;
  onToSelect?: (account: Account) => void;
  onAmountChange?: (value: string) => void;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  setFromDropdownOpen?: Dispatch<SetStateAction<boolean>>;
  setToDropdownOpen?: Dispatch<SetStateAction<boolean>>;
  selectFromAccount?: (account: Account) => void;
  selectToAccount?: (account: Account) => void;
  updateAmount?: (value: string) => void;
  handleTransfer?: FormEventHandler<HTMLFormElement>;
  fromDropdownRef?: RefObject<HTMLDivElement | null>;
  toDropdownRef?: RefObject<HTMLDivElement | null>;
}

export const TransferForm = ({
  accounts,
  formData,
  fromDropdownOpen,
  toDropdownOpen,
  isProcessing,
  onFromToggle,
  onToToggle,
  onFromSelect,
  onToSelect,
  onAmountChange,
  onSubmit,
  setFromDropdownOpen,
  setToDropdownOpen,
  selectFromAccount,
  selectToAccount,
  updateAmount,
  handleTransfer,
  fromDropdownRef,
  toDropdownRef,
}: TransferFormProps) => {
  const handleFromToggleInternal =
    onFromToggle ?? (() => setFromDropdownOpen?.((prev) => !prev));
  const handleToToggleInternal =
    onToToggle ?? (() => setToDropdownOpen?.((prev) => !prev));
  const handleFromSelectInternal = onFromSelect ?? selectFromAccount;
  const handleToSelectInternal = onToSelect ?? selectToAccount;
  const handleAmountChangeInternal = onAmountChange ?? updateAmount;
  const handleSubmitInternal = onSubmit ?? handleTransfer;

  return (
    <form
      onSubmit={handleSubmitInternal}
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-accent/[0.10]">
          <ArrowRightLeft className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-base font-bold text-heading">New Transfer</h3>
          <p className="text-xs text-subtle">
            Route funds between two of your accounts instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-2">
        <div ref={fromDropdownRef}>
          <AccountSelector
            label="From Account"
            selectedAccount={formData.fromAccount}
            accounts={accounts}
            isOpen={fromDropdownOpen}
            onToggle={handleFromToggleInternal ?? (() => undefined)}
            onSelect={handleFromSelectInternal ?? (() => undefined)}
            placeholder="Select source account"
            voiceField="from account"
          />
        </div>

        <div ref={toDropdownRef}>
          <AccountSelector
            label="To Account"
            selectedAccount={formData.toAccount}
            accounts={accounts}
            isOpen={toDropdownOpen}
            onToggle={handleToToggleInternal ?? (() => undefined)}
            onSelect={handleToSelectInternal ?? (() => undefined)}
            placeholder="Select destination account"
            voiceField="to account"
          />
        </div>

        <AmountInput value={formData.amount} onChange={handleAmountChangeInternal ?? (() => undefined)} />

        <TransferButton isProcessing={isProcessing} />
      </div>
    </form>
  );
};
