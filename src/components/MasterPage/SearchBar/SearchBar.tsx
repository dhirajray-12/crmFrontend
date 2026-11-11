import { Plus, Search } from "lucide-react";

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
}

export const SearchBar = ({ searchTerm, onSearchChange, onCreateClick }: SearchBarProps) => {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input
                    type="text"
                    data-voice-field="search"
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-strong/[0.04] py-2 pl-10 pr-4 text-sm text-heading placeholder:text-subtle focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                />
            </div>

            <button
                onClick={onCreateClick}
                data-voice-target="create master"
                className="flex items-center justify-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
            >
                <Plus className="h-4 w-4" />
                Create Master
            </button>
        </div>
    );
};
