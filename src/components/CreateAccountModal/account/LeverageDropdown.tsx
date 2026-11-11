import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Leverage } from "@/types/createAccount.types";

interface LeverageDropdownProps {
  leverages: Leverage[];
  selectedLeverage: string;
  onSelect: (leverage: string) => void;
  disabled?: boolean;
}

export const LeverageDropdown: React.FC<LeverageDropdownProps> = ({
  leverages,
  selectedLeverage,
  onSelect,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2 rounded-[28px] border border-border bg-surface-strong/[0.04] p-5 sm:space-y-3 sm:p-6">
      <label className="flex items-center gap-2 text-sm font-semibold text-heading">
        <span className="text-base sm:text-lg">⚡</span>
        Leverage Ratio
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface-strong/[0.04] px-4 py-3 text-sm shadow-sm transition-all duration-200 hover:bg-surface-strong/[0.06] focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-sky-400/20 sm:text-base"
          disabled={disabled}
        >
          <span className="text-heading">
            {selectedLeverage || "Select leverage"}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 z-20 mt-2 max-h-48 w-full overflow-hidden overflow-y-auto rounded-2xl border border-border bg-surface-strong shadow-lg">
            {leverages && leverages.length > 0 ? (
              leverages.map((leverage) => (
                <button
                  key={leverage._id}
                  onClick={() => {
                    onSelect(leverage.value);
                    setIsOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-heading transition-colors hover:bg-surface-strong/[0.06] sm:px-4 sm:text-base"
                >
                  {leverage.value}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-subtle sm:px-4">
                No leverages available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
