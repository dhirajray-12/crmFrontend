import type { Account } from "@/types/withdrawal.types";

interface AccountCardProps {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isSelected,
  onClick,
}) => {
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "BASIC":
        return "💼";
      case "PRIME":
        return "✨";
      case "ALPHA":
        return "⚡";
      case "PROEDGE":
        return "✨";
      case "INFINITY":
        return "⚡";
      default:
        return "💼";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl shadow-lg bg-gradient-to-r ${account.color} border-2 transition-all duration-300 hover:scale-105 ${
        isSelected ? "ring-4 ring-orange-300 scale-105" : "border-border"
      }`}
    >
      <div className="text-left">
        <p className="text-sm mb-1 text-heading font-semibold">
          {getAccountTypeIcon(account.accountType)} {account.accountType}
        </p>
        <p className="font-mono text-sm text-heading mb-2">
          {account.account}
        </p>
        <p className="text-xs text-heading">Available</p>
        <p className="text-xl font-bold text-heading">{account.balance}</p>
      </div>
    </button>
  );
};
