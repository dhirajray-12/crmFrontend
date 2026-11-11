import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: "from-green-500/20 to-green-600/20 border-green-500",
    error: "from-red-500/20 to-red-600/20 border-red-500",
    info: "from-blue-500/20 to-blue-600/20 border-blue-500",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed top-4 right-4 z-[9999]"
        >
          <div
            className={`bg-gradient-to-r ${colors[type]} backdrop-blur-xl border-2 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]`}
          >
            {icons[type]}
            <p className="text-heading font-medium flex-1">{message}</p>
            <button
              onClick={onClose}
              className="text-heading/70 hover:text-heading transition-colors"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
