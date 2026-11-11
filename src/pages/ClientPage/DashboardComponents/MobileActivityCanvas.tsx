import { StatCell, StatRow } from "./ui/StatTile";
import {
  COLORS,
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatShortDate,
  type ActivityRow,
  type ChartType,
} from "./accountActivityChart.utils";

interface MobileActivityCanvasProps {
  rows: ActivityRow[];
  chartType: ChartType;
}

/**
 * Hand-built inline SVG cashflow chart used on narrow viewports in place of
 * the (heavier) ApexCharts renderer. Kept separate from AccountActivityChart
 * for readability — this file owns only the SVG geometry + its footer stats.
 */
export function MobileActivityCanvas({ rows, chartType }: MobileActivityCanvasProps) {
  if (rows.length === 0) {
    return null;
  }

  const width = Math.max(320, rows.length * 44 + 64);
  const height = 220;
  const paddingTop = 16;
  const paddingRight = 18;
  const paddingBottom = 34;
  const paddingLeft = 40;
  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;
  const moneyMax = Math.max(...rows.flatMap((row) => [row.deposit, row.withdrawal]), 1);
  const transactionMax = Math.max(...rows.map((row) => row.transactions), 1);
  const stepX = innerWidth / Math.max(rows.length, 1);
  const barWidth = Math.min(10, stepX * 0.22);
  const gridLevels = 4;
  const chartModeLabel =
    chartType === "bar" ? "Volume" : chartType === "area" ? "Flow" : "Mixed Pulse";
  const getMoneyY = (value: number) =>
    paddingTop + innerHeight - (Math.max(value, 0) / moneyMax) * innerHeight;
  const getTransactionY = (value: number) =>
    paddingTop + innerHeight - (Math.max(value, 0) / transactionMax) * innerHeight;
  const points = rows.map((row, index) => ({
    row,
    x: paddingLeft + stepX * index + stepX / 2,
    depositY: getMoneyY(row.deposit),
    withdrawalY: getMoneyY(row.withdrawal),
    transactionY: getTransactionY(row.transactions),
  }));
  const buildLinePoints = (key: "depositY" | "withdrawalY" | "transactionY") =>
    points.map((point) => `${point.x},${point[key]}`).join(" ");
  const buildAreaPath = (key: "depositY" | "withdrawalY") => {
    const topPath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point[key]}`)
      .join(" ");
    const lastX = points[points.length - 1]?.x ?? paddingLeft;
    const firstX = points[0]?.x ?? paddingLeft;
    const baseY = paddingTop + innerHeight;

    return `${topPath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };
  const depositPoints = buildLinePoints("depositY");
  const withdrawalPoints = buildLinePoints("withdrawalY");
  const transactionPoints = buildLinePoints("transactionY");
  const showBars = chartType !== "area";
  const showFlowAreas = chartType === "area";
  const showTransactionLine = chartType === "line";

  return (
    <div className="rounded-xl border border-border bg-surface p-2.5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">
          Swipe to view full range
        </p>
        <p className="text-[11px] text-subtle">
          {chartModeLabel} &bull; {rows.length} points
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block h-[220px]"
          style={{ width }}
          role="img"
          aria-label={`Mobile cashflow activity chart in ${chartModeLabel} mode`}
        >
          <defs>
            <linearGradient id="mobileDepositArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS.deposit} stopOpacity="0.42" />
              <stop offset="100%" stopColor={COLORS.deposit} stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="mobileWithdrawalArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS.withdrawal} stopOpacity="0.36" />
              <stop offset="100%" stopColor={COLORS.withdrawal} stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {Array.from({ length: gridLevels + 1 }, (_, index) => {
            const y = paddingTop + (innerHeight / gridLevels) * index;
            const value = Math.round(moneyMax - (moneyMax / gridLevels) * index);

            return (
              <g key={`grid-${index}`}>
                <line
                  x1={paddingLeft}
                  x2={width - paddingRight}
                  y1={y}
                  y2={y}
                  stroke="rgba(148,163,184,0.14)"
                  strokeDasharray="4 6"
                />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--body)">
                  {formatCompactNumber(value)}
                </text>
              </g>
            );
          })}

          {showFlowAreas && (
            <>
              <path d={buildAreaPath("depositY")} fill="url(#mobileDepositArea)" />
              <path d={buildAreaPath("withdrawalY")} fill="url(#mobileWithdrawalArea)" />
              <polyline
                fill="none"
                stroke={COLORS.deposit}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={depositPoints}
              />
              <polyline
                fill="none"
                stroke={COLORS.withdrawal}
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={withdrawalPoints}
              />
            </>
          )}

          {showTransactionLine && (
            <polyline
              fill="none"
              stroke={COLORS.transactions}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={transactionPoints}
            />
          )}

          {points.map(({ row, x: groupX, depositY, withdrawalY, transactionY }) => {
            const depositHeight = paddingTop + innerHeight - depositY;
            const withdrawalHeight = paddingTop + innerHeight - withdrawalY;

            return (
              <g key={row.date}>
                {showBars && (
                  <>
                    <rect
                      x={groupX - barWidth - 2}
                      y={depositY}
                      width={barWidth}
                      height={Math.max(depositHeight, 2)}
                      rx="4"
                      fill={COLORS.deposit}
                    />
                    <rect
                      x={groupX + 2}
                      y={withdrawalY}
                      width={barWidth}
                      height={Math.max(withdrawalHeight, 2)}
                      rx="4"
                      fill={COLORS.withdrawal}
                    />
                  </>
                )}
                {showFlowAreas && (
                  <>
                    <circle cx={groupX} cy={depositY} r="3.25" fill={COLORS.deposit} />
                    <circle cx={groupX} cy={withdrawalY} r="3.25" fill={COLORS.withdrawal} />
                  </>
                )}
                {showTransactionLine && (
                  <circle cx={groupX} cy={transactionY} r="3.5" fill={COLORS.transactions} />
                )}
                <text x={groupX} y={height - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
                  {formatShortDate(row.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <StatRow columns={3} className="mt-2">
        <StatCell
          label="Deposit max"
          value={formatCurrency(Math.max(...rows.map((row) => row.deposit), 0))}
        />
        <StatCell
          label="Withdrawal max"
          value={formatCurrency(Math.max(...rows.map((row) => row.withdrawal), 0))}
        />
        <StatCell
          label="Tx max"
          value={formatNumber(Math.max(...rows.map((row) => row.transactions), 0))}
        />
      </StatRow>
    </div>
  );
}

export default MobileActivityCanvas;
