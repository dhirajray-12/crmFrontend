import { Activity, Sparkles, TrendingUp } from "lucide-react";

export const EmptyState: React.FC = () => {
  return (
    <div className="relative mb-4 overflow-hidden rounded-[28px] border border-border bg-surface-strong p-6 text-heading shadow-[0_24px_70px_rgba(2,6,23,0.3)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_28%),radial-gradient(circle_at_bottom_right,var(--accent-soft),transparent_30%)]" />
      <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-accent/15 blur-3xl animate-float-orb" />
      <div className="pointer-events-none absolute right-0 top-6 h-24 w-24 rounded-full bg-accent/10 blur-3xl animate-float-orb-delayed" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent animate-shimmer" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Chart standby
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-strong/[0.05]">
              <TrendingUp className="h-7 w-7 text-accent" />
              <span className="absolute inset-2 rounded-xl border border-accent/20 animate-pulse" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                No live trades on the board yet
              </p>
              <p className="mt-2 text-sm leading-6 text-subtle">
                Once a position opens or closes, this panel will light up with
                price movement, markers, and trade flow.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
          <div className="rounded-2xl border border-border bg-surface-strong/[0.05] p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-subtle">
              <Activity className="h-3.5 w-3.5 text-accent" />
              Status
            </div>
            <p className="mt-3 text-sm font-medium text-heading">
              Feed is ready for the next trade tick
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.08] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-100/80">
              What happens next
            </p>
            <p className="mt-3 text-sm font-medium text-heading">
              Your first event will appear here automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
