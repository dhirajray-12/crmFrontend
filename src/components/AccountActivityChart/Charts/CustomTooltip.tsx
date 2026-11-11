import React from "react";
import { seriesColors } from "@/types/accountActivity.types";
import type { CustomTooltipProps } from "@/types/accountActivity.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-surface-strong p-3 shadow-2xl backdrop-blur-sm sm:p-6">
        <p className="font-bold text-heading mb-2 sm:mb-3 text-sm sm:text-lg">
          {new Date(label!).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: getConfiguredTimezone(),
          })}
        </p>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 sm:gap-6 mb-1 sm:mb-2 last:mb-0"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-lg"
                style={{
                  backgroundColor: seriesColors[entry.dataKey] || "#999",
                }}
              />
              <span className="text-xs sm:text-sm font-semibold text-heading">
                {entry.name}
              </span>
            </div>
            <span className="rounded-lg bg-surface-strong/[0.08] px-2 py-0.5 text-xs font-bold text-heading sm:px-3 sm:py-1 sm:text-sm">
              {entry.dataKey === "transactions"
                ? entry.value.toFixed(0)
                : `$${entry.value.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
