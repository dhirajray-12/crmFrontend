interface FilterHeaderProps {
  activeFiltersCount: number;
  onClearAll: () => void;
}

export const FilterHeader = ({ activeFiltersCount, onClearAll }: FilterHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-[0.14em] text-subtle">
        {activeFiltersCount > 0 ? `${activeFiltersCount} active` : "No active filters"}
      </p>

      {activeFiltersCount > 0 && (
        <button
          onClick={onClearAll}
          className="text-xs font-semibold uppercase tracking-[0.1em] text-accent hover:text-accent"
        >
          Clear all
        </button>
      )}
    </div>
  );
};
