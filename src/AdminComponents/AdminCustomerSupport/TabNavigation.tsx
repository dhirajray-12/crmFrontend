import { Headset, Users2 } from "lucide-react";

interface TabNavigationProps {
  activeTab: "tickets" | "agents";
  onTabChange: (tab: "tickets" | "agents") => void;
  showAgentsTab?: boolean;
}

export const TabNavigation = ({
  activeTab,
  onTabChange,
  showAgentsTab = true,
}: TabNavigationProps) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
        Workspace View
      </p>
      <h3 className="mt-1 text-xl font-semibold text-heading">
        {activeTab === "tickets" ? "Tickets" : "Agents"}
      </h3>
    </div>

    <div className="inline-flex w-full max-w-md rounded-2xl border border-border bg-surface-strong p-1 shadow-inner">
      <button
        onClick={() => onTabChange("tickets")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold transition-all duration-300 ${
          activeTab === "tickets"
            ? "bg-linear-to-br from-accent to-accent-hover text-heading shadow-[0_10px_24px_rgba(74,50,24,0.18)]"
            : "text-body hover:bg-surface-strong/60"
        }`}
      >
        <Headset className="h-4 w-4" />
        Support Tickets
      </button>

      {showAgentsTab ? (
        <button
          onClick={() => onTabChange("agents")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-semibold transition-all duration-300 ${
            activeTab === "agents"
              ? "bg-linear-to-br from-accent to-accent-hover text-heading shadow-[0_10px_24px_rgba(74,50,24,0.18)]"
              : "text-body hover:bg-surface-strong/60"
          }`}
        >
          <Users2 className="h-4 w-4" />
          Agents Management
        </button>
      ) : null}
    </div>
  </div>
);
