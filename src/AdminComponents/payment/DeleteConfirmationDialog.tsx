interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const DeleteConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}: DeleteConfirmationDialogProps) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-surface-strong rounded-xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-heading">{title}</h2>
                </div>
                <div className="p-6">
                    <p className="text-body">{message}</p>
                </div>
                <div className="p-6 border-t border-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-border rounded-lg hover:bg-surface transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-heading rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};