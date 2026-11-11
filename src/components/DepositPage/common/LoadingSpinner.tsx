export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center p-8">
            <div className="client-theme-surface-strong flex items-center gap-3 rounded-2xl px-5 py-4 text-heading">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent/70 border-t-transparent"></div>
                <span className="text-sm font-medium">Loading deposits...</span>
            </div>
        </div>
    );
};
