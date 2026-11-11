import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FilterState } from "@/types/rating.types";

interface FilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onApply: () => void;
  onReset: () => void;
}

export const FilterPanel = ({
  filters,
  setFilters,
  onApply,
  onReset,
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-voice-target="scanner filters"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] hover:text-heading"
      >
        <SlidersHorizontal className="h-4 w-4 text-accent" />
        Filters
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-surface-strong"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-xl border border-border bg-surface-strong shadow-xl sm:max-w-md sm:rounded-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-strong px-5 py-4">
              <h3 className="text-base font-semibold text-heading">Filter Masters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-subtle transition-colors hover:bg-surface-strong/[0.06] hover:text-heading"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                  Expertise Level
                </label>
                <select
                  value={filters.expertise}
                  onChange={(e) =>
                    setFilters({ ...filters, expertise: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading transition-colors focus:border-accent/40 focus:outline-none"
                >
                  <option value="">All Levels</option>
                  <option value="legend">Legend</option>
                  <option value="expert">Expert</option>
                  <option value="vertical_take_off">Vertical Take Off</option>
                  <option value="young_talent">Young Talent</option>
                  <option value="new_comers">New Comers</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                  Max Risk Score
                </label>
                <select
                  value={filters.maxRiskScore}
                  onChange={(e) =>
                    setFilters({ ...filters, maxRiskScore: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading transition-colors focus:border-accent/40 focus:outline-none"
                >
                  <option value="">Any Risk</option>
                  <option value="3">Low (1-3)</option>
                  <option value="5">Medium (4-5)</option>
                  <option value="10">High (6-10)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                    Min Growth (%)
                  </label>
                  <input
                    type="number"
                    value={filters.minGrowth}
                    onChange={(e) =>
                      setFilters({ ...filters, minGrowth: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading placeholder-slate-500 transition-colors focus:border-accent/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                    Min Copiers
                  </label>
                  <input
                    type="number"
                    value={filters.minCopiers}
                    onChange={(e) =>
                      setFilters({ ...filters, minCopiers: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading placeholder-slate-500 transition-colors focus:border-accent/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                  Fee Type
                </label>
                <select
                  value={filters.feeType}
                  onChange={(e) =>
                    setFilters({ ...filters, feeType: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading transition-colors focus:border-accent/40 focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="FREE">Free Only</option>
                  <option value="PAID">Paid Only</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters({ ...filters, sortBy: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-surface-strong/[0.04] px-3 py-2.5 text-sm text-heading transition-colors focus:border-accent/40 focus:outline-none"
                >
                  <option value="growth">Growth</option>
                  <option value="copiers">Copiers</option>
                  <option value="profitLoss">Profit/Loss</option>
                  <option value="riskScore">Risk Score</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-border bg-surface-strong px-5 py-4">
              <button
                data-voice-target="reset filters"
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08]"
              >
                Reset
              </button>
              <button
                data-voice-target="apply filters"
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
                className="flex-1 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
