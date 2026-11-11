import { Activity, Crown, Radio, Users } from "lucide-react";

interface MasterHeaderProps {
  mode: string;
  masterCount: number;
  accountCount: number;
  isRefreshing: boolean;
}

export const MasterHeader = ({
  mode,
  masterCount,
  accountCount,
  isRefreshing,
}: MasterHeaderProps) => {
  const statCards = [
    {
      title: "Masters",
      value: masterCount,
      icon: <Crown className="h-4 w-4 text-amber-700 dark:text-amber-300" />,
      accentColor: "bg-amber-400",
    },
    {
      title: "Accounts",
      value: accountCount,
      icon: <Users className="h-4 w-4 text-accent" />,
      accentColor: "bg-accent",
    },
    {
      title: "Sync status",
      value: isRefreshing ? "Syncing" : "Ready",
      icon: <Radio className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />,
      accentColor: "bg-emerald-400",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
        <div className="pl-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            <Activity className="h-3.5 w-3.5" />
            Master Control Deck
          </div>
          <h1 className="mt-3 text-xl font-bold text-heading sm:text-2xl">
            Copy Trading Master Console
          </h1>
          <p className="mt-1 max-w-xl text-sm text-subtle">
            Manage master accounts, monitor copier performance, and switch
            between creation and control flows.
          </p>
          <p className="mt-3 text-xs text-subtle">
            Mode: <span className="font-semibold text-heading">{mode}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-xl border border-border bg-surface p-4 sm:p-5"
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${card.accentColor}`} />
            <div className="flex items-center justify-between gap-2 pl-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                {card.title}
              </span>
              {card.icon}
            </div>
            <p className="mt-3 truncate pl-2 text-2xl font-bold text-heading sm:text-[28px]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
