interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="py-10 text-center">
            <p className="mb-3 text-sm text-rose-700 dark:text-rose-300">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="rounded-lg border border-accent/20 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                >
                    Retry
                </button>
            )}
        </div>
    );
};
