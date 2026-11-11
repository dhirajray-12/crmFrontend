import type { MasterTrader } from "@/types/rating.types";

interface AccountDetailsProps {
  master: MasterTrader;
}

export const AccountDetails = ({ master }: AccountDetailsProps) => {
  const items = [
    {
      label: "Unrealized Profit",
      value: `$${master.accountDetails?.unrealizedProfit?.toLocaleString() || "0"}`,
      valueClass: "text-emerald-700 dark:text-emerald-300",
      accentColor: "bg-emerald-400",
    },
    {
      label: "Account Balance",
      value: `$${master.accountDetails?.accountBalance || "0"}`,
      valueClass: "text-heading",
      accentColor: "bg-accent",
    },
    {
      label: "Master Trader Bonus",
      value: `$${master.accountDetails?.masterTraderBonus || "0"}`,
      valueClass: "text-amber-700 dark:text-amber-300",
      accentColor: "bg-amber-400",
    },
    {
      label: "Leverage",
      value: `1:${master.accountDetails?.lever || "100"}`,
      valueClass: "text-heading",
      accentColor: "bg-violet-400",
    },
    {
      label: "Max Unrealized Loss",
      value: `$${master.riskManagement?.maxUnrealizedLoss?.toLocaleString() || "0"}`,
      valueClass: "text-red-700 dark:text-red-300",
      accentColor: "bg-red-400",
    },
    {
      label: "Max Loss Duration",
      value: master.riskManagement?.maxLossDuration || "N/A",
      valueClass: "text-heading",
      accentColor: "bg-slate-400",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-heading">Master's Account Details</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="relative overflow-hidden rounded-lg border border-border bg-surface-strong/[0.03] p-3.5"
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${item.accentColor}`} />
            <p className="pl-2 text-xs text-subtle">{item.label}</p>
            <p className={`mt-1 pl-2 text-lg font-bold ${item.valueClass}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
