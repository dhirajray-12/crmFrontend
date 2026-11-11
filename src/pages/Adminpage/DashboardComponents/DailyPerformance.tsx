// components/DailyPerformance.tsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Repeat,
  Users,
  UserCheck,
} from "lucide-react";

const data = [
  {
    date: "Aug 26",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Aug 28",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Aug 30",
    deposits: 400,
    withdrawals: 200,
    transactions: 3,
    newClients: 1,
    ibPartners: 0,
  },
  {
    date: "Sep 1",
    deposits: 200,
    withdrawals: 150,
    transactions: 2,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 2",
    deposits: 200,
    withdrawals: 150,
    transactions: 2,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 3",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 4",
    deposits: 150,
    withdrawals: 100,
    transactions: 1,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 5",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 6",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 7",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 8",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 10",
    deposits: 1000,
    withdrawals: 500,
    transactions: 8,
    newClients: 2,
    ibPartners: 1,
  },
  {
    date: "Sep 12",
    deposits: 200,
    withdrawals: 100,
    transactions: 2,
    newClients: 1,
    ibPartners: 0,
  },
  {
    date: "Sep 14",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 16",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 18",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 20",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 22",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
  {
    date: "Sep 24",
    deposits: 0,
    withdrawals: 0,
    transactions: 0,
    newClients: 0,
    ibPartners: 0,
  },
];

const filterOptions = [
  { key: "All", label: "All", active: true },
  { key: "Financial", label: "Financial", active: false },
  { key: "Users", label: "Users", active: false },
  { key: "Line", label: "Line", active: true },
  { key: "Area", label: "Area", active: false },
  { key: "Mixed", label: "Mixed", active: false },
];

export const DailyPerformance: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState(["All", "Line"]);

  const toggleFilter = (filterKey: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  return (
    <div className="bg-surface-strong rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-heading">
              Daily Performance Trends
            </h3>
          </div>
          <p className="text-body text-sm">
            Last 30 days activity overview
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              onClick={() => toggleFilter(filter.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeFilters.includes(filter.key)
                  ? "bg-blue-600 text-heading"
                  : "bg-surface-strong text-body hover:bg-surface-strong"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">$2,000</div>
          <div className="text-sm text-body mt-1">Deposits</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-xl">
          <DollarSign className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">$500</div>
          <div className="text-sm text-body mt-1">Withdrawals</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-xl">
          <Repeat className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600">11</div>
          <div className="text-sm text-body mt-1">Transactions</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">4</div>
          <div className="text-sm text-body mt-1">New Clients</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl">
          <UserCheck className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">1</div>
          <div className="text-sm text-body mt-1">IB Partners</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--body)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--body)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface-strong)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "var(--heading)",
              }}
            />
            <Line
              type="monotone"
              dataKey="deposits"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", strokeWidth: 1, r: 3 }}
              name="Deposits"
            />
            <Line
              type="monotone"
              dataKey="withdrawals"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 1, r: 3 }}
              name="Withdrawals"
            />
            <Line
              type="monotone"
              dataKey="transactions"
              stroke="var(--accent-color)"
              strokeWidth={2}
              dot={{ fill: "var(--accent-color)", strokeWidth: 1, r: 3 }}
              name="Transactions"
            />
            <Line
              type="monotone"
              dataKey="newClients"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", strokeWidth: 1, r: 3 }}
              name="New Clients"
            />
            <Line
              type="monotone"
              dataKey="ibPartners"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", strokeWidth: 1, r: 3 }}
              name="IB Partners"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
