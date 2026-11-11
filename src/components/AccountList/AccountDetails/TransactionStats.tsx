import { ArrowDownLeft, ArrowUpRight, Activity } from "lucide-react";

interface TransactionStatsProps {
    stats: {
        totalDeposits: number;
        totalWithdrawals: number;
        totalTransfers: number;
    } | null;
}

export const TransactionStats = ({ stats }: TransactionStatsProps) => {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.08] p-3 shadow-sm sm:rounded-xl sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg text-heading">
                        <ArrowDownLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-subtle">
                            Total Deposits
                        </p>
                        <p className="text-base font-bold text-heading sm:text-lg">
                            ${stats.totalDeposits.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-rose-400/20 bg-rose-500/[0.08] p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-red-400 to-rose-500 rounded-lg text-heading">
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-subtle">
                            Total Withdrawals
                        </p>
                        <p className="text-lg font-bold text-heading">
                            ${stats.totalWithdrawals.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
            <div className="rounded-xl border border-accent/20 bg-accent/[0.08] p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg text-heading">
                        <Activity className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-subtle">
                            Total Transfers
                        </p>
                        <p className="text-lg font-bold text-heading">
                            ${stats.totalTransfers.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
