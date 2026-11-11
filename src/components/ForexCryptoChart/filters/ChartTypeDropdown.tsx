import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface ChartTypeDropdownProps {
    isOpen: boolean;
    chartType: 'line' | 'area' | 'bar';
    onToggle: () => void;
    onClose: () => void;
    onSelect: (type: 'line' | 'area' | 'bar') => void;
}

const CHART_TYPES = [
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'bar', label: 'Bar Chart' },
] as const;

export const ChartTypeDropdown: React.FC<ChartTypeDropdownProps> = ({
    isOpen,
    chartType,
    onToggle,
    onClose,
    onSelect,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, onClose);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-xs sm:text-sm font-medium text-body mb-1 block">
                Chart Type
            </label>
            <button
                onClick={onToggle}
                className="w-full px-3 sm:px-4 py-2 rounded-lg bg-surface-strong/60 shadow-md flex justify-between items-center hover:bg-surface-strong/80 transition text-sm"
            >
                <span>
                    {chartType === "line"
                        ? "Line"
                        : chartType === "area"
                            ? "Area"
                            : "Bar"}
                </span>
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
                    {CHART_TYPES.map(({ value, label }) => (
                        <div
                            key={value}
                            onClick={() => {
                                onSelect(value);
                                onClose();
                            }}
                            className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-orange-100 border-b border-border last:border-b-0 text-sm ${chartType === value ? "bg-orange-200 font-semibold" : ""
                                }`}
                        >
                            {label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};