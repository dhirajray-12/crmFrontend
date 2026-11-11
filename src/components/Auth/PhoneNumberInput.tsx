import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ChevronDown, Search } from "lucide-react";
import { dialCodes } from "@/lib/dialCodes";

interface PhoneNumberInputProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (dialCode: string) => void;
  onPhoneChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  error,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDialCodes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dialCodes;
    return dialCodes.filter(
      (entry) =>
        entry.name.toLowerCase().includes(query) ||
        entry.dialCode.includes(query),
    );
  }, [search]);

  const handleSelect = (dialCode: string) => {
    onCountryCodeChange(dialCode);
    setOpen(false);
    setSearch("");
  };

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (!next) setSearch("");
      return next;
    });
  };

  return (
    <div className="group">
      <label className="mb-1.5 block text-xs font-medium text-subtle">
        Phone Number
      </label>
      <div className="relative flex gap-2">
        <div className="relative">
          <button
            type="button"
            onClick={handleToggle}
            className="client-theme-input flex h-full min-w-[92px] items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-left text-sm text-heading transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40"
          >
            <span className={countryCode ? "text-heading" : "text-subtle"}>
              {countryCode || "Code"}
            </span>
            <ChevronDown
              className={`ml-auto h-3.5 w-3.5 text-subtle transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="client-theme-surface absolute z-50 mt-2 w-64 overflow-hidden rounded-lg border border-border shadow-[0_20px_48px_rgba(2,6,23,0.45)] backdrop-blur-xl"
              >
                <div className="sticky top-0 border-b border-white/6 p-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-subtle" />
                    <input
                      type="text"
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search country..."
                      className="client-theme-input w-full rounded-md border border-border py-1.5 pl-8 pr-2 text-xs text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                    />
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/60 [&::-webkit-scrollbar-track]:bg-transparent">
                  {filteredDialCodes.length === 0 && (
                    <div className="px-3 py-2 text-xs text-subtle">
                      No matching country
                    </div>
                  )}
                  {filteredDialCodes.map((entry) => (
                    <motion.div
                      key={entry.name}
                      onClick={() => handleSelect(entry.dialCode)}
                      whileHover={{ backgroundColor: "rgba(56, 189, 248, 0.08)" }}
                      className="flex cursor-pointer items-center justify-between gap-2 border-b border-white/6 px-3 py-2 text-sm text-heading transition-colors last:border-b-0 hover:bg-accent/10"
                    >
                      <span className="truncate">{entry.name}</span>
                      <span className="shrink-0 text-subtle">
                        {entry.dialCode}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative flex-1">
          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-subtle transition-colors group-focus-within:text-accent" />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={14}
            required={required}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="Enter your phone number"
            className={`client-theme-input w-full rounded-lg border ${
              error ? "border-rose-400/60" : "border-border"
            } py-2.5 pl-10 pr-3 text-sm text-heading placeholder:text-subtle transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40`}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{error}</p>}
    </div>
  );
};
