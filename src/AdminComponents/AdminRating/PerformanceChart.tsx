import { Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
    data: Array<{ date: string; value: number; profit: number }>;
    timeFilter: string;
    onTimeFilterChange: (filter: string) => void;
}

export const PerformanceChart = ({ data, timeFilter, onTimeFilterChange }: PerformanceChartProps) => {
    const timeFilters = ['1W', '1M', '3M', '6M', 'ALL'];

    return (
        <div className="bg-surface-strong rounded-3xl p-8 border border-border shadow-xl mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-heading flex items-center gap-2">
                    <Activity className="w-6 h-6 text-purple-600" />
                    Performance Overview
                </h3>
                <div className="flex gap-2 flex-wrap overflow-x-auto">
                    {timeFilters.map((period) => (
                        <button
                            key={period}
                            onClick={() => onTimeFilterChange(period)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${timeFilter === period
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-heading shadow-lg'
                                : 'bg-surface text-body border border-border hover:bg-surface-strong'
                                }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-100">
                    <p className="text-green-700 text-sm mb-2">Profit %</p>
                    <p className="text-4xl font-bold text-green-600">N/A</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-accent-hover rounded-2xl p-6 border border-blue-100">
                    <p className="text-blue-700 text-sm mb-2">No. of Copiers</p>
                    <p className="text-4xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <p className="text-purple-700 text-sm mb-2">Total P&L</p>
                    <p className="text-4xl font-bold text-purple-600">$0</p>
                </div>
            </div>

            {data && (
                <div className="bg-surface rounded-2xl p-6 border border-border">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--heading)" />
                            <XAxis dataKey="date" stroke="var(--body)" />
                            <YAxis stroke="var(--body)" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface-strong)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    color: "var(--heading)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="url(#colorGradient)"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}; 