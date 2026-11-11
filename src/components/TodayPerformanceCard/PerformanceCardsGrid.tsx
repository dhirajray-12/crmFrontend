import { Loader2 } from "lucide-react";
import { PerformanceCard } from "./PerformanceCard";
import { usePerformanceStore } from "@/Store/performanceStore";
import { usePerformanceData } from "@/hooks/usePerformanceData";
import { useEffect } from "react";
import type { PerformanceData } from "@/types/performance.types";

const mapPerformanceData = (data: any): PerformanceData[] => [
  {
    label: "Deposits",
    value: data?.deposits?.value ?? "$0.00",
    icon: "ArrowUpCircle",
    trend: data?.deposits?.trend ?? "0%",
    color: "emerald",
    rawValue: Number(data?.deposits?.rawValue ?? 0),
  },
  {
    label: "Withdrawals",
    value: data?.withdrawals?.value ?? "$0.00",
    icon: "ArrowDownCircle",
    trend: data?.withdrawals?.trend ?? "0%",
    color: "orange",
    rawValue: Number(data?.withdrawals?.rawValue ?? 0),
  },
  {
    label: "Transactions",
    value: data?.transactions?.value ?? "0",
    icon: "Repeat",
    trend: data?.transactions?.trend ?? "0%",
    color: "blue",
    rawValue: Number(data?.transactions?.rawValue ?? 0),
  },
  {
    label: "Net Flow",
    value: data?.netFlow?.value ?? "$0.00",
    icon: "Wallet",
    trend: data?.netFlow?.trend ?? "0%",
    color: "purple",
    rawValue: Number(data?.netFlow?.rawValue ?? 0),
  },
];

export const PerformanceCardsGrid = () => {
  const { filter, performanceData, setPerformanceData } = usePerformanceStore();
  const { data, isLoading, isError } = usePerformanceData(filter);

  useEffect(() => {
    if (data) {
      setPerformanceData(mapPerformanceData(data));
    }
  }, [data, setPerformanceData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  const cards = data ? mapPerformanceData(data) : performanceData;
  const maxRawValue = Math.max(
    ...cards.map((d) => Math.abs(Number(d.rawValue) || 0)),
    1,
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((item) => (
          <PerformanceCard key={item.label} item={item} maxRawValue={maxRawValue} />
        ))}
      </div>

      {isError && (
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          Performance data could not be loaded. Showing the latest available values.
        </div>
      )}
    </div>
  );
};
