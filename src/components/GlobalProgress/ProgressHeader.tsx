import { BarChart3 } from "lucide-react";
import { LiveIndicator } from "@/components/GlobalProgress/Shared/LiveIndicator";
import { formatCurrency } from "@/utils/globalProgressUtils";

interface ProgressHeaderProps {
    totalBalance: number;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({ totalBalance }) => {
    return (
        <div className="relative p-4 sm:p-6 md:p-8 border-b border-border animate-slideDown">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-accent to-accent-hover p-2 text-accent-foreground shadow-lg animate-spin-slow sm:p-3">
                        <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-heading" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-heading mb-1 animate-slideRight">
                            Portfolio Allocation
                        </h3>
                        <p
                            className="text-xs sm:text-sm text-subtle animate-slideRight break-all"
                            style={{ animationDelay: "0.1s" }}
                        >
                            Combined balance across your active trading accounts: {formatCurrency(totalBalance)}
                        </p>
                    </div>
                </div>
                <LiveIndicator />
            </div>
        </div>
    );
};
