import type { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accentBar: string;
  valueClassName?: string;
}

const formatValue = (value: string | number): string => {
  if (typeof value === "number") {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (value.startsWith("$") || value.startsWith("+$") || value.startsWith("-$")) {
    return value;
  }
  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    return `$${numValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return value;
};

export const SummaryCard = ({
  title,
  value,
  icon,
  accentBar,
  valueClassName,
}: SummaryCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5">
      <span className={`absolute inset-y-0 left-0 w-1 ${accentBar}`} />
      <div className="flex items-center gap-2 pl-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        <span className="text-subtle">{icon}</span>
        {title}
      </div>
      <p
        className={`mt-3 truncate pl-2 text-2xl font-bold sm:text-[28px] ${
          valueClassName ?? "text-heading"
        }`}
      >
        {formatValue(value)}
      </p>
    </div>
  );
};
