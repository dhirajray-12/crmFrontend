import { AlertCircle, CheckCircle, X } from "lucide-react";

interface NotificationToastProps {
    type: "success" | "error";
    message: string;
    onClose: () => void;
}

export const NotificationToast = ({ type, message, onClose }: NotificationToastProps) => {
    return (
        <div className="fixed left-3 right-3 top-3 z-50 animate-fade-in sm:left-auto sm:right-4 sm:top-4">
            <div
                className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-semibold sm:max-w-sm ${
                    type === "success"
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-rose-400/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                }`}
            >
                {type === "success" ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
                <span className="min-w-0 flex-1">{message}</span>
                <button onClick={onClose} className="shrink-0 opacity-70 transition hover:opacity-100">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
