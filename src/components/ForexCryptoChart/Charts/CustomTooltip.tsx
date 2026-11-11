import type {
  CustomTooltipProps,
  TradeMarker,
} from "@/types/forexCrypto.types";
import { formatPrice } from "@/utils/chartUtils";

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    const point = payload[0]?.payload;
    const markers = (point?.markers || []) as TradeMarker[];

    return (
      <div className="bg-surface-strong/30 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-border">
        <p className="font-semibold text-heading mb-2">
          {new Date((point?.date || label) as string | number).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {payload.map((entry, index) => {
          const symbol = entry.dataKey.replace("_price", "");
          return (
            <div
              key={index}
              className="flex items-center justify-between gap-4 mb-1"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-body">
                  {symbol} Price
                </span>
              </div>
              <span className="text-sm font-bold text-heading">
                {formatPrice(entry.value, symbol)}
              </span>
            </div>
          );
        })}
        {markers.length > 0 && (
          <div className="mt-3 border-t border-border/70 pt-3 space-y-2">
            {markers.map((marker) => (
              <div key={marker.id} className="rounded-md bg-surface-strong/40 px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-body">
                    {marker.symbol} {marker.type}
                  </span>
                  <span className="text-xs text-body">
                    {marker.direction.toUpperCase()} {marker.volume}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-heading">
                  {formatPrice(marker.price, marker.symbol)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  return null;
};
