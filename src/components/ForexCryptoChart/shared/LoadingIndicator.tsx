import { RefreshCw } from "lucide-react";

interface LoadingIndicatorProps {
    message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    message = "Loading your trading data..."
}) => {
    return (
        <div className="client-theme-surface mb-4 flex items-center gap-2 rounded-xl p-3 text-heading sm:gap-3 sm:p-4">
            <div className="rounded-xl bg-accent/10 p-2 text-accent">
                <RefreshCw className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
            </div>
            <p className="text-xs font-medium text-heading sm:text-sm">
                {message}
            </p>
        </div>
    );
};
