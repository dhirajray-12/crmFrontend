import { CircleDollarSign, TrendingUp, Users } from "lucide-react";
import type { Copier } from "@/types/master.types";

interface CopierDetailsProps {
  copiers: Copier[];
}

export const CopierDetails = ({ copiers }: CopierDetailsProps) => (
  <div className="rounded-[24px] border border-border bg-surface-strong p-4 shadow-[0_16px_30px_rgba(141,109,60,0.08)]">
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-body">
          Copier Registry
        </div>
        <h3 className="mt-2 flex items-center gap-2 text-xl font-semibold text-heading">
          <Users className="h-5 w-5 text-[#355877] dark:text-[#8eafcd]" />
          Copier Details ({copiers.length})
        </h3>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1.5 text-xs font-semibold text-body shadow-sm">
        <span className="h-2 w-2 rounded-full bg-accent" />
        Linked accounts
      </div>
    </div>

    {copiers.length === 0 ? (
      <div className="rounded-[22px] border border-dashed border-border bg-[rgba(255,250,241,0.66)] dark:bg-surface-strong px-6 py-10 text-center">
        <Users className="mx-auto mb-3 h-12 w-12 text-accent" />
        <p className="text-base font-semibold text-heading">No copiers yet</p>
        <p className="mt-1 text-sm text-body">
          Share your strategy profile to attract copier interest.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto rounded-[20px] border border-border">
        <table className="w-full min-w-[720px]">
          <thead className="bg-[rgba(245,236,221,0.92)] dark:bg-surface-strong">
            <tr>
              {["Name", "Account", "Balance", "Profit", "Commission Paid", "Status"].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-body"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="bg-[rgba(255,252,247,0.95)] dark:bg-surface">
            {copiers.map((copier, idx) => (
              <tr
                key={`${copier.copierAccountId.accountNumber}-${idx}`}
                className="border-t border-border transition-colors hover:bg-[rgba(251,245,234,0.82)] dark:hover:bg-surface-strong"
              >
                <td className="px-4 py-4 text-heading">
                  {copier.copierUserId.firstname} {copier.copierUserId.lastname}
                </td>
                <td className="px-4 py-4 text-sm text-body">
                  {copier.copierAccountId.accountNumber}
                </td>
                <td className="px-4 py-4 font-medium text-heading">
                  ₹{copier.copierAccountId.balance.toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#c4dbc9] bg-[#eef8f2] px-3 py-1 text-sm font-semibold text-[#3f6f53]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    ₹{copier.currentProfit.toLocaleString("en-IN")}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-sm font-semibold text-body">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    ₹{copier.totalCommissionPaid.toLocaleString("en-IN")}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex rounded-full border border-[#c4dbc9] bg-[#eef8f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#3f6f53]">
                    {copier.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
