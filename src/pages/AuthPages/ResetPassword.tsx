import { motion } from "framer-motion";
import { BackgroundElements } from "@/components/Auth/BackgroundElements";
import ResetPasswordForm from "@/components/Auth/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <div className="client-theme-bg relative min-h-svh overflow-hidden">
      <BackgroundElements />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_22%)]" />

      <div className="relative z-10 flex min-h-svh items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-px rounded-3xl bg-[linear-gradient(135deg,rgba(56,189,248,0.32),rgba(14,165,233,0.10),rgba(16,185,129,0.24))] opacity-90 blur-sm"
              animate={{ opacity: [0.7, 0.95, 0.7] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="client-theme-surface-strong relative rounded-3xl border border-border p-5 shadow-[0_22px_54px_rgba(2,6,23,0.4)] sm:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_24%)]" />
              <ResetPasswordForm />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
