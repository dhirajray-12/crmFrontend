import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ToastMessage } from "@/types/depositePage.types";

interface ToastProps {
  message: ToastMessage;
  onClose: () => void;
}

export const Toast = ({ message, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Loader2 className="w-5 h-5 animate-spin" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
        message.type === "success"
          ? "bg-green-500"
          : message.type === "error"
            ? "bg-red-500"
            : "bg-blue-500"
      } text-heading`}
    >
      {icons[message.type]}
      <span className="font-semibold">{message.message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
