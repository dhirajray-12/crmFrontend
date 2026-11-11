import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
    label: string;
    value: string | number;
    icon: keyof typeof Icons;
    iconColor: string;
    accentColor: string;
    subLabel?: string;
    subLabelValue?: string | number;
    isCurrency?: boolean;
}

export const SummaryCard = ({
    label,
    value,
    icon,
    iconColor,
    accentColor,
    subLabel,
    subLabelValue,
}: SummaryCardProps) => {
    const IconComponent = Icons[icon as keyof typeof Icons] as LucideIcon;

    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
            <div className="pl-2">
                <p className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    {label}
                    <IconComponent className={`h-4 w-4 ${iconColor}`} />
                </p>
                <p className="truncate text-2xl font-bold text-heading sm:text-[28px]">
                    {value}
                </p>
                {subLabel && (
                    <p className={`mt-1 text-xs ${iconColor}`}>
                        {subLabelValue ? `${subLabelValue} ${subLabel}` : subLabel}
                    </p>
                )}
            </div>
        </div>
    );
};
