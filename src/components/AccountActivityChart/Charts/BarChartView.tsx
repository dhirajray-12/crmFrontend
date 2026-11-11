import React from "react";
import type { TransactionData } from "@/types/accountActivity.types";
import { ApexActivityChart } from "@/components/AccountActivityChart/Charts/ApexActivityChart";

interface BarChartViewProps {
  data: TransactionData[];
}

export const BarChartView: React.FC<BarChartViewProps> = ({ data }) => {
  return <ApexActivityChart data={data} type="bar" />;
};
