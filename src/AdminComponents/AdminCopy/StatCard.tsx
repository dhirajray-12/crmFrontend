import { type LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: number;
    gradient: string;
}

export const StatCard = ({ icon: Icon, label, value, trend, gradient }: StatCardProps) => (
    <div className="bg-surface-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl shadow-md`}>
                <Icon className="w-6 h-6 text-heading" />
            </div>
            {trend && (
                <div className="px-2 py-1 bg-green-100 rounded-lg border border-green-300">
                    <TrendingUp className="w-4 h-4 text-green-700 inline mr-1" />
                    <span className="text-xs font-semibold text-green-700">{trend}%</span>
                </div>
            )}
        </div>
        <p className="text-body text-sm mb-1">{label}</p>
        <p className="text-3xl font-bold text-heading">{value}</p>
    </div>
);