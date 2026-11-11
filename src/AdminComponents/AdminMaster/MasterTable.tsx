import { Fragment } from "react";
import {
  Crown,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { MasterAccount } from "@/types/master.types";
import { CopierDetails } from "@/AdminComponents/AdminMaster/CopierDetails";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface MasterTableProps {
  masters: MasterAccount[];
  loading: boolean;
  error: string;
  searchTerm: string;
  expandedMaster: string | null;
  onSearchChange: (term: string) => void;
  onCreateClick: () => void;
  onEditClick: (master: MasterAccount) => void;
  onViewCopiers: (masterId: string) => void;
  onDeleteClick: (masterId: string) => void;
  onRetry: () => void;
}

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const MasterTable = ({
  masters,
  loading,
  error,
  searchTerm,
  expandedMaster,
  onSearchChange,
  onCreateClick,
  onEditClick,
  onViewCopiers,
  onDeleteClick,
  onRetry,
}: MasterTableProps) => {
  const filteredMasters = masters.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.accountDetails.mt5Account.includes(searchTerm),
  );

  if (loading) {
    return (
      <section className="rounded-[28px] border border-border bg-surface-strong p-10 text-center shadow-[0_18px_36px_rgba(102,76,36,0.10)]">
        <RefreshCw className="mx-auto h-8 w-8 animate-spin text-body" />
        <p className="mt-4 text-base font-semibold text-heading">
          Loading master registry
        </p>
        <p className="mt-1 text-sm text-body">
          Syncing accounts and copier relationships.
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-border bg-surface-strong p-8 text-center shadow-[0_20px_50px_rgba(122,42,42,0.12)]">
        <p className="text-base font-semibold text-[#7a2a2a] dark:text-[#d58686]">{error}</p>
        <button
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-border bg-surface-strong px-4 py-3 text-sm font-semibold text-body"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </section>
    );
  }

  if (masters.length === 0) {
    return (
      <section className="rounded-[28px] border border-border bg-surface-strong p-10 text-center shadow-[0_18px_36px_rgba(102,76,36,0.10)]">
        <Crown className="mx-auto h-14 w-14 text-accent" />
        <h3 className="mt-4 text-xl font-semibold text-heading">
          No master accounts yet
        </h3>
        <p className="mt-2 text-sm text-body">
          Start by creating the first master account in this registry.
        </p>
        <button
          onClick={onCreateClick}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground"
        >
          <Plus className="h-4 w-4" />
          Create Master
        </button>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-border bg-surface-strong shadow-[0_18px_36px_rgba(102,76,36,0.10),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-body">
              Registry
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-heading">
              Master accounts
            </h2>
            <p className="mt-1 text-sm text-body">
              Search, edit, inspect copiers, or remove accounts from the desk.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
              <input
                type="text"
                placeholder="Search by nickname or account"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface-strong py-3 pl-10 pr-4 text-sm text-heading placeholder:text-subtle focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={onCreateClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent bg-linear-to-br from-accent to-accent-hover px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              <Plus className="h-4 w-4" />
              Create Master
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-[rgba(245,236,221,0.92)] dark:bg-surface-strong">
            <tr>
              {[
                "Master",
                "Account",
                "Status",
                "Commission",
                "Copiers",
                "Profit",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-body sm:px-6"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-[rgba(255,252,247,0.96)] dark:bg-surface">
            {filteredMasters.map((master) => (
              <Fragment key={master._id}>
                <tr className="border-t border-border align-top transition-colors hover:bg-[rgba(251,245,234,0.82)] dark:hover:bg-surface-strong">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-br from-accent to-accent-hover font-bold text-accent-foreground">
                        {master.nickname[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-heading">
                          {master.nickname}
                        </div>
                        <div className="text-sm text-subtle">
                          {new Date(master.createdAt).toLocaleDateString(undefined, {
                            timeZone: getConfiguredTimezone(),
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-body sm:px-6">
                    {master.accountDetails.mt5Account}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                        master.isActive
                          ? "border-[#c4dbc9] bg-[#eef8f2] text-[#3f6f53]"
                          : "border-border bg-surface-strong text-body"
                      }`}
                    >
                      {master.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-heading sm:px-6">
                    {master.commission}%
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#bfd4e6] bg-[#eef5fc] px-3 py-1 text-sm font-semibold text-[#355877]">
                      <Users className="h-3.5 w-3.5" />
                      {master.totalCopiers}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#3f6f53] dark:text-[#91caa9] sm:px-6">
                    {formatCurrency(master.totalProfit)}
                  </td>
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditClick(master)}
                        className="rounded-xl border border-border bg-surface-strong p-2.5 text-body"
                        title="Update"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onViewCopiers(master._id)}
                        className="rounded-xl border border-[#bfd4e6] bg-[#eef5fc] p-2.5 text-[#355877]"
                        title="View Copiers"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          onDeleteClick(master.accountDetails.mt5Account)
                        }
                        className="rounded-xl border border-border bg-surface-strong p-2.5 text-[#87534a] dark:text-[#ca9991]"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedMaster === master._id && (
                  <tr>
                    <td colSpan={7} className="bg-[rgba(247,236,216,0.55)] dark:bg-surface-strong p-5 sm:p-6">
                      <CopierDetails copiers={master.copiers} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
