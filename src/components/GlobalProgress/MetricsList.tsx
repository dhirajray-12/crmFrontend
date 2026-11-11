import type { Metric } from "@/types/globalProgress.types";
import { MetricItem } from "./MetricItem";
import { LoadingSpinner } from "@/components/GlobalProgress/Shared/LoadingSpinner";
import { EmptyState } from "@/components/GlobalProgress/Shared/EmptyState";

interface MetricsListProps {
  metrics: Metric[];
  isLoading: boolean;
}

export const MetricsList: React.FC<MetricsListProps> = ({
  metrics,
  isLoading,
}) => {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (metrics.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="relative h-auto space-y-5 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/30 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-accent/50 sm:h-115 sm:p-6 sm:space-y-7 md:p-8">
      {metrics.map((metric, index) => (
        <MetricItem key={metric.label} metric={metric} index={index} />
      ))}
    </div>
  );
};
