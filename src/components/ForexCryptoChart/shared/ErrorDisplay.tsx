import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
    error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
    return (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 sm:gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <p className="text-xs sm:text-sm font-medium text-red-800">Error</p>
                <p className="text-xs sm:text-sm text-red-700 mt-1">{error}</p>
            </div>
        </div>
    );
};