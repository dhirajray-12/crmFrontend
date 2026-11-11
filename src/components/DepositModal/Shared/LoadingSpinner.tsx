interface LoadingSpinnerProps {
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
    return (
        <div className="flex items-center justify-center gap-3 py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent/70 border-t-transparent" />
            <p className="text-sm text-subtle">{message}</p>
        </div>
    );
};
