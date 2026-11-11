import type { AccountType } from "@/types/OpenAccount.type";
import { AccountTypeCard } from "./AccountTypeCard";

interface AccountTypeGridProps {
  accountTypes: AccountType[];
  selectedUserType: string | null;
  onSelect: (userTypeId: string) => void;
}

export const AccountTypeGrid = ({
  accountTypes,
  selectedUserType,
  onSelect,
}: AccountTypeGridProps) => {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-heading sm:text-xl">
            Select an account type
          </h2>
          <p className="mt-1 text-sm text-subtle">
            Each profile routes to a different trading server and feature
            set.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface-strong/[0.04] px-3 py-1 text-xs font-medium text-subtle">
          {accountTypes.length} available
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {accountTypes.map((userType) => (
          <AccountTypeCard
            key={userType.id}
            accountType={userType}
            isSelected={selectedUserType === userType.id}
            onClick={() => onSelect(userType.id)}
          />
        ))}
      </div>
    </section>
  );
};
