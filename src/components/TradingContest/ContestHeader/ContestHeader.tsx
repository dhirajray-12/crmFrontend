import { Trophy } from "lucide-react";

export const ContestHeader = () => {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Trading contest
        </div>
        <h1 className="mt-2 flex items-center gap-2.5 text-2xl font-bold text-heading sm:text-3xl">
          <Trophy className="h-6 w-6 text-amber-700 dark:text-amber-300 sm:h-7 sm:w-7" />
          Contest trades
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-subtle">
          Track open positions and closed results across the contest board in real time.
        </p>
      </div>
    </div>
  );
};
