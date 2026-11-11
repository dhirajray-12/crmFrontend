import type { MasterAccount } from "@/types/MasterPage.type";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { MasterMobileCard } from "./MasterMobileCard";
import { EmptyState } from "./EmptyState";
import { RefreshCw } from "lucide-react";

interface MastersTableProps {
  masters: MasterAccount[];
  loading: boolean;
  error: string;
  searchTerm: string;
  expandedMaster: string | null;
  onUpdate: (master: MasterAccount) => void;
  onDelete: (accountId: string) => void;
  onToggleExpand: (masterId: string) => void;
  onRetry: () => void;
  onCreateClick: () => void;
}

export const MastersTable = ({
  masters,
  loading,
  error,
  searchTerm,
  expandedMaster,
  onUpdate,
  onDelete,
  onToggleExpand,
  onRetry,
  onCreateClick,
}: MastersTableProps) => {
  if (loading) {
    return (
      <div className="p-10 text-center">
        <RefreshCw className="mx-auto mb-4 h-6 w-6 animate-spin text-subtle" />
        <p className="text-subtle">Loading masters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-sm text-red-700 dark:text-red-300">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-lg border border-border bg-surface-strong/[0.04] px-5 py-2 text-sm text-heading transition-colors hover:bg-surface-strong/[0.08]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (masters.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  const filteredMasters = masters.filter(
    (m) =>
      m.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.accountDetails.mt5Account.includes(searchTerm),
  );

  if (filteredMasters.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-subtle">No masters match your search</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <TableHeader />
          <tbody>
            {filteredMasters.map((master, idx) => (
              <TableRow
                key={master._id}
                master={master}
                index={idx}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isExpanded={expandedMaster === master._id}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 sm:hidden">
        {filteredMasters.map((master) => (
          <MasterMobileCard
            key={master._id}
            master={master}
            onUpdate={onUpdate}
            onDelete={onDelete}
            isExpanded={expandedMaster === master._id}
            onToggleExpand={onToggleExpand}
          />
        ))}
      </div>
    </>
  );
};
