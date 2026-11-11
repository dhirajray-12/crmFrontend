import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3.5 sm:p-4">
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-700 dark:text-rose-300" />
      <p className="flex-1 text-sm text-rose-700 dark:text-rose-200">{message}</p>
      <button
        onClick={onRetry}
        className="flex-shrink-0 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-200 transition-colors hover:bg-rose-400/20 sm:text-sm"
      >
        Retry
      </button>
    </div>
  );
};
