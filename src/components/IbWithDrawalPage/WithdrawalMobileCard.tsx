import { useState } from "react";
import { AlertTriangle, CreditCard, Wallet } from "lucide-react";
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

interface WithdrawalMobileCardProps {
  withdrawal: Withdrawal;
}

export const WithdrawalMobileCard = ({ withdrawal }: WithdrawalMobileCardProps) => {
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
      <div className="rounded-lg border border-border bg-surface-strong/[0.03] p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-lg font-bold text-heading">
              ${withdrawal.amount.toFixed(2)}
            </p>
            <p className="mt-0.5 text-xs text-subtle">
              {new Date(withdrawal.createdAt).toLocaleDateString(undefined, {
                timeZone: getConfiguredTimezone(),
              })}
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-surface-strong/[0.04] px-2 py-1">
            <WithdrawalStatusIcon status={withdrawal.status} />
            <span className={`text-xs font-semibold capitalize ${statusInfo.color}`}>
              {withdrawal.status}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-subtle">
          {withdrawal.withdrawalMethod === "bank" ? (
            <CreditCard className="h-3.5 w-3.5" />
          ) : (
            <Wallet className="h-3.5 w-3.5" />
          )}
          <span className="capitalize">{withdrawal.withdrawalMethod}</span>
        </div>

        {withdrawal.status === "pending" && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="mt-3 w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-700 dark:text-red-300 transition hover:bg-red-500/20"
          >
            Cancel Request
          </button>
        )}
      </div>

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
