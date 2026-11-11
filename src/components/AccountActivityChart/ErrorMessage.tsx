import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="mb-4 p-3 sm:p-4 bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 rounded-lg flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{message}</span>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-3 py-1 bg-red-600 text-heading rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
                >
                    Retry
                </button>
            )}
        </div>
    );
};