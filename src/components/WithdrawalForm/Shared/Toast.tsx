import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ToastMessage } from "@/types/withdrawal.types";

interface ToastProps extends ToastMessage {
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : "bg-blue-500"
    } text-heading`}
  >
    {type === "success" && <CheckCircle className="w-5 h-5" />}
    {type === "error" && <XCircle className="w-5 h-5" />}
    {type === "info" && <Loader2 className="w-5 h-5 animate-spin" />}
    <span className="font-semibold">{message}</span>
    <button onClick={onClose} className="ml-2 hover:opacity-80">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);
