import { useAccountTypes } from "@/hooks/useCreateAccountData";
import { useCreateAccountStore } from "@/Store/createAccountStore";
import { AccountTypeCard } from "@/components/CreateAccountModal/account/AccountTypeCard";
import { LoadingSpinner } from "@/components/CreateAccountModal/Shared/LoadingSpinner";
import { AlertMessage } from "@/components/CreateAccountModal/Shared/AlertMessage";
import type { AccountType } from "@/types/createAccount.types";

interface Step1Props {
  onNext: () => void;
}

export const Step1_AccountTypeSelection: React.FC<Step1Props> = ({
  onNext,
}) => {
  const { selectedType, setSelectedType } = useCreateAccountStore();
  const { data: accountTypes, isLoading, error, refetch } = useAccountTypes();

  if (isLoading) {
    return <LoadingSpinner message="Loading account types..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertMessage
          type="error"
          message="Failed to fetch account types. Please try again."
        />
        <button
          onClick={() => refetch()}
          className="rounded-xl border border-accent/20 bg-accent/20 px-4 py-2 text-accent transition-all hover:bg-accent/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!accountTypes || accountTypes.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-subtle sm:text-base">
        No account types available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="rounded-[28px] border border-border bg-surface-strong/[0.04] p-5 text-center sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/80">
          Step 01
        </p>
        <p className="mt-3 text-base leading-relaxed text-subtle sm:text-lg">
          Create a new trading account to diversify your trading strategy and
          explore new opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {accountTypes.map((type: AccountType) => (
          <AccountTypeCard
            key={type._id}
            type={type}
            isSelected={selectedType?._id === type._id}
            onSelect={() => setSelectedType(type)}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-col items-stretch justify-between gap-3 rounded-[28px] border border-accent/15 bg-accent/[0.08] p-4 shadow-inner sm:mt-8 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent/80">
            Continue
          </p>
          <div className="mt-2 text-xs font-medium text-accent sm:text-sm">
            Learn more about different account types
          </div>
        </div>
        <button
          disabled={!selectedType}
          onClick={onNext}
          className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all ${
            selectedType
              ? "border border-accent/20 bg-gradient-to-r from-accent via-accent to-amber-400 text-heading shadow-[0_18px_40px_rgba(14,165,233,0.24)] hover:brightness-110"
              : "cursor-not-allowed border border-border bg-surface-strong/[0.04] text-subtle"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
