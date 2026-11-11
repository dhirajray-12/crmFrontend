import { useState } from "react";
import { Filter } from "lucide-react";
import type { FilterState } from "@/types/rating.types";

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onApply: () => void;
  onReset: () => void;
}

export const FilterPanel = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface-strong rounded-xl px-6 py-3 border border-border text-heading hover:bg-surface transition-all duration-300 font-medium flex items-center gap-2 shadow-sm"
      >
        <Filter className="w-5 h-5" />
        Filters
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-surface-strong rounded-2xl p-6 border border-border shadow-2xl z-50">
            <h3 className="text-xl font-bold text-heading mb-4">
              Filter Masters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-heading mb-2 font-medium text-sm">
                  Expertise Level
                </label>
                <select
                  value={filters.expertise}
                  onChange={(e) =>
                    onFilterChange({ expertise: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading focus:outline-none focus:border-purple-500 transition-colors"
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
                <label className="block text-heading mb-2 font-medium text-sm">
                  Max Risk Score
                </label>
                <select
                  value={filters.maxRiskScore}
                  onChange={(e) =>
                    onFilterChange({ maxRiskScore: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">Any Risk</option>
                  <option value="3">Low (1-3)</option>
                  <option value="5">Medium (4-5)</option>
                  <option value="10">High (6-10)</option>
                </select>
              </div>

              <div>
                <label className="block text-heading mb-2 font-medium text-sm">
                  Min Growth (%)
                </label>
                <input
                  type="number"
                  value={filters.minGrowth}
                  onChange={(e) =>
                    onFilterChange({ minGrowth: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-heading mb-2 font-medium text-sm">
                  Min Copiers
                </label>
                <input
                  type="number"
                  value={filters.minCopiers}
                  onChange={(e) =>
                    onFilterChange({ minCopiers: e.target.value })
                  }
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-heading mb-2 font-medium text-sm">
                  Fee Type
                </label>
                <select
                  value={filters.feeType}
                  onChange={(e) => onFilterChange({ feeType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="">All</option>
                  <option value="FREE">Free Only</option>
                  <option value="PAID">Paid Only</option>
                </select>
              </div>

              <div>
                <label className="block text-heading mb-2 font-medium text-sm">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-heading focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="growth">Growth</option>
                  <option value="copiers">Copiers</option>
                  <option value="profitLoss">Profit/Loss</option>
                  <option value="riskScore">Risk Score</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  onReset();
                  setIsOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-surface-strong border border-border text-body hover:bg-surface-strong transition-all duration-300 font-medium text-sm"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  onApply();
                  setIsOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-heading hover:shadow-lg transition-all duration-300 font-medium text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
