import React from "react";
import { KpiCard } from "@/components/DashboardKpiCards/KPI/KpiCard";
import type { KpiCardConfig } from "@/types/dashboard.types";

interface KpiCardsGridProps {
  cards: KpiCardConfig[];
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => (
        <KpiCard key={card.title} {...card} index={idx} />
      ))}
    </div>
  );
};
