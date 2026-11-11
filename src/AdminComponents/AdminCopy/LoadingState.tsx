import { Loader2 } from 'lucide-react';

export const LoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
            <p className="text-heading text-xl">Loading your copy trading data...</p>
        </div>
    </div>
);