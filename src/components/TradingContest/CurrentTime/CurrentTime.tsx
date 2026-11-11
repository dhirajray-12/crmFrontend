import { Clock } from "lucide-react";
import { formatTimeWithSeconds } from "@/utils/TradingContest.Helper";

interface CurrentTimeProps {
  time: Date;
}

export const CurrentTime = ({ time }: CurrentTimeProps) => {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-subtle">
      <Clock className="h-4 w-4 text-accent" />
      <span className="font-semibold tabular-nums text-heading">
        {formatTimeWithSeconds(time)}
      </span>
    </div>
  );
};
