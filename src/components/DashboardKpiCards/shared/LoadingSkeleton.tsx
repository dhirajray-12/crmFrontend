import React from 'react';

export const LoadingSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="client-theme-surface h-32 animate-pulse rounded-2xl"
                />
            ))}
        </div>
    );
};
