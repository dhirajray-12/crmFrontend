import React from "react";
import type { TabType } from "@/types/PartnerDasboard.types";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "partners", label: "Partners" },
  { id: "withdrawals", label: "Withdrawals" },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => (
  <div className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-surface p-1.5">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        data-voice-target={`partner tab ${tab.label.toLowerCase()}`}
        className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
          activeTab === tab.id
            ? "bg-accent/15 text-accent"
            : "text-subtle hover:bg-surface-strong/[0.05] hover:text-heading"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
