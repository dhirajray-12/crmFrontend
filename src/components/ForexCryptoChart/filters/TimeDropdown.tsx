import { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface TimeDropdownProps {
    isOpen: boolean;
    timeFilter: string;
    onToggle: () => void;
    onClose: () => void;
    onSelect: (option: string) => void;
}

const TIME_OPTIONS = [
    "Last 7 Days",
    "Last 14 Days",
    "Last 30 Days",
    "Last 60 Days",
    "Last 90 Days",
    "CUSTOM",
];

export const TimeDropdown: React.FC<TimeDropdownProps> = ({
    isOpen,
    timeFilter,
    onToggle,
    onClose,
    onSelect,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, onClose);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-xs sm:text-sm font-medium text-body mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-body" /> Time Period
            </label>
            <button
                onClick={onToggle}
                className="w-full px-3 sm:px-4 py-2 rounded-lg bg-surface-strong/60 shadow-md flex justify-between items-center hover:bg-surface-strong/80 transition text-sm"
            >
                <span className="truncate">{timeFilter}</span>
                <svg
                    className="w-4 h-4 text-subtle flex-shrink-0 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute mt-1 w-full bg-surface-strong/90 backdrop-blur-sm rounded-lg shadow-xl z-10 max-h-48 overflow-auto border border-border">
                    {TIME_OPTIONS.map((option) => (
                        <div
                            key={option}
                            onClick={() => {
                                onSelect(option);
                                onClose();
                            }}
                            className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-green-100 border-b border-border last:border-b-0 text-sm ${timeFilter === option ? "bg-green-100 font-semibold" : ""
                                }`}
                        >
                            {option === "CUSTOM" ? "Custom Range" : option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};