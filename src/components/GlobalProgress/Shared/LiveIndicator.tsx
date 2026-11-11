export const LiveIndicator: React.FC = () => {
    return (
        <div className="rounded-full border border-emerald-400/30 bg-emerald-500/[0.16] px-3 py-1.5 sm:px-4 sm:py-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:text-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping absolute"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                Live
            </span>
        </div>
    );
};
