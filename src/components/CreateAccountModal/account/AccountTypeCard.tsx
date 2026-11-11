import type { AccountType } from "@/types/createAccount.types";
import { getColorScheme } from "@/Constants/accountColors";

interface AccountTypeCardProps {
  type: AccountType;
  isSelected: boolean;
  onSelect: () => void;
}

export const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  type,
  isSelected,
  onSelect,
}) => {
  const colorScheme = getColorScheme(type._id);
  const Icon = colorScheme.icon;

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-[28px] border p-5 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden
        ${
          isSelected
            ? `border-accent/35 ${colorScheme.color} shadow-[0_22px_60px_rgba(14,165,233,0.22)]`
            : `border-border ${colorScheme.color}`
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface-strong/10">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${isSelected ? "bg-surface-strong text-heading" : "bg-surface-strong/15 text-heading"}`}>
            {isSelected ? "Selected" : "Choose"}
          </span>
        </div>
        <h4
          className={`font-bold text-base sm:text-xl mb-2 ${colorScheme.textColor}`}
        >
          {type.name}
        </h4>
        <p
          className={`text-xs sm:text-sm ${colorScheme.textColor} opacity-90 line-clamp-3`}
        >
          {type.description}
        </p>
      </div>

      {isSelected && (
        <div className="absolute bottom-4 right-4">
          <div className="w-6 h-6 bg-surface-strong rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};
