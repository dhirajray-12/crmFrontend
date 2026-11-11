import { Crown, Plus } from "lucide-react";

interface EmptyStateProps {
    onCreateClick: () => void;
}

export const EmptyState = ({ onCreateClick }: EmptyStateProps) => {
  return (
    <div className="p-10 text-center">
      <Crown className="mx-auto mb-4 h-12 w-12 text-heading/20" />
      <h3 className="mb-2 text-base font-semibold text-heading">
        No Master Accounts Yet
      </h3>
      <p className="mb-6 text-sm text-subtle">
        Create your first master account to start earning commissions.
      </p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
      >
        <Plus className="h-4 w-4" />
        Create Master Account
      </button>
    </div>
  );
};
