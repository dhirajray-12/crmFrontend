import { X } from "lucide-react";

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => {
    return (
        <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
            <div>
                <h2 className="text-2xl font-semibold text-heading sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-subtle">
                    Review your balance, choose a method, and submit securely.
                </p>
            </div>
            <button
                onClick={onClose}
                className="rounded-xl border border-border bg-surface-strong/[0.05] p-2 text-subtle transition-colors hover:bg-rose-500/[0.12] hover:text-rose-200"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
    );
};
