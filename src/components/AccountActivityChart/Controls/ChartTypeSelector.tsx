import React from 'react';
import { BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useAccountActivityStore } from '@/Store/accountActivityStore';

const chartTypes = [
    { type: 'bar' as const, label: 'Bar', icon: BarChart3 },
    { type: 'area' as const, label: 'Area', icon: TrendingUp },
    { type: 'line' as const, label: 'Line', icon: Activity },
];

export const ChartTypeSelector: React.FC = () => {
    const { chartType, setChartType } = useAccountActivityStore();

    return (
        <div className="flex justify-between rounded-xl border border-border bg-surface-strong/[0.04] p-1 shadow-inner sm:justify-start">
            {chartTypes.map(({ type, label, icon: Icon }) => (
                <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex-1 sm:flex-initial ${chartType === type
                        ? 'bg-accent/[0.14] text-accent shadow-lg'
                        : 'text-subtle hover:text-heading'
                        }`}
                >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{label}</span>
                </button>
            ))}
        </div>
    );
};
