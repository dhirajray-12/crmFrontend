import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { AccountTypeOption } from "@/types/deposit.types";

interface AccountDropdownProps {
  options: AccountTypeOption[];
  selected: AccountTypeOption | null;
  onSelect: (option: AccountTypeOption) => void;
  placeholder?: string;
  disabled?: boolean;
  voiceField?: string;
}

export const AccountDropdown: React.FC<AccountDropdownProps> = ({
  options,
  selected,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
  voiceField = "account",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative ${disabled ? "pointer-events-none opacity-50" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        data-voice-target={voiceField}
        data-voice-field={voiceField}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-strong/[0.03] px-3.5 py-2.5 text-left text-sm text-heading transition-colors hover:bg-surface-strong/[0.06] focus:outline-none"
      >
        <span className={`truncate ${selected ? "text-heading" : "text-subtle"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 text-subtle transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full origin-top">
          <ul className="max-h-56 overflow-y-auto rounded-lg border border-border bg-surface-strong shadow-2xl">
            {options.map((option, index) => (
              <li
                key={option.value}
                data-voice-target={`${voiceField} ${option.label}`}
                data-voice-value={`${voiceField} ${option.label}`}
                className={`cursor-pointer px-3.5 py-2.5 text-sm text-heading transition-colors hover:bg-surface-strong/[0.06] ${
                  index !== options.length - 1 ? "border-b border-border" : ""
                }`}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
