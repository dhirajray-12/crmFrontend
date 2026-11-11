import { X } from "lucide-react";

interface ModalHeaderProps {
    title: string;
    subtitle: string;
    onClose: () => void;
    disabled?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    disabled = false,
}) => {
    return (
        <div className="relative overflow-hidden border-b border-border bg-surface-strong p-5 text-heading backdrop-blur-xl sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--accent-soft),transparent_38%),radial-gradient(circle_at_bottom_right,var(--accent-soft),transparent_30%)]"></div>
            <div className="flex justify-between items-start sm:items-center gap-2 relative z-10">
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                        Account Builder
                    </p>
                    <h2 className="mt-2 text-xl sm:text-3xl font-semibold text-heading truncate">
                        {title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-xs text-subtle sm:text-sm">
                        {subtitle}
                    </p>
                </div>
                <button
                    className="flex-shrink-0 rounded-full border border-border bg-surface-strong/[0.06] p-2 text-subtle transition-all hover:bg-rose-500/[0.14] hover:text-rose-200"
                    onClick={onClose}
                    disabled={disabled}
                >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
            </div>

            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-accent/12 blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-amber-300/10 blur-3xl"></div>
        </div>
    );
};
