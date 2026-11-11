interface StatusBadgeProps {
    isActive: boolean;
}

export const StatusBadge = ({ isActive }: StatusBadgeProps) => {
    const baseClasses = "px-2.5 py-1 rounded-full text-xs font-medium border";
    const statusClasses = isActive
        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
        : "bg-gray-500/10 text-subtle border-gray-500/30";

    return (
        <span className={`${baseClasses} ${statusClasses}`}>
            {isActive ? "Active" : "Inactive"}
        </span>
    );
};
