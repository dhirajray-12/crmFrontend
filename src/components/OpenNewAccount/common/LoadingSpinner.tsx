export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.14]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
            </div>
            <span className="ml-3 text-heading">Loading...</span>
        </div>
    );
};
