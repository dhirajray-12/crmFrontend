import { Info } from "lucide-react";

export const InfoBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-4">
      <div className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <div className="flex items-start gap-3 pl-2">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-semibold text-heading">
            Master Account Benefits
          </h4>
          <p className="text-xs leading-relaxed text-subtle">
            Earn passive income from your trading expertise. Set your
            commission rate, manage copiers, and track your earnings in real
            time.
          </p>
        </div>
      </div>
    </div>
  );
};
