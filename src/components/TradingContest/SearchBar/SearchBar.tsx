import { RefreshCw, Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  loading,
}: SearchBarProps) => {
  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          type="text"
          placeholder="Search by account, symbol, or type…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="client-theme-input w-full rounded-xl py-2.5 pl-10 pr-3.5 text-sm outline-none"
        />
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-medium text-heading transition-colors hover:border-border hover:bg-surface-strong/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          className={`h-4 w-4 ${loading ? "animate-spin" : "transition-transform duration-500 group-hover:rotate-180"}`}
        />
        Refresh
      </button>
    </div>
  );
};
