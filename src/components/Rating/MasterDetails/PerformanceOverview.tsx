import type { MasterTrader } from "@/types/rating.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface PerformanceOverviewProps {
  master: MasterTrader;
  timeFilter: string;
}

export const PerformanceOverview = ({
  master,
  timeFilter,
}: PerformanceOverviewProps) => {
  const stats = [
    {
      label: "Profit %",
      value: master.performance?.profit || "N/A",
      valueClass: "text-emerald-700 dark:text-emerald-300",
      accentColor: "bg-emerald-400",
    },
    {
      label: "No. of Copiers",
      value: master.performance?.copier || 0,
      valueClass: "text-accent",
      accentColor: "bg-accent",
    },
    {
      label: "Total P&L",
      value: `$${master.performance?.profitAndLoss || "0"}`,
      valueClass: "text-amber-700 dark:text-amber-300",
      accentColor: "bg-amber-400",
    },
  ];

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-lg border border-border bg-surface-strong/[0.03] p-4"
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${stat.accentColor}`} />
            <p className="pl-2 text-xs text-subtle">{stat.label}</p>
            <p className={`mt-1 pl-2 text-2xl font-bold ${stat.valueClass}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {master.activityData?.[timeFilter] && (
        <div className="rounded-lg border border-border bg-surface-strong/[0.02] p-3 sm:p-4">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={master.activityData[timeFilter]}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.08)"
              />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ fill: "#38bdf8", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
};
