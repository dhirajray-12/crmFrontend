interface EmptyStateProps {
    title: string;
    message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
    return (
        <div className="py-10 text-center">
            <p className="text-sm font-semibold text-heading">{title}</p>
            <p className="mt-1 text-xs text-subtle">{message}</p>
        </div>
    );
};
