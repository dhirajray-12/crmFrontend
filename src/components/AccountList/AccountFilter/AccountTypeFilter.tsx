import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Sparkles } from "lucide-react";

interface AccountTypeFilterProps {
    selectedType: string;
    showFilter: boolean;
    accountTypes: string[];
    onToggle: () => void;
    onSelect: (type: string) => void;
}

export const AccountTypeFilter = forwardRef<HTMLDivElement, AccountTypeFilterProps>(
    ({ selectedType, showFilter, accountTypes, onToggle, onSelect }, ref) => {
        return (
            <div className="relative z-[100] w-full lg:w-auto" ref={ref} data-voice-scope="account type filter">
                <div className="rounded-[24px] border border-border bg-surface p-3 backdrop-blur-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-subtle">
                                Account Filter
                            </p>
                            <p className="mt-1 text-sm text-subtle">
                                Active type: <span className="font-semibold text-heading">{selectedType}</span>
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onToggle}
                            data-voice-target="account type filter"
                            data-voice-field="account type filter"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/[0.12] px-4 py-2 text-sm font-semibold text-accent transition-all hover:bg-accent/[0.18]"
                        >
                            <Filter className="h-4 w-4" />
                            {showFilter ? "Hide types" : "Choose type"}
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {showFilter && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="mt-3"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {accountTypes.map((type, index) => (
                                        <motion.button
                                            key={type}
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.04 }}
                                            onClick={() => {
                                                onSelect(type);
                                                onToggle();
                                            }}
                                            data-voice-target={`account type ${type}`}
                                            data-voice-value={`account type ${type}`}
                                            className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-all ${
                                                selectedType === type
                                                    ? "border-accent/30 bg-gradient-to-r from-accent/[0.18] to-accent-hover/[0.10] text-heading shadow-lg"
                                                    : "border-border bg-surface-strong/[0.03] text-subtle hover:border-border hover:bg-surface-strong/[0.06]"
                                            }`}
                                        >
                                            <span>{type}</span>
                                            {selectedType === type && (
                                                <Sparkles className="h-3.5 w-3.5 text-accent" />
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
    }
);

AccountTypeFilter.displayName = "AccountTypeFilter";
