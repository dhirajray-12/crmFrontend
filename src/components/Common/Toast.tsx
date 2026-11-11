import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";
import { useToastStore } from "@/Store/toast.store";

export const Toast = () => {
  const { toasts, removeToast } = useToastStore();
  const variantsByType = {
    success: {
      icon: CheckCircle2,
      label: "Success",
      border: "border-l-emerald-400",
      iconWrap: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    error: {
      icon: XCircle,
      label: "Error",
      border: "border-l-rose-400",
      iconWrap: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    },
    info: {
      icon: Info,
      label: "Info",
      border: "border-l-sky-400",
      iconWrap: "bg-accent/10 text-accent",
    },
    warning: {
      icon: ShieldAlert,
      label: "Warning",
      border: "border-l-amber-400",
      iconWrap: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
  } as const;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const variants =
            variantsByType[toast.type as keyof typeof variantsByType] ??
            variantsByType.info;

          const Icon = variants.icon;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-lg border border-border border-l-2 bg-surface-strong p-3 shadow-lg ${variants.border}`}
            >
              <div
                className={`flex h-7 w-7 flex-none items-center justify-center rounded-md ${variants.iconWrap}`}
              >
                {toast.type === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-semibold text-heading/50">
                  {variants.label}
                </p>
                <p className="mt-0.5 text-sm text-heading/90">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="flex-none rounded-md p-1 text-heading/40 transition-colors hover:bg-surface-strong/[0.06] hover:text-heading/80"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
