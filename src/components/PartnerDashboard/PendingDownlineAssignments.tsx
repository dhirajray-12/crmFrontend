import React, { useState } from "react";
import { AlertCircle, Check, DollarSign, UserPlus } from "lucide-react";
import type { PendingDownlineIB } from "@/types/PartnerDasboard.types";

interface PendingDownlineAssignmentsProps {
  pending: PendingDownlineIB[];
  myMaximumCommission: number | null;
  onAssign: (childConfigId: string, maximumCommission: number) => Promise<void>;
  isAssigning: boolean;
}

export const PendingDownlineAssignments: React.FC<
  PendingDownlineAssignmentsProps
> = ({ pending, myMaximumCommission, onAssign, isAssigning }) => {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  if (pending.length === 0) return null;

  const handleChange = (id: string, value: string) => {
    setAmounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleAssign = async (id: string) => {
    const raw = amounts[id];
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) return;
    if (myMaximumCommission != null && value > myMaximumCommission) return;

    try {
      setSavingId(id);
      await onAssign(id, value);
      setAmounts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <UserPlus className="h-5 w-5 text-amber-700 dark:text-amber-300" />
        <h2 className="text-lg font-bold text-heading sm:text-xl">
          Referrals Awaiting Commission
        </h2>
        <span className="ml-auto rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          {pending.length}
        </span>
      </div>

      {myMaximumCommission == null ? (
        <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          Your own maximum commission hasn't been approved yet, so you can't assign
          commission to your referrals until that happens.
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-subtle">
            Choose how much of your maximum (
            <span className="font-semibold text-heading">
              ${myMaximumCommission.toFixed(2)}/lot
            </span>
            ) to grant each referral below. You keep the difference.
          </p>

          <div className="space-y-3">
            {pending.map((child) => {
              const value = amounts[child._id] ?? "";
              const numeric = parseFloat(value);
              const invalid =
                value !== "" &&
                (isNaN(numeric) ||
                  numeric < 0 ||
                  numeric > myMaximumCommission);

              return (
                <div
                  key={child._id}
                  className="flex flex-col gap-3 rounded-lg border border-border bg-surface-strong/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-heading">
                      {child.userId?.firstName} {child.userId?.lastName}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {child.userId?.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        max={myMaximumCommission}
                        value={value}
                        onChange={(e) => handleChange(child._id, e.target.value)}
                        placeholder="0.00"
                        className="w-28 rounded-lg border border-border bg-surface-strong/[0.04] py-2 pl-7 pr-2 text-sm text-heading placeholder:text-body focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <button
                      onClick={() => handleAssign(child._id)}
                      disabled={
                        value === "" || invalid || isAssigning || savingId === child._id
                      }
                      className="flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {savingId === child._id ? "Saving…" : "Assign"}
                    </button>
                  </div>
                  {invalid && (
                    <p className="text-xs text-red-700 dark:text-red-400 sm:hidden">
                      Must be between 0 and {myMaximumCommission}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
