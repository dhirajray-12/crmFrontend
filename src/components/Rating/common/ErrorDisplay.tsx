interface ErrorDisplayProps {
    message: string;
}

export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
    return (
        <div className="client-theme-bg flex min-h-screen items-center justify-center px-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-surface p-5">
                <div className="absolute inset-y-0 left-0 w-1 bg-red-400" />
                <p className="pl-2 text-sm font-semibold text-red-700 dark:text-red-300">{message}</p>
            </div>
        </div>
    );
};
