import { Loader2 } from "lucide-react";

export const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="client-theme-surface-strong flex items-center gap-3 rounded-2xl px-5 py-4 text-heading">
                <Loader2 className="h-7 w-7 animate-spin text-accent" />
                <span className="text-sm font-medium">Loading allocation metrics...</span>
            </div>
        </div>
    );
};
