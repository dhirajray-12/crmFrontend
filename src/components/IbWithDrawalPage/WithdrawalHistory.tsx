import { History } from 'lucide-react';
import { useWithdrawalStore } from '@/Store/Ibwithdrawal.store';
import { WithdrawalTable } from './WithdrawalTable';
import { WithdrawalMobileCard } from './WithdrawalMobileCard';
import { WithdrawalSummary } from './WithdrawalSummary';

export const WithdrawalHistory = () => {
  const { withdrawals } = useWithdrawalStore();

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <div className="rounded-lg border border-accent/20 bg-accent/10 p-2.5">
          <History className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-heading sm:text-xl">Withdrawal History</h2>
          <p className="text-sm text-subtle">Track every payout request and its status</p>
        </div>
      </div>

      {withdrawals.length > 0 ? (
        <>
          <div className="space-y-3 lg:hidden">
            {withdrawals.map((withdrawal) => (
              <WithdrawalMobileCard key={withdrawal._id} withdrawal={withdrawal} />
            ))}
          </div>

          <div className="hidden lg:block">
            <WithdrawalTable withdrawals={withdrawals} />
          </div>

          <WithdrawalSummary withdrawals={withdrawals} />
        </>
      ) : (
        <EmptyHistory />
      )}
    </div>
  );
};

const EmptyHistory = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="rounded-xl border border-border bg-surface-strong/[0.04] p-4">
      <History className="h-10 w-10 text-heading/30" />
    </div>
    <span className="text-base font-semibold text-heading">No withdrawal history</span>
    <span className="px-4 text-center text-sm text-subtle">
      Your withdrawal requests will appear here once submitted
    </span>
  </div>
);
