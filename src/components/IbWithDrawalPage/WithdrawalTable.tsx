import { useState } from "react";
import { AlertTriangle, Clock, CreditCard, Wallet } from "lucide-react";
import type { Withdrawal } from "@/types/Ibwithdrawal.types";
import { withdrawalService } from "@/services/Ibwithdrawal.service";
import { useCancelWithdrawalMutation } from "@/hooks/useIBWithdrawalQueries";
import { WithdrawalStatusIcon } from "./WithdrawalStatusIcon";
import { getConfiguredTimezone } from "@/utils/timezoneStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WithdrawalTableProps {
  withdrawals: Withdrawal[];
}

export const WithdrawalTable = ({ withdrawals }: WithdrawalTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Date
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Amount
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Method
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Status
            </th>
            <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((withdrawal) => (
            <WithdrawalRow key={withdrawal._id} withdrawal={withdrawal} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface WithdrawalRowProps {
  withdrawal: Withdrawal;
}

const WithdrawalRow = ({ withdrawal }: WithdrawalRowProps) => {
  const cancelMutation = useCancelWithdrawalMutation();
  const statusInfo = withdrawalService.getStatusInfo(withdrawal.status);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmCancel = () => {
    cancelMutation.mutate(withdrawal._id, {
      onSuccess: () => setConfirmOpen(false),
    });
  };

  return (
    <>
      <tr className="border-b border-border transition hover:bg-surface-strong/[0.03]">
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-subtle" />
            <span className="text-sm text-subtle">
              {new Date(withdrawal.createdAt).toLocaleDateString(undefined, {
                timeZone: getConfiguredTimezone(),
              })}
            </span>
          </div>
        </td>
        <td className="px-3 py-3">
          <span className="text-sm font-semibold text-heading">
            ${withdrawal.amount.toFixed(2)}
          </span>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            {withdrawal.withdrawalMethod === "bank" ? (
              <CreditCard className="h-3.5 w-3.5 text-subtle" />
            ) : (
              <Wallet className="h-3.5 w-3.5 text-subtle" />
            )}
            <span className="text-sm capitalize text-subtle">
              {withdrawal.withdrawalMethod}
            </span>
          </div>
        </td>
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <WithdrawalStatusIcon status={withdrawal.status} />
            <span className={`text-sm font-medium capitalize ${statusInfo.color}`}>
              {withdrawal.status}
            </span>
          </div>
        </td>
        <td className="px-3 py-3 text-right">
          {withdrawal.status === "pending" && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-500/20"
            >
              Cancel
            </button>
          )}
        </td>
      </tr>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="border border-red-500/20 bg-surface-strong text-heading shadow-[0_30px_90px_rgba(15,23,42,0.55)]">
          <AlertDialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <div className="rounded-2xl border border-red-400/30 bg-red-500/15 p-2.5">
                <AlertTriangle className="h-5 w-5 text-red-700 dark:text-red-300" />
              </div>
              <AlertDialogTitle className="text-xl font-semibold text-heading">
                Cancel withdrawal request?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm leading-6 text-subtle">
              This will remove the pending IB withdrawal request for $
              {withdrawal.amount.toFixed(2)}. Continue only if you want to stop
              this payout before admin review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-surface-strong/5 text-heading hover:bg-surface-strong/10">
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-500 text-heading hover:bg-red-600"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
