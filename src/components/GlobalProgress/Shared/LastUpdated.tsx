import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface LastUpdatedProps {
    lastUpdated: Date;
}

export const LastUpdated: React.FC<LastUpdatedProps> = ({ lastUpdated }) => {
    return (
        <div className="relative rounded-b-3xl border-t border-border bg-surface px-8 py-4 backdrop-blur-sm">
            <div
                className="flex items-center justify-center gap-2 animate-fadeIn"
                style={{ animationDelay: "1s" }}
            >
                <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <p className="text-xs text-subtle animate-shimmerText">
                    Last updated: {new Date(lastUpdated).toLocaleDateString(undefined, { timeZone: getConfiguredTimezone() })} • Data refreshes automatically
                </p>
            </div>
        </div>
    );
};
