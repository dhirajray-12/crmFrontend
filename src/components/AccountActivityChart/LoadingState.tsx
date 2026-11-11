import React from 'react';

export const LoadingState: React.FC = () => {
    return (
        <div className="flex h-full items-center justify-center">
            <div className="client-theme-surface-strong flex items-center gap-3 rounded-2xl px-5 py-4 text-heading">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent/70 border-t-transparent"></div>
                <div className="text-sm sm:text-base">Loading transaction data...</div>
            </div>
        </div>
    );
};
