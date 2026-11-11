import { CreditCard } from "lucide-react";

interface EmptyStateProps {
    selectedAccountType: string;
}

export const EmptyState = ({ selectedAccountType }: EmptyStateProps) => {
    return (
        <div className="client-theme-surface text-center py-20 rounded-3xl">
            <CreditCard className="mx-auto mb-4 h-16 w-16 text-subtle" />
            <p className="text-lg text-subtle">No accounts found</p>
            <p className="mt-2 text-sm text-subtle">
                {selectedAccountType !== "All"
                    ? `No ${selectedAccountType} accounts available`
                    : "Create your first trading account to get started"}
            </p>
        </div>
    );
};
