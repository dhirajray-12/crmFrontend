import { Search } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
    <div className="flex-1 min-w-[250px]">
        <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-subtle w-5 h-5" />
            <input
                type="text"
                placeholder="Search by name or account..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base bg-surface-strong border border-border text-heading placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors shadow-sm"
            />
        </div>
    </div>
);