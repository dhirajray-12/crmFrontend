import type { ReactNode } from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: ReactNode;
    accentColor: string;
    subtitle: string;
}

export const StatCard = ({ title, value, icon, accentColor, subtitle }: StatCardProps) => {
    return (
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className={`absolute inset-y-0 left-0 w-1 ${accentColor}`} />
            <div className="flex items-center justify-between gap-2 pl-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                    {title}
                </span>
                {icon}
            </div>
            <p className="mt-3 truncate pl-2 text-2xl font-bold text-heading sm:text-[28px]">
                {value}
            </p>
            <p className="mt-1 pl-2 text-xs text-subtle">{subtitle}</p>
        </div>
    );
};
