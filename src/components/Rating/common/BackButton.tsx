import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    onClick: () => void;
}

export const BackButton = ({ onClick }: BackButtonProps) => {
    return (
        <button
            onClick={onClick}
            data-voice-target="back to masters"
            className="mb-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface-strong/[0.04] px-4 py-2.5 text-sm font-semibold text-heading transition-colors hover:bg-surface-strong/[0.08] hover:text-heading sm:mb-6"
        >
            <ArrowLeft className="h-4 w-4" />
            Back to Masters
        </button>
    );
};
