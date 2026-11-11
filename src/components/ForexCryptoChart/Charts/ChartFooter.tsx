import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface ChartFooterProps {
    dataPoints: number;
    symbolsCount: number;
    lastUpdated: Date | null;
}

export const ChartFooter: React.FC<ChartFooterProps> = ({
    dataPoints,
    symbolsCount,
    lastUpdated,
}) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 px-2 gap-2">
            <span className="text-xs sm:text-sm text-subtle">
                Showing {dataPoints} data points • {symbolsCount} symbols
            </span>
            {lastUpdated && (
                <span className="text-xs sm:text-sm text-subtle">
                    Last updated:{" "}
                    {lastUpdated.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        timeZone: getConfiguredTimezone(),
                    })}
                </span>
            )}
        </div>
    );
};