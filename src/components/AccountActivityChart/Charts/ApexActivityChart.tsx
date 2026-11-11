import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { seriesColors } from "@/types/accountActivity.types";
import type { ChartType, TransactionData } from "@/types/accountActivity.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface ApexActivityChartProps {
  data: TransactionData[];
  type: ChartType;
}

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: getConfiguredTimezone(),
  });

const formatLongDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: getConfiguredTimezone(),
  });

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const ApexActivityChart: React.FC<ApexActivityChartProps> = ({
  data,
  type,
}) => {
  const categories = data.map((item) => formatShortDate(item.date));
  const chartHeight = "100%";
  const isMixedMode = type === "line";

  const series = isMixedMode
    ? [
        {
          name: "Deposits",
          type: "column" as const,
          data: data.map((item) => item.deposit),
          color: seriesColors.deposit,
        },
        {
          name: "Withdrawals",
          type: "column" as const,
          data: data.map((item) => item.withdrawal),
          color: seriesColors.withdrawal,
        },
        {
          name: "Transaction Count",
          type: "line" as const,
          data: data.map((item) => item.transactions),
          color: seriesColors.transactions,
        },
      ]
    : [
        {
          name: "Deposits",
          data: data.map((item) => item.deposit),
          color: seriesColors.deposit,
        },
        {
          name: "Withdrawals",
          data: data.map((item) => item.withdrawal),
          color: seriesColors.withdrawal,
        },
        {
          name: "Transaction Count",
          data: data.map((item) => item.transactions),
          color: seriesColors.transactions,
        },
      ];

  const options: ApexOptions = {
    chart: {
      type: isMixedMode ? "line" : type,
      background: "transparent",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        speed: 650,
      },
      foreColor: "#cbd5e1",
      stacked: type === "area",
    },
    colors: [
      seriesColors.deposit,
      seriesColors.withdrawal,
      seriesColors.transactions,
    ],
    grid: {
      borderColor: "rgba(148, 163, 184, 0.18)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#e2e8f0" },
      itemMargin: { horizontal: 14, vertical: 6 },
      markers: {
        size: 10,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: isMixedMode
        ? ["straight", "straight", "smooth"]
        : type === "bar"
          ? "straight"
          : "smooth",
      width: isMixedMode ? [0, 0, 4] : type === "bar" ? 0 : 3,
    },
    fill: {
      type: isMixedMode ? ["gradient", "gradient", "solid"] : "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.2,
        gradientToColors: ["#3DF288", "#FCB045", "#AEFF00"],
        opacityFrom: type === "area" ? 0.45 : 0.95,
        opacityTo: type === "area" ? 0.04 : isMixedMode ? 0.72 : 0.65,
        stops: [0, 85, 100],
      },
    },
    markers: {
      size: isMixedMode ? [0, 0, 5] : 0,
      strokeWidth: 0,
      hover: { sizeOffset: 2 },
    },
    plotOptions: {
      bar: {
        columnWidth: isMixedMode ? "42%" : "54%",
        borderRadius: isMixedMode ? 10 : 7,
        borderRadiusApplication: "end",
      },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
        },
      },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (value) =>
          value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0),
        style: {
          colors: "#94a3b8",
          fontSize: "11px",
        },
      },
    },
    theme: {
      monochrome: { enabled: false },
    },
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      custom: ({ dataPointIndex }) => {
        const point = data[dataPointIndex];

        if (!point) {
          return "";
        }

        return `
          <div style="min-width: 220px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; background: rgba(2,6,23,0.92); padding: 14px; box-shadow: 0 20px 40px rgba(2,6,23,0.45); backdrop-filter: blur(10px);">
            <p style="margin: 0 0 10px; color: #fff; font-size: 14px; font-weight: 700;">
              ${formatLongDate(point.date)}
            </p>
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <span style="display: inline-flex; align-items: center; gap: 8px; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                  <span style="width: 10px; height: 10px; border-radius: 999px; background: ${seriesColors.deposit}; display: inline-block;"></span>
                  Deposits
                </span>
                <span style="color: #f8fafc; font-size: 12px; font-weight: 700;">${formatCurrency(point.deposit)}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <span style="display: inline-flex; align-items: center; gap: 8px; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                  <span style="width: 10px; height: 10px; border-radius: 999px; background: ${seriesColors.withdrawal}; display: inline-block;"></span>
                  Withdrawals
                </span>
                <span style="color: #f8fafc; font-size: 12px; font-weight: 700;">${formatCurrency(point.withdrawal)}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <span style="display: inline-flex; align-items: center; gap: 8px; color: #e2e8f0; font-size: 12px; font-weight: 600;">
                  <span style="width: 10px; height: 10px; border-radius: 999px; background: ${seriesColors.transactions}; display: inline-block;"></span>
                  Transaction Count
                </span>
                <span style="color: #f8fafc; font-size: 12px; font-weight: 700;">${point.transactions.toFixed(0)}</span>
              </div>
            </div>
          </div>
        `;
      },
    },
    states: {
      hover: {
        filter: { type: "lighten" },
      },
      active: {
        filter: { type: "none" },
      },
    },
    annotations: isMixedMode
      ? {
          yaxis: [
            {
              y:
                data.reduce((sum, item) => sum + item.transactions, 0) /
                Math.max(data.length, 1),
              borderColor: "rgba(0, 135, 62, 0.45)",
              strokeDashArray: 5,
              label: {
                borderColor: "rgba(0, 135, 62, 0.24)",
                style: {
                  background: "#00873E",
                  color: "#f8fafc",
                  fontSize: "10px",
                },
                text: "Avg transactions",
              },
            },
          ],
        }
      : undefined,
  };

  return (
    <div className="h-full w-full rounded-[18px] bg-[radial-gradient(circle_at_top,var(--accent-soft),transparent_35%)]">
      <ReactApexChart
        type={isMixedMode ? "line" : type}
        series={series}
        options={options}
        height={chartHeight}
        width="100%"
      />
    </div>
  );
};
