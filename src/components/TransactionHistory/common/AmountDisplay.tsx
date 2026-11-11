interface AmountDisplayProps {
    amount: number;
    size?: "sm" | "md" | "lg";
}

export const AmountDisplay = ({ amount, size = "md" }: AmountDisplayProps) => {
    const isNegative = amount < 0;
    const colorClass = isNegative ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400";

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base font-bold",
        lg: "text-lg font-bold",
    };

    const formattedAmount = isNegative
        ? `-$${Math.abs(amount).toFixed(2)}`
        : `+$${amount.toFixed(2)}`;

    return <span className={`${colorClass} ${sizeClasses[size]}`}>{formattedAmount}</span>;
};