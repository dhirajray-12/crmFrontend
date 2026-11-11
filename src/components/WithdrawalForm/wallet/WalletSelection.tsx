import { ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { WalletOptionCard } from "./WalletOptionCard";
import { InputField } from "@/components/WithdrawalForm/Shared/InputField";
import type { WalletOption } from "@/types/withdrawal.types";

interface WalletSelectionProps {
  wallets: WalletOption[];
  selectedWalletType: string;
  showOptions: boolean;
  walletAddress: string;
  onToggleOptions: () => void;
  onSelectWallet: (wallet: WalletOption) => void;
  onWalletAddressChange: (address: string) => void;
}

export const WalletSelection: React.FC<WalletSelectionProps> = ({
  wallets,
  selectedWalletType,
  showOptions,
  walletAddress,
  onToggleOptions,
  onSelectWallet,
  onWalletAddressChange,
}) => {
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

      <div
        className={`transition-all duration-300 overflow-hidden ${
          showOptions ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface-strong/[0.04] p-4 sm:grid-cols-2">
          {wallets.map((wallet) => (
            <WalletOptionCard
              key={wallet.id}
              wallet={wallet}
              isSelected={selectedWalletType === wallet.name}
              onClick={() => onSelectWallet(wallet)}
            />
          ))}
        </div>
      </div>

      {selectedWalletType && (
        <InputField
          label={`${selectedWalletType} Wallet Address`}
          type="text"
          value={walletAddress}
          onChange={(e) => onWalletAddressChange(e.target.value)}
          placeholder="Enter your wallet address"
        />
      )}
    </motion.div>
  );
};
