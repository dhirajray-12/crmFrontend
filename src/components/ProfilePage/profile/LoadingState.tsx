export const LoadingState = () => (
    <div className="client-theme-bg flex h-screen w-full items-center justify-center">
        <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-accent/50 border-t-transparent"></div>
            <p className="text-xl text-subtle">Loading profile...</p>
        </div>
    </div>
);
