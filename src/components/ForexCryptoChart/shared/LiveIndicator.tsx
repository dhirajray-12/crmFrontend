interface LiveIndicatorProps {
    isLive: boolean;
    hasData: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isLive, hasData }) => {
    return (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
            {isLive && hasData && (
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full live-indicator"></div>
                    <span className="text-xs sm:text-sm text-green-600 font-medium">
                        LIVE
                    </span>
                </div>
            )}
            {hasData && (
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-blue-600 font-medium">
                        Connected
                    </span>
                </div>
            )}
        </div>
    );
};