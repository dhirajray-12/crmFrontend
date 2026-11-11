import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
    return (
        <div className="client-theme-surface rounded-2xl p-5">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-700 dark:text-rose-400" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-heading">
                        Failed to load dashboard data
                    </p>
                    <p className="mt-1 text-xs text-subtle">{error}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/[0.18]"
            >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
            </button>
        </div>
    );
};
