import { MessageCircle } from "lucide-react";

export const EmptyState = () => {
    return (
        <div className="flex w-full items-center justify-center rounded-xl border border-border bg-surface p-8 sm:p-12">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                    <MessageCircle className="text-accent" size={28} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-heading sm:text-xl">
                    Select a ticket to view conversation
                </h3>
                <p className="text-sm text-subtle">
                    Choose from your active tickets or create a new one
                </p>
            </div>
        </div>
    );
};
