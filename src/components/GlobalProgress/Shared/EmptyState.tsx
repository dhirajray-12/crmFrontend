interface EmptyStateProps {
    title?: string;
    message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No accounts found",
    message = "Add accounts to view your portfolio overview",
}) => {
    return (
        <div className="text-center py-20">
            <p className="text-subtle text-lg">{title}</p>
            <p className="text-subtle text-sm mt-2">{message}</p>
        </div>
    );
};