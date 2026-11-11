import React from "react";
import type { AccountListItem } from "@/hooks/useAccountsData";
import { AccountCard } from "./AccountCard";

interface MobileAccountListProps {
  accounts: AccountListItem[];
  onDepositClick: () => void;
  onWithdrawClick: () => void;
}

export const MobileAccountList: React.FC<MobileAccountListProps> = ({
  accounts,
  onDepositClick,
  onWithdrawClick,
}) => {
  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <AccountCard
          key={account._id}
          account={account}
          onDepositClick={onDepositClick}
          onWithdrawClick={onWithdrawClick}
        />
      ))}
    </div>
  );
};
