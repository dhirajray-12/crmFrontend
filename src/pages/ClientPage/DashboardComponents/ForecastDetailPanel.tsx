import { Activity, Newspaper, Target } from "lucide-react";
import type { ForecastCard } from "@/API/marketForecastApi";
import { Panel } from "./ui/Panel";
import { SectionHeader } from "./ui/SectionHeader";
import { StatCell, StatRow } from "./ui/StatTile";
import { Pill } from "./ui/Pill";
import {
  formatMarketPair,
  formatPrice,
  formatTimestamp,
  getDirectionClasses,
  getRecommendationLabel,
} from "./aiForexForecastUtils";

interface ForecastDetailPanelProps {
  card: ForecastCard;
  disclaimer?: string;
  marketDataProvider?: string;
}

export function ForecastDetailPanel({
  card,
  disclaimer,
  marketDataProvider,
}: ForecastDetailPanelProps) {
  const classes = getDirectionClasses(card.direction);
  const pairLabel = formatMarketPair(card.symbol, card.baseCurrency, card.quoteCurrency);
  const recommendationLabel = getRecommendationLabel(card.direction, card.recommendation);
  const movementVerb =
    card.direction === "bullish"
      ? "move up"
      : card.direction === "bearish"
        ? "move down"
        : "stay in a similar range";

  return (
    <Panel className="min-w-0">
      <SectionHeader
        eyebrow={pairLabel}
        icon={classes.icon}
        title={recommendationLabel}
        description={`The system currently thinks ${pairLabel} is more likely to ${movementVerb}, based on recent price history and optional headlines.`}
        action={
          <div className="flex items-center gap-2">
            <Pill tone={classes.tone}>{card.direction}</Pill>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">Confidence</p>
              <p className="font-mono text-lg font-semibold tabular-nums text-heading">
                {card.confidence}%
              </p>
            </div>
          </div>
        }
      />

      <div className="p-4 sm:p-5">
        <StatRow columns={4}>
          <StatCell label="Current price" value={formatPrice(card.symbol, card.currentPrice)} />
          <StatCell
            label="Short trend"
            value={`${card.shortTrendPct >= 0 ? "+" : ""}${card.shortTrendPct.toFixed(2)}%`}
            tone={card.shortTrendPct >= 0 ? "positive" : "negative"}
          />
          <StatCell
            label="Longer trend"
            value={`${card.mediumTrendPct >= 0 ? "+" : ""}${card.mediumTrendPct.toFixed(2)}%`}
            tone={card.mediumTrendPct >= 0 ? "positive" : "negative"}
          />
          <StatCell
            label="Low / high zone"
            value={`${formatPrice(card.symbol, card.support)} / ${formatPrice(card.symbol, card.resistance)}`}
          />
        </StatRow>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Target className={`h-3.5 w-3.5 ${classes.accent}`} />
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                Signal strength
              </p>
            </div>
            {marketDataProvider && (
              <span className="text-[11px] text-subtle">{marketDataProvider}</span>
            )}
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong/[0.07]">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${classes.bar} transition-[width] duration-700`}
              style={{ width: `${card.confidence}%` }}
            />
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {card.reasons.map((reason) => (
              <div
                key={reason}
                className="rounded-xl border border-border bg-surface-strong/[0.03] px-3 py-2.5 text-sm text-heading"
              >
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 border-t border-border pt-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-accent" />
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                Simple summary
              </p>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">
                  Direction
                </p>
                <p className={`mt-1.5 break-words text-sm font-semibold capitalize ${classes.accent}`}>
                  {card.direction}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">
                  News score
                </p>
                <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-heading">
                  {card.newsSentimentScore >= 0 ? "+" : ""}
                  {card.newsSentimentScore.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3">
                <p className="text-[11px] uppercase tracking-[0.08em] text-subtle">
                  Headlines used
                </p>
                <p className="mt-1.5 font-mono text-sm font-semibold tabular-nums text-heading">
                  {card.newsCoverage}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
                Important note
              </p>
            </div>
            <p className="mt-3 text-sm leading-5 text-subtle">
              {disclaimer ?? "This module provides market signals and research summaries only."}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Newspaper className="h-3.5 w-3.5 text-accent" />
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
              Headlines
            </p>
          </div>
          <div className="mt-3 grid gap-2">
            {card.recentHeadlines.length > 0 ? (
              card.recentHeadlines.map((headline) => (
                <a
                  key={`${headline.url}-${headline.title}`}
                  href={headline.url || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-border bg-surface-strong/[0.03] p-3 transition-colors hover:border-border hover:bg-surface-strong/[0.05]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-heading">{headline.title}</p>
                    <Pill tone="neutral">{headline.sentimentLabel}</Pill>
                  </div>
                  <p className="mt-2 text-xs text-subtle">
                    {headline.source} • {formatTimestamp(headline.timePublished)}
                  </p>
                </a>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-surface-strong/[0.03] p-3 text-sm text-subtle">
                No free headlines available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
