import { TrendingUp, ChevronDown } from "lucide-react";
import { GradientIcon } from "@/components/OpenNewAccount/common/GradientIcon";

interface LeverageSelectorProps {
  leverage: string;
  leverageOpen: boolean;
  leverageOptions: string[];
  onToggle: () => void;
  onSelect: (option: string) => void;
}

export const LeverageSelector = ({
  leverage,
  leverageOpen,
  leverageOptions,
  onToggle,
  onSelect,
}: LeverageSelectorProps) => {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-amber-300/25">
      <div className="mb-4 flex items-center gap-3">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <GradientIcon
            tone="amber"
            icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-heading sm:text-base">
            Leverage control
          </h3>
          <p className="text-xs text-subtle">
            Choose the exposure ratio for this account
          </p>
        </div>
      </div>

      <div
        className="relative leverage-dropdown-container"
        data-voice-target="leverage control"
      >
        <button
          type="button"
          onClick={onToggle}
          data-voice-target="leverage"
          data-voice-field="leverage"
          className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-strong/[0.04] px-4 py-3 text-heading transition-all duration-200 hover:border-amber-300/30 hover:bg-surface-strong/[0.06]"
        >
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-[0.14em] text-subtle">
              Selected leverage
            </p>
            <span className="mt-1 block text-sm font-semibold">
              {leverage || "Select leverage"}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 sm:h-5 sm:w-5 ${
              leverageOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {leverageOpen && leverageOptions.length > 0 && (
          <div className="ona-fade-up absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-surface-strong shadow-xl">
            {leverageOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                data-voice-target={option}
                data-voice-value={`leverage ${option}`}
                className={`w-full px-4 py-2.5 text-left text-sm transition-all duration-150 ${
                  leverage === option
                    ? "bg-accent/10 font-semibold text-accent"
                    : "text-subtle hover:translate-x-1 hover:bg-surface-strong/[0.06] hover:text-heading"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
