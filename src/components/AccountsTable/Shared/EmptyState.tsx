interface EmptyStateProps {
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No accounts found",
}) => {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-strong/[0.03] px-4 py-10 text-center text-sm text-subtle">
      {message}
    </div>
  );
};
