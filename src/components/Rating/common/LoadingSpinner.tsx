export const LoadingSpinner = () => {
    return (
        <div className="client-theme-bg flex min-h-screen items-center justify-center px-4">
            <div className="flex items-center gap-4 rounded-xl border border-border bg-surface px-6 py-5">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent/70 border-t-transparent" />
                <div>
                    <p className="text-sm font-semibold text-heading">Loading masters...</p>
                    <p className="text-xs text-subtle">Preparing copy-trading ratings.</p>
                </div>
            </div>
        </div>
    );
};
