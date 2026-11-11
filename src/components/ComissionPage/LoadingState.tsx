import { Loader2 } from 'lucide-react';

export const LoadingState = () => (
    <div className="client-theme-bg flex min-h-screen items-center justify-center p-4">
        <div className="rounded-xl border border-border bg-surface px-6 py-8 text-center sm:px-8 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
            <p className="text-base text-subtle">Loading commission data...</p>
        </div>
    </div>
);
