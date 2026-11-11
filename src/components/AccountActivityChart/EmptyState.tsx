import React from 'react';

export const EmptyState: React.FC = () => {
    return (
        <div className="h-full flex items-center justify-center px-4">
            <div className="text-heading text-sm sm:text-lg text-center">
                No transaction data available for this period
            </div>
        </div>
    );
};