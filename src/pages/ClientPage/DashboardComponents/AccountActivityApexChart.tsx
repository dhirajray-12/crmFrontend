import ReactApexChart from "react-apexcharts";
import type { ApexAxisChartSeries, ApexOptions } from "apexcharts";

interface AccountActivityApexChartProps {
  chartType: "bar" | "area" | "line";
  options: ApexOptions;
  series: ApexAxisChartSeries;
}

export default function AccountActivityApexChart({
  chartType,
  options,
  series,
}: AccountActivityApexChartProps) {
  return (
    <ReactApexChart
      type={chartType === "line" ? "line" : chartType}
      series={series}
      options={options}
      height="100%"
      width="100%"
    />
  );
}
