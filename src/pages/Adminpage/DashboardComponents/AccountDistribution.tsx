// components/AccountDistribution.tsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Users, Eye } from "lucide-react";

const data = [
  { name: "ECN ACCOUNT", value: 40.7, count: 22, color: "#3b82f6" },
  { name: "BASIC", value: 31.5, count: 17, color: "#10b981" },
  { name: "GOLD", value: 14.8, count: 8, color: "var(--accent-color)" },
  { name: "ELITE ACCOUNT", value: 13.0, count: 7, color: "#ef4444" },
];

export const AccountDistribution: React.FC = () => {
  return (
    <div className="bg-surface-strong rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
      {" "}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        {" "}
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-heading">
              Account Distribution
            </h3>
          </div>
          <p className="text-body text-sm">
            By account type (54 total accounts)
          </p>
        </div>
      </div>
      <div className="h-48 sm:h-56 mb-4 sm:mb-6">
        {" "}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Percentage"]}
              contentStyle={{
                backgroundColor: "var(--surface-strong)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "var(--heading)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {" "}
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 sm:p-3 bg-surface rounded-xl hover:bg-surface-strong transition-colors"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              {" "}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <div>
                <div className="font-semibold text-heading text-sm sm:text-base">
                  {item.name}
                </div>{" "}
                <div className="text-sm text-subtle">
                  {item.count} accounts
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-heading">{item.value}%</span>
              <button className="p-1 text-subtle hover:text-body">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-xl">
        <div className="flex items-center justify-around text-center gap-2">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">4</div>
            <div className="text-xs sm:text-sm text-blue-700">
              Account Types
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">54</div>
            <div className="text-xs sm:text-sm text-blue-700">
              Total Accounts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
