// src/utils/liveChartData.ts
//
// The trading bridge's chart-data endpoint returns raw ticks, not OHLC
// candles:
//   { status, error, symbol, range_sec, start_time, end_time,
//     total_records, data: [{ bid, ask, datetime_readable, datetime_msc_readable }] }
// "range" in the request is seconds of recent history, not a candle count -
// a closed market (forex/metals outside session hours) simply returns zero
// ticks for a short window; crypto (24/7) does not.
export interface TickPoint {
  time: number; // unix seconds
  price: number; // mid of bid/ask
  bid: number;
  ask: number;
}

const toUnixSeconds = (value: unknown): number | null => {
  if (typeof value === "number") {
    return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
  }

  if (typeof value === "string") {
    // "datetime_readable" is "YYYY-MM-DD HH:mm:ss" (no "T", no timezone) -
    // Date can't parse that reliably across browsers, so normalize it first.
    const isoLike = value.includes("T") ? value : value.replace(" ", "T");
    const parsed = new Date(isoLike).getTime();
    return Number.isNaN(parsed) ? null : Math.floor(parsed / 1000);
  }

  return null;
};

export interface ChartDataResult {
  ticks: TickPoint[];
  hasData: boolean;
  message?: string;
}

export const normalizeTicks = (raw: unknown): ChartDataResult => {
  const payload = raw as
    | { status?: string; error?: boolean; message?: string; data?: unknown[] }
    | unknown[]
    | null
    | undefined;

  const list: any[] = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : [];

  const ticks: TickPoint[] = [];
  for (const item of list) {
    if (!item) continue;

    const time = toUnixSeconds(
      item.datetime_readable ?? item.time ?? item.t ?? item.timestamp,
    );
    const bid = Number(item.bid);
    const ask = Number(item.ask ?? item.bid);

    if (time === null || !Number.isFinite(bid)) continue;

    ticks.push({ time, bid, ask, price: (bid + (Number.isFinite(ask) ? ask : bid)) / 2 });
  }

  ticks.sort((a, b) => a.time - b.time);

  const isErrorPayload = !Array.isArray(payload) && (payload as any)?.error === true;

  return {
    ticks,
    hasData: ticks.length > 0,
    message: isErrorPayload ? (payload as any)?.message : undefined,
  };
};
