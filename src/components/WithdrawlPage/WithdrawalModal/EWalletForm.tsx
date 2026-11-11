import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import type { WalletOption } from "@/types/WithdrawalPage.types";
import { getWalletOptions } from "@/utils/constants";

interface EWalletFormProps {
  savedWallets: any;
  selectedWalletType: string;
  walletAddress: string;
  showOptions: boolean;
  onWalletTypeSelect: (type: string) => void;
  onWalletAddressChange: (value: string) => void;
  onToggleOptions: () => void;
  onClearSavedDetails: () => void;
  onWalletSelect: (wallet: WalletOption) => void;
}

export const EWalletForm = ({
  savedWallets,
  selectedWalletType,
  walletAddress,
  showOptions,

  onWalletAddressChange,
  onToggleOptions,
  onClearSavedDetails,
  onWalletSelect,
}: EWalletFormProps) => {
  const walletOptions = getWalletOptions(savedWallets);
  const hasSavedWallets = walletOptions.some((wallet) => !!wallet.address);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <label className="block text-lg font-semibold text-heading">
          Select Cryptocurrency
        </label>
        <button
          onClick={onToggleOptions}
          data-voice-target="select cryptocurrency"
          data-voice-field="cryptocurrency"
          className="flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/[0.12] px-4 py-2 text-accent transition-colors hover:bg-accent/[0.18]"
        >
          <span>{selectedWalletType || "Choose Currency"}</span>
          {showOptions ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {hasSavedWallets && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-100">Saved wallet details applied</p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200/80">
              Your profile wallets can be used directly. Clear them here to enter a different wallet only for this withdrawal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClearSavedDetails}
            data-voice-target="use other wallet details"
            className="shrink-0 rounded-xl border border-border bg-surface-strong/10 px-4 py-2 text-sm font-medium text-heading transition-colors hover:bg-surface-strong/15"
          >
            Use Other Wallet Details
          </button>
        </div>
      )}

      <div
        className={`transition-all duration-300 overflow-hidden ${
          showOptions ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface-strong/[0.04] p-4 sm:grid-cols-2">
          {walletOptions.map((wallet) => (
            <div
              key={wallet.id}
              onClick={() => onWalletSelect(wallet)}
              data-voice-target={`wallet ${wallet.name}`}
              data-voice-value={`wallet ${wallet.name}`}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                selectedWalletType === wallet.name
                  ? "border-accent/40 bg-accent/[0.14] shadow-[0_14px_34px_rgba(14,165,233,0.16)]"
                  : "border-border bg-surface-strong/[0.05] hover:border-border hover:bg-surface-strong/[0.08]"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-hover">
                  <span className="text-xs font-bold text-accent-foreground">
                    {wallet.name.slice(0, 2)}
                  </span>
                </div>
                <h5 className="font-bold text-heading">{wallet.name}</h5>
              </div>
              <p className="mb-1 text-sm text-subtle">{wallet.description}</p>

              {wallet.address && (
                <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Saved Address: {wallet.address}
                </p>
              )}

              <div className="flex justify-between text-xs text-subtle">
                <span>⏱️ {wallet.processingTime}</span>
                <span>💸 {wallet.fee}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedWalletType && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-heading">
            {selectedWalletType} Wallet Address
          </label>
          <input
            type="text"
            value={walletAddress || ""}
            onChange={(e) => onWalletAddressChange(e.target.value)}
            placeholder="Enter your wallet address"
            data-voice-target="wallet address"
            data-voice-field="wallet address"
            className="client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle [color-scheme:dark] focus:outline-none"
          />
        </div>
      )}
    </motion.div>
  );
};
