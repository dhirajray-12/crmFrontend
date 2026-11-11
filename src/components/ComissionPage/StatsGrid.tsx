import { DollarSign, TrendingUp, BarChart2, Activity, Users, CreditCard, CalendarClock } from 'lucide-react';
import { useCommissionStore } from '@/Store/commission.store';
import { StatCard } from './StatCard';

export const StatsGrid = () => {
    const { stats, partners, tradeCommissions } = useCommissionStore();

    const statItems = [
        {
            title: 'Total Commission',
            value: `$${stats.totalCommission.toFixed(4)}`,
            icon: <DollarSign className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />,
            accentColor: 'bg-emerald-400',
            subtitle: `From ${tradeCommissions?.trades?.length || 0} trades`,
        },
        {
            title: "Today's Commission",
            value: `$${stats.todayCommission.toFixed(4)}`,
            icon: <CalendarClock className="h-4 w-4 text-teal-700 dark:text-teal-300" />,
            accentColor: 'bg-teal-400',
            subtitle: 'Earned today',
        },
        {
            title: 'Total Volume',
            value: stats.totalVolume.toFixed(4),
            icon: <BarChart2 className="h-4 w-4 text-accent" />,
            accentColor: 'bg-accent',
            subtitle: 'Total lots traded',
        },
        {
            title: 'Active Partners',
            value: stats.activePartners.toString(),
            icon: <Users className="h-4 w-4 text-purple-700 dark:text-purple-300" />,
            accentColor: 'bg-purple-400',
            subtitle: `Total: ${partners.length} partners`,
        },
        {
            title: '30-Day Summary',
            value: `$${stats.monthlyCommission.toFixed(4)}`,
            icon: <CreditCard className="h-4 w-4 text-amber-700 dark:text-amber-300" />,
            accentColor: 'bg-amber-400',
            subtitle: 'Last 30 days',
        },
        {
            title: 'Pending Commission',
            value: `$${stats.pendingCommission.toFixed(4)}`,
            icon: <Activity className="h-4 w-4 text-pink-700 dark:text-pink-300" />,
            accentColor: 'bg-pink-400',
            subtitle: 'Awaiting settlement',
        },
        {
            title: 'Avg Per Trade',
            value: `$${stats.avgPerTrade.toFixed(4)}`,
            icon: <TrendingUp className="h-4 w-4 text-indigo-700 dark:text-indigo-300" />,
            accentColor: 'bg-indigo-400',
            subtitle: 'Per transaction',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statItems.map((item, index) => (
                <StatCard key={index} {...item} />
            ))}
        </div>
    );
};
