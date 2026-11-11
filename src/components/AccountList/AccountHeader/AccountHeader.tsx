import { motion } from "framer-motion";
import { AccountTypeFilter } from "@/components/AccountList/AccountFilter/AccountTypeFilter";

interface AccountHeaderProps {
    selectedAccountType: string;
    showAccountTypeFilter: boolean;
    accountTypes: string[];
    onFilterToggle: () => void;
    onFilterSelect: (type: string) => void;
    filterRef: React.RefObject<HTMLDivElement | null>;
}

export const AccountHeader = ({
    selectedAccountType,
    showAccountTypeFilter,
    accountTypes,
    onFilterToggle,
    onFilterSelect,
    filterRef,
}: AccountHeaderProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative z-50 mb-6 sm:mb-8"
        >
            <div className="flex flex-col gap-5 border-b border-border pb-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Account overview
                    </span>
                    <h1 className="mt-2 text-2xl font-bold text-heading sm:text-3xl">
                        Trading Accounts
                    </h1>
                    <p className="mt-1.5 max-w-xl text-sm text-subtle">
                        Manage your MT5 accounts, monitor performance, and open an
                        account to view its full activity log.
                    </p>
                </div>

                <AccountTypeFilter
                    ref={filterRef}
                    selectedType={selectedAccountType}
                    showFilter={showAccountTypeFilter}
                    accountTypes={accountTypes}
                    onToggle={onFilterToggle}
                    onSelect={onFilterSelect}
                />
            </div>
        </motion.div>
    );
};
