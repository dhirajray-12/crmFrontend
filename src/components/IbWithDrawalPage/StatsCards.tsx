import { Wallet, DollarSign, Clock } from 'lucide-react';
import { useWithdrawalStore } from '@/Store/Ibwithdrawal.store';

export const StatsCards = () => {
    const { dashboardSummary, stats } = useWithdrawalStore();

    const statCards = [
        {
            title: 'Available Balance',
            value: `$${dashboardSummary?.withdrawableBalance.toFixed(4)}`,
            icon: <Wallet className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />,
            accentColor: 'bg-emerald-400',
            subtitle: 'Ready to withdraw',
        },
        {
            title: 'Total Withdrawal',
            value: `$${dashboardSummary?.totalWithdrawals.toFixed(4)}`,
            icon: <DollarSign className="h-4 w-4 text-accent" />,
            accentColor: 'bg-accent',
            subtitle: `${stats.completedCount} completed`,
        },
        {
            title: 'Pending',
            value: `$${stats.pendingAmount.toFixed(4)}`,
            icon: <Clock className="h-4 w-4 text-amber-700 dark:text-amber-300" />,
            accentColor: 'bg-amber-400',
            subtitle: 'In processing',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {statCards.map((card, index) => (
                <StatCard key={index} {...card} />
            ))}
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    accentColor: string;
    subtitle: string;
}

const StatCard = ({ title, value, icon, accentColor, subtitle }: StatCardProps) => (
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
