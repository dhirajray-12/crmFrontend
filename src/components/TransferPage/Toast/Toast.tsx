import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ToastMessage } from "@/types/transfer.types";

interface ToastProps {
  message: ToastMessage | string;
  type?: ToastMessage["type"];
  onClose: () => void;
}

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  const resolvedMessage =
    typeof message === "string" ? { type, message } : message;

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
        resolvedMessage.type === "success"
          ? "bg-green-500"
          : resolvedMessage.type === "error"
            ? "bg-red-500"
            : "bg-blue-500"
      } text-heading`}
    >
      {icons[resolvedMessage.type]}
      <span className="font-semibold">{resolvedMessage.message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
