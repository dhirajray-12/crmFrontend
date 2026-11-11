import type { MasterSummary } from "@/types/MasterPage.type";
import { SUMMARY_CARDS } from "@/utils/MasterPage.constant";
import { SummaryCard } from "./SummaryCard";
import { formatCurrency } from "@/utils/MasterPage.helper";

interface SummaryCardsProps {
  summary: MasterSummary;
}

const ACCENT_COLORS: Record<string, string> = {
  "text-blue-700 dark:text-blue-300": "bg-blue-400",
  "text-emerald-700 dark:text-emerald-300": "bg-emerald-400",
  "text-purple-700 dark:text-purple-300": "bg-purple-400",
  "text-amber-700 dark:text-amber-300": "bg-amber-400",
};

export const SummaryCards = ({ summary }: SummaryCardsProps) => {
  const getCardValue = (key: string, isCurrency: boolean = false) => {
    const value = summary[key as keyof MasterSummary];
    return isCurrency ? formatCurrency(value as number) : value;
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {SUMMARY_CARDS.map((card) => (
        <SummaryCard
          key={card.key}
          label={card.label}
          value={getCardValue(card.key, card.isCurrency)}
          icon={card.icon as any}
          iconColor={card.iconColor}
          accentColor={ACCENT_COLORS[card.iconColor] ?? "bg-accent"}
          subLabel={card.subLabel}
          subLabelValue={
            card.subLabelKey
              ? summary[card.subLabelKey as keyof MasterSummary]
              : undefined
          }
          isCurrency={card.isCurrency}
        />
      ))}
    </div>
  );
};
