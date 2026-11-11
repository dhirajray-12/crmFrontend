import type { Account } from "@/types/withdrawal.types";
import { AccountCard } from "@/components/WithdrawalForm/Accounts/AccountCard";

interface AccountsListProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
}) => {
  return (
    <div className="mb-6">
      <h3 className="mb-4 text-lg font-semibold text-heading">
        Select Account
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.account}
            account={account}
            isSelected={selectedAccount?.account === account.account}
            onClick={() => onSelectAccount(account)}
          />
        ))}
      </div>
    </div>
  );
};
