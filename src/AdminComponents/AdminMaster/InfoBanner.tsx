import { Crown, Sparkles } from "lucide-react";

export const InfoBanner = () => (
  <div className="rounded-[26px] border border-border bg-surface p-5 shadow-[0_18px_32px_rgba(102,76,36,0.10)]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-strong px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-body">
          <Sparkles className="h-3.5 w-3.5" />
          Benefits
        </div>
        <h3 className="mt-4 text-xl font-semibold tracking-tight text-heading">
          Performance drives revenue
        </h3>
        <p className="mt-2 text-sm leading-6 text-body">
          Set commission, maintain your strategy profile, and track copier participation.
        </p>
      </div>

      <div className="grid gap-3 sm:min-w-[260px]">
        <div className="rounded-2xl border border-border bg-[rgba(255,250,241,0.76)] dark:bg-surface-strong p-4">
          <div className="mb-2 flex items-center gap-2 text-body">
            <Crown className="h-4 w-4" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-body">
              Focus
            </span>
          </div>
          <div className="text-sm font-semibold text-heading">
            Clear pricing and a sharp profile convert.
          </div>
        </div>
      </div>
    </div>
  </div>
);
