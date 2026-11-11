import React from "react";
import type { TransactionData } from "@/types/accountActivity.types";
import { ApexActivityChart } from "@/components/AccountActivityChart/Charts/ApexActivityChart";

interface LineChartViewProps {
  data: TransactionData[];
}

export const LineChartView: React.FC<LineChartViewProps> = ({ data }) => {
  return <ApexActivityChart data={data} type="line" />;
};
