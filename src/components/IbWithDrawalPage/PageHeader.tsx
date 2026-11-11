import { RefreshCw, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWithdrawalStore } from '@/Store/Ibwithdrawal.store';

interface PageHeaderProps {
    onRefresh: () => void;
}

export const PageHeader = ({ onRefresh }: PageHeaderProps) => {
    const { loading } = useWithdrawalStore();

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6"
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-accent" />

            <div className="flex flex-col gap-4 pl-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                        <Wallet className="h-3.5 w-3.5" />
                        IB payout desk
                    </div>
                    <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
                        IB Withdrawals
                    </h1>
                    <p className="mt-1 max-w-xl text-sm text-subtle">
                        Review available commission, request a payout, and track withdrawal status.
                    </p>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={loading}
                    data-voice-target="refresh ib withdrawal"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] hover:text-heading disabled:opacity-50 sm:self-start"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
        </motion.div>
    );
};
