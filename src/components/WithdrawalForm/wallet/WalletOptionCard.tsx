import type { WalletOption } from "@/types/withdrawal.types";

interface WalletOptionCardProps {
  wallet: WalletOption;
  isSelected: boolean;
  onClick: () => void;
}

export const WalletOptionCard: React.FC<WalletOptionCardProps> = ({
  wallet,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
        isSelected
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
  );
};
