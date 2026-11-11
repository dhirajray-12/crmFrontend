import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
    onRefresh: () => void;
    loading: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, loading }) => {
    return (
        <div className="flex items-end w-full">
            <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-surface-strong/60 shadow-md hover:bg-surface-strong/80 transition disabled:opacity-50 disabled:cursor-not-allowed w-full text-sm"
                title="Refresh data"
            >
                <RefreshCw
                    className={`w-4 h-4 text-body ${loading ? "animate-spin" : ""}`}
                />
                <span className="font-medium text-body">Refresh</span>
            </button>
        </div>
    );
};