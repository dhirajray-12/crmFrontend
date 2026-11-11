import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search..." }: SearchBarProps) => {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
                type="text"
                data-voice-field="search"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-strong/[0.04] py-2.5 pl-10 pr-4 text-sm text-heading placeholder-slate-500 transition-colors focus:border-accent/40 focus:outline-none"
            />
        </div>
    );
};
