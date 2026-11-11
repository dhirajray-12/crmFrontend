import { memo, useCallback, useState } from "react";
import { Activity } from "lucide-react";
import type { Account } from "@/types/Accountlist.type";
import { AccountInfo } from "./AccountInfo";
import { AccountStats } from "./AccountStats";
import { AccountActions } from "./AccountActions";
import { AccountMenu } from "./AccountMenu";

interface AccountCardProps {
  account: Account;
  index: number;
  onOpenTransactions: (account: Account) => void;
  onDeposit: (accountId: number) => void;
  onWithdrawal: (accountId: number) => void;
  onEdit: (account: Account) => void;
}

export const AccountCard = memo(
  ({
    account,
    onOpenTransactions,
    onDeposit,
    onWithdrawal,
    onEdit,
  }: AccountCardProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("button") || target.closest(".action-buttons")) {
          return;
        }
        onOpenTransactions(account);
      },
      [account, onOpenTransactions],
    );

    const handleEdit = useCallback(() => {
      setIsMenuOpen(false);
      onEdit(account);
    }, [account, onEdit]);

    const handleToggleMenu = useCallback(() => {
      setIsMenuOpen((prev) => !prev);
    }, []);

    return (
      <div
        data-voice-scope={`account ${account.accountNumber}`}
        onClick={handleCardClick}
        className="group relative flex cursor-pointer flex-col gap-4 rounded-2xl border border-border bg-surface p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-surface-strong/[0.04] hover:shadow-[0_14px_34px_rgba(56,189,248,0.10)] sm:p-5"
        data-voice-target={`account ${account.accountNumber}`}
      >
        <AccountInfo account={account} />

        <AccountStats account={account} />

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <AccountActions
            accountId={account.id}
            onDeposit={onDeposit}
            onWithdrawal={onWithdrawal}
            menuComponent={
              <AccountMenu
                isOpen={isMenuOpen}
                onToggle={handleToggleMenu}
                onEdit={handleEdit}
              />
            }
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenTransactions(account);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.02] px-3 py-2 text-xs font-semibold text-subtle transition-colors group-hover:border-accent/30 group-hover:text-accent"
        >
          <Activity className="h-3.5 w-3.5" />
          View Transactions
        </button>
      </div>
    );
  },
);

AccountCard.displayName = "AccountCard";
