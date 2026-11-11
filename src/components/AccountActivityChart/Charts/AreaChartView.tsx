import React from "react";
import type { TransactionData } from "@/types/accountActivity.types";
import { ApexActivityChart } from "@/components/AccountActivityChart/Charts/ApexActivityChart";

interface AreaChartViewProps {
  data: TransactionData[];
}

export const AreaChartView: React.FC<AreaChartViewProps> = ({ data }) => {
  return <ApexActivityChart data={data} type="area" />;
};
