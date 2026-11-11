// src/components/Common/ErrorDisplay.tsx
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useErrorStore } from "@/Store/error.store";

export const ErrorDisplay = () => {
  const { pathname } = useLocation();
  const { errors, globalError, dismissError, clearGlobalError } =
    useErrorStore();

  if (pathname.startsWith("/client")) {
    return null;
  }

  const activeErrors = errors.filter((e) => !e.dismissed);
  const hasErrors = activeErrors.length > 0 || globalError;

  if (!hasErrors) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {/* Global Error */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="bg-red-500/90 backdrop-blur-xl rounded-xl shadow-2xl border border-red-400/30 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-heading flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-heading font-semibold text-sm">Error</p>
                <p className="text-heading/80 text-sm">{globalError.message}</p>
              </div>
              <button
                onClick={clearGlobalError}
                className="text-heading/70 hover:text-heading"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Errors */}
      <AnimatePresence>
        {activeErrors.slice(0, 3).map((error) => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`rounded-xl shadow-2xl border p-3 backdrop-blur-xl ${
              error.status === 400 || error.status === 422
                ? "bg-yellow-500/80 border-yellow-400/30"
                : error.status === 401 || error.status === 403
                  ? "bg-orange-500/80 border-orange-400/30"
                  : "bg-red-500/80 border-red-400/30"
            }`}
          >
            <div className="flex items-start gap-2">
              {error.status === 400 ? (
                <Info className="w-4 h-4 text-heading flex-shrink-0 mt-0.5" />
              ) : error.status === 401 ? (
                <AlertTriangle className="w-4 h-4 text-heading flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-heading flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-heading text-sm">{error.message}</p>
                {error.code && (
                  <p className="text-heading/60 text-xs mt-1">
                    Code: {error.code}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissError(error.id)}
                className="text-heading/70 hover:text-heading"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeErrors.length > 3 && (
        <div className="text-center text-heading/60 text-xs">
          +{activeErrors.length - 3} more errors
        </div>
      )}
    </div>
  );
};
