import type { Metric } from "@/types/globalProgress.types";

interface MetricItemProps {
  metric: Metric;
  index: number;
}

// ✅ Helper to format currency
const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const MetricItem: React.FC<MetricItemProps> = ({ metric, index }) => {
  return (
    <div
      className="group relative animate-slideUp"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="mb-2 flex flex-col items-start justify-between gap-2 rounded-2xl border border-border bg-surface-strong/[0.03] p-3 sm:mb-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`w-2 h-2 rounded-full ${metric.barColor} shadow-lg animate-pulse`}
            style={{ animationDelay: `${index * 200}ms` }}
          ></div>
          <span className="text-sm sm:text-base font-semibold text-heading group-hover:text-heading transition-all duration-300 group-hover:translate-x-1">
            {metric.label}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`animate-shimmerText bg-gradient-to-r ${metric.barColor} bg-clip-text text-lg font-bold text-transparent sm:text-xl`}
          >
            {formatCurrency(metric.balance)}
          </div>
          <div
            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold ${metric.bgColor} ${metric.textColor} border border-current/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            {metric.percentage}%
          </div>
        </div>
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-surface-strong/[0.06] shadow-inner transition-all duration-300 group-hover:h-4">
        <div
          className={`h-full rounded-full ${metric.barColor} shadow-lg relative overflow-hidden transition-all duration-1000 ease-out group-hover:shadow-2xl animate-barGrow`}
          style={{
            width: `${metric.percentage}%`,
            animationDelay: `${index * 200}ms`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-wave"></div>
        </div>

        <div className="absolute inset-0 flex items-center">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-border h-full animate-gridPulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:right-0">
        <div
          className={`w-1 h-8 rounded-full ${metric.barColor} blur-sm animate-pulse`}
        ></div>
      </div>

      <div className="absolute -left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:left-0">
        <div
          className={`w-1 h-8 rounded-full ${metric.barColor} blur-sm animate-pulse`}
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
};
