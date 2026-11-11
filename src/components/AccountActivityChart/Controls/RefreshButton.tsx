import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getConfiguredTimezone } from '@/utils/timezoneStore';

interface RefreshButtonProps {
    onRefresh: () => void;
    isLoading: boolean;
    lastUpdated: Date;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
    onRefresh,
    isLoading,
    lastUpdated,
}) => {
    return (
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
                onClick={onRefresh}
                disabled={isLoading}
                className="rounded-xl border border-accent/30 bg-accent/[0.16] p-2.5 text-accent transition-all duration-300 hover:bg-accent/[0.24] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 sm:p-3"
                title="Refresh Data"
            >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex-1 rounded-lg border border-border bg-surface-strong/[0.05] px-3 py-2 text-center text-xs text-subtle sm:flex-initial sm:px-4 sm:text-left sm:text-sm">
                <span className="font-medium">Updated: </span>
                {lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: getConfiguredTimezone(),
                })}
            </div>
        </div>
    );
};
