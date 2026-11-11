import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "Loading..."
}) => {
    return (
        <div className="flex justify-center items-center py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/20 bg-accent/[0.14]">
                <Loader2 className="h-6 w-6 animate-spin text-accent sm:h-7 sm:w-7" />
            </div>
            <span className="ml-3 text-sm text-heading sm:text-base">
                {message}
            </span>
        </div>
    );
};
