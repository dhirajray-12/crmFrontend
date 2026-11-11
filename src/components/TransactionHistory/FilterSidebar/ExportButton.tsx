import { Download } from "lucide-react";

interface ExportButtonProps {
    onClick: () => void;
}

export const ExportButton = ({ onClick }: ExportButtonProps) => {
    return (
        <button
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent/[0.16] py-2 text-sm font-semibold text-accent shadow-[0_12px_30px_rgba(14,165,233,0.18)] transition hover:scale-[1.02] hover:bg-accent/[0.24] active:scale-95 sm:rounded-2xl sm:py-3 sm:text-base"
        >
            <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            Export CSV
        </button>
    );
};
