import { Check, ArrowRight } from "lucide-react";
import type { AccountType } from "@/types/OpenAccount.type";

interface AccountTypeCardProps {
  accountType: AccountType;
  isSelected: boolean;
  onClick: () => void;
}

export const AccountTypeCard = ({
  accountType,
  isSelected,
  onClick,
}: AccountTypeCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      data-voice-target={`account type ${accountType.name}`}
      data-voice-value={`${accountType.name} ${accountType.server}`}
      className={`ona-shine group relative flex min-h-[200px] w-full flex-col rounded-2xl border p-5 text-left transition-all duration-300 ${
        isSelected
          ? "border-accent/50 bg-accent/[0.07] shadow-[0_10px_30px_rgba(56,189,248,0.16)]"
          : "border-border bg-surface hover:-translate-y-1 hover:border-accent/30 hover:bg-surface-strong/[0.04] hover:shadow-[0_14px_34px_rgba(56,189,248,0.12)]"
      }`}
    >
      {isSelected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
      )}

      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-strong/[0.05] text-2xl transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
        {accountType.icon}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-heading">
        {accountType.name}
      </h3>
      <p className="mt-1.5 text-sm leading-6 text-subtle">
        {accountType.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="min-w-0 flex-1 truncate text-xs text-subtle transition-colors duration-300 group-hover:text-subtle">
          {accountType.server}
        </span>
        <ArrowRight
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isSelected
              ? "text-accent"
              : "text-subtle group-hover:translate-x-1 group-hover:text-accent"
          }`}
        />
      </div>
    </button>
  );
};
