import { RefreshCw } from "lucide-react";

export const LoadingSpinner = () => {
    return (
        <div className="p-10 text-center">
            <div className="mx-auto flex w-fit items-center gap-3 rounded-lg border border-border bg-surface-strong/[0.04] px-5 py-4">
                <RefreshCw className="h-5 w-5 animate-spin text-accent" />
                <p className="text-sm font-medium text-heading">Loading...</p>
            </div>
        </div>
    );
};
