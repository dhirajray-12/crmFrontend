import { AlertCircle } from 'lucide-react';

export const InfoCard = () => (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
        <div className="flex items-start gap-3 pl-2">
            <div className="rounded-lg border border-accent/20 bg-accent/10 p-2">
                <AlertCircle className="h-4 w-4 text-accent" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-heading">Withdrawal Information</h3>
                <p className="mt-1 text-sm text-subtle">
                    Withdrawals are processed within 24-48 hours. Bank transfers
                    may take 3-5 business days to reflect in your account.
                </p>
            </div>
        </div>
    </div>
);
