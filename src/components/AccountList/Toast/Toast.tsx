import { motion, AnimatePresence } from "framer-motion";
import { XCircle, CheckCircle, Info } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
    onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
    };

    const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${colors[type]} text-heading`}
                >
                    {icons[type]}
                    <span className="font-semibold">{message}</span>
                    <button onClick={onClose} className="ml-2 hover:opacity-80">
                        <XCircle className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};