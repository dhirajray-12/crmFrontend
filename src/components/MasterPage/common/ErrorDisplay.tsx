interface ErrorDisplayProps {
    error: string;
    onRetry: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
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
};
