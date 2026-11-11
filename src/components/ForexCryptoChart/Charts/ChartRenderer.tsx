import { useMemo } from "react";
import {
  Line,
  Area,
  Bar,
  ComposedChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "@/components/ForexCryptoChart/Charts/CustomTooltip";
import type {
  PriceData,
  LineToDisplay,
  TradeMarker,
} from "@/types/forexCrypto.types";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

interface ChartRendererProps {
  data: PriceData[];
  lines: LineToDisplay[];
  chartType: "line" | "area" | "bar";
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  data,
  lines,
  chartType,
}) => {
  const { entryMarkers, exitMarkers, liveMarkers } = useMemo(() => {
    const markers = data.flatMap((point) =>
      (point.markers || []).map((marker) => ({
        ...marker,
        timestamp: point.timestamp,
      })),
    );

    return {
      entryMarkers: markers.filter((marker) => marker.type === "entry"),
      exitMarkers: markers.filter((marker) => marker.type === "exit"),
      liveMarkers: markers.filter((marker) => marker.type === "live"),
    };
  }, [data]);

  const renderMarker = (
    markerColor: string,
    label: string,
    radius: number,
  ) =>
    function TradeMarkerShape(props: {
      cx?: number;
      cy?: number;
      payload?: TradeMarker & { timestamp: number };
    }) {
      const { cx = 0, cy = 0 } = props;

      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill={markerColor}
            stroke="#0f172a"
            strokeWidth={2}
          />
          <text
            x={cx}
            y={cy - 12}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={markerColor}
          >
            {label}
          </text>
        </g>
      );
    };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data}>
        <defs>
          {lines.map((line) => (
            <linearGradient
              key={line.key}
              id={`gradient-${line.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={line.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={line.color} stopOpacity={0.1} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke="#334155" vertical={false} opacity={0.45} />
        <XAxis
          type="number"
          dataKey="timestamp"
          domain={["dataMin", "dataMax"]}
          stroke="#94a3b8"
          fontSize={10}
          tick={{ fontSize: 10, fill: "#cbd5e1" }}
          tickFormatter={(value: number) =>
            new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: getConfiguredTimezone(),
            })
          }
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={10}
          tick={{ fontSize: 10, fill: "#cbd5e1" }}
          domain={["dataMin - dataMin*0.001", "dataMax + dataMax*0.001"]}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ paddingTop: "20px", fontSize: "12px", color: "#e2e8f0" }}
          iconType="circle"
        />
        {lines.map((line) => {
          if (chartType === "area") {
            return (
              <Area
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                fill={`url(#gradient-${line.key})`}
                strokeWidth={3}
                connectNulls
              />
            );
          } else if (chartType === "bar") {
            return (
              <Bar
                key={line.key}
                dataKey={line.key}
                fill={`url(#gradient-${line.key})`}
                stroke={line.color}
                strokeWidth={2}
                radius={[4, 4, 0, 0]}
                barSize={10}
              />
            );
          } else {
            return (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 5, stroke: "#0f172a", strokeWidth: 2 }}
                connectNulls
              />
            );
          }
        })}
        <Scatter
          data={entryMarkers}
          dataKey="price"
          fill="#22c55e"
          shape={renderMarker("#22c55e", "IN", 5)}
        />
        <Scatter
          data={exitMarkers}
          dataKey="price"
          fill="#ef4444"
          shape={renderMarker("#ef4444", "OUT", 5)}
        />
        <Scatter
          data={liveMarkers}
          dataKey="price"
          fill="#38bdf8"
          shape={renderMarker("#38bdf8", "LIVE", 4)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
