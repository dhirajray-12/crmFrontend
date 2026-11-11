import React from "react";
import { User, CreditCard, Clock, DollarSign } from "lucide-react";

const stats = [
  { label: "Total Users", value: 1200, icon: <User size={32} /> },
  { label: "Active Subscriptions", value: 850, icon: <CreditCard size={32} /> },
  { label: "Pending Requests", value: 15, icon: <Clock size={32} /> },
  {
    label: "Revenue (This Month)",
    value: "$12,500",
    icon: <DollarSign size={32} />,
  },
];

const Dashboard: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">SuperAdmin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-surface-strong rounded-lg shadow flex items-center gap-4"
          >
            {stat.icon}
            <div>
              <p className="text-subtle">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-4">
        <button className="bg-blue-600 text-heading px-4 py-2 rounded hover:bg-blue-700 transition">
          Manage Users
        </button>
        <button className="bg-teal-600 text-heading px-4 py-2 rounded hover:bg-teal-700 transition">
          View Reports
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
