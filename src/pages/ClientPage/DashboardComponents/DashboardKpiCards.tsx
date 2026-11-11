import { KpiCardsGrid } from "@/components/DashboardKpiCards/KpiCardsGrid";
import { ErrorState } from "@/components/DashboardKpiCards/shared/ErrorState";
import { LoadingSkeleton } from "@/components/DashboardKpiCards/shared/LoadingSkeleton";
import { useDashboardStore } from "@/Store/dashboardStore";
import type { DashboardData } from "@/types/dashboard.types";
import { generateKpiCards } from "@/utils/dashboardUtils";
import type { UseQueryResult } from "@tanstack/react-query";
import React, { useEffect } from "react";

interface DashboardKpiCardsProps {
  queryResult: UseQueryResult<DashboardData, Error>;
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  queryResult,
}) => {
  const { data, isLoading, error, refetch } = queryResult;
  const setLastUpdated = useDashboardStore((state) => state.setLastUpdated);

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data, setLastUpdated]);

  if (isLoading && !data) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error.message} onRetry={() => refetch()} />;
  }

  if (!data) {
    return null;
  }

  const cards = generateKpiCards(data);

  return <KpiCardsGrid cards={cards} />;
};

export default DashboardKpiCards;
