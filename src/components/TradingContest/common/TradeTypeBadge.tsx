interface TradeTypeBadgeProps {
  type: string;
}

export const TradeTypeBadge = ({ type }: TradeTypeBadgeProps) => {
  const isBuy = type.toLowerCase() === "buy";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${
        isBuy
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
          : "border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isBuy ? "bg-emerald-400" : "bg-rose-400"}`}
      />
      {type}
    </span>
  );
};