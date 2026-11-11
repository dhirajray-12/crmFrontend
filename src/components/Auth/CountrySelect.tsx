import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { countries } from '@/lib/countryList';

interface CountrySelectProps {
    value: string;
    open: boolean;
    onToggle: () => void;
    onSelect: (country: string) => void;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
    value,
    open,
    onToggle,
    onSelect,
}) => {

    const handleSelect = (country: string) => {
        onSelect(country);  // Update the form data
        onToggle();         // Close the dropdown (this will set open to false)
    };

    return (
        <div className="group relative">
            <label className="mb-1.5 block text-xs font-medium text-subtle">
                Country
            </label>
            <div className="relative">
                <Globe className="absolute left-3 top-2.5 z-10 h-4 w-4 text-subtle transition-colors group-focus-within:text-accent" />
                <button
                    type="button"
                    onClick={onToggle}
                    className="client-theme-input w-full rounded-lg border border-border py-2.5 pl-10 pr-10 text-left text-sm text-heading transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                >
                    <span className={value ? 'text-heading' : 'text-subtle'}>
                        {value || 'Select your country'}
                    </span>
                </button>
                <ChevronDown
                    className={`absolute right-3 top-2.5 h-4 w-4 text-subtle transition-transform ${open ? 'rotate-180' : ''
                        }`}
                />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="client-theme-surface absolute z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-lg border border-border shadow-[0_20px_48px_rgba(2,6,23,0.45)] backdrop-blur-xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-accent/60 [&::-webkit-scrollbar-track]:bg-transparent"
                    >
                        {countries.map((country) => (
                            <motion.div
                                key={country}
                                onClick={() => handleSelect(country)}
                                whileHover={{ backgroundColor: 'rgba(56, 189, 248, 0.08)' }}
                                className="cursor-pointer border-b border-white/6 px-3 py-2 text-sm text-heading transition-colors last:border-b-0 hover:bg-accent/10"
                            >
                                {country}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
