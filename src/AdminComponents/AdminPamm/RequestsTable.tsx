import { Check, X as XIcon } from "lucide-react";
import type { PammTransaction } from "@/API/pammApi";
import { formatCurrency } from "@/utils/dashboardUtils";

const personName = (p: any) => (p && typeof p === "object" ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "—");

const statusPill: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-red-500/15 text-red-700 dark:text-red-300",
};

interface RequestsTableProps {
  requests: PammTransaction[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  busyId?: string | null;
}

export const RequestsTable = ({ requests, loading, onApprove, onReject, busyId }: RequestsTableProps) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface-strong">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-xs uppercase text-subtle">
          <tr>
            <th className="px-4 py-3">Investor</th>
            <th className="px-4 py-3">Fund</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-subtle">
                Loading...
              </td>
            </tr>
          )}
          {!loading && requests.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-subtle">
                No requests found
              </td>
            </tr>
          )}
          {!loading &&
            requests.map((req) => (
              <tr key={req._id}>
                <td className="px-4 py-3 text-body">{personName(req.investor)}</td>
                <td className="px-4 py-3 text-body">
                  {typeof req.pamm === "object" ? req.pamm.name : req.pamm}
                </td>
                <td className="px-4 py-3 text-body">{formatCurrency(req.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusPill[req.status]}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-subtle">{new Date(req.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {req.status === "pending" ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onApprove(req._id)}
                        disabled={busyId === req._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-600/40 bg-emerald-500/10 text-emerald-700 transition-transform hover:scale-105 disabled:opacity-50 dark:text-emerald-300"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onReject(req._id)}
                        disabled={busyId === req._id}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-600/40 bg-red-500/10 text-red-700 transition-transform hover:scale-105 disabled:opacity-50 dark:text-red-300"
                        title="Reject"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="block text-right text-xs text-subtle">
                      {req.remarks || "—"}
                    </span>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestsTable;
