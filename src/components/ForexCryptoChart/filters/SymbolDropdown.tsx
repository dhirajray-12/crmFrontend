import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SymbolDropdownProps {
    isOpen: boolean;
    selectedSymbols: string[];  
    instruments: Array<{ key: string; name: string }>;
    onToggle: () => void;
    onClose: () => void;
    onSymbolChange: (symbol: string) => void;
}

export const SymbolDropdown: React.FC<SymbolDropdownProps> = ({
    isOpen,
    selectedSymbols,
    instruments,
    onToggle,
    onClose,
    onSymbolChange,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, onClose);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="text-xs sm:text-sm font-medium text-body mb-1 block">
                Symbol
            </label>
            <button
                onClick={onToggle}
                className="w-full px-3 sm:px-4 py-2 bg-surface-strong/60 rounded-lg shadow-md flex justify-between items-center hover:bg-surface-strong/80 transition text-sm"
            >
                <span className="truncate">
                    {selectedSymbols.includes("ALL")
                        ? "All Symbols"
                        : selectedSymbols.join(", ")}
                </span>
                <svg
                    className="w-4 h-4 text-body flex-shrink-0 ml-2"
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
                <div className="absolute mt-1 w-full bg-surface-strong/90 backdrop-blur-sm rounded-lg shadow-xl z-10 max-h-60 overflow-auto border border-border">
                    <div
                        onClick={() => {
                            onSymbolChange("ALL");
                            onClose();
                        }}
                        className={`px-3 sm:px-4 py-2 cursor-pointer text-body hover:bg-blue-100 border-b border-border text-sm ${selectedSymbols.includes("ALL") ? "bg-blue-100 font-semibold" : ""
                            }`}
                    >
                        All Symbols
                    </div>
                    {instruments.map((instrument) => (
                        <div
                            key={instrument.key}
                            onClick={() => {
                                onSymbolChange(instrument.key);
                                onClose();
                            }}
                            className={`px-3 sm:px-4 py-2 cursor-pointer hover:bg-blue-100 border-b border-border last:border-b-0 text-body text-sm ${selectedSymbols.includes(instrument.key) ? "bg-blue-100 font-semibold" : ""
                                }`}
                        >
                            {instrument.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};