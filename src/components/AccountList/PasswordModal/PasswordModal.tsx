import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import type { Account } from "@/types/Accountlist.type";
import { PasswordField } from "./PasswordField";
import { NewPasswordField } from "./NewPasswordField";

interface PasswordModalProps {
  account: Account;
  isUpdating: boolean;
  showInvestor: boolean;
  showMaster: boolean;
  newInvestorPassword: string;
  newMasterPassword: string;
  onClose: () => void;
  onCopy: (text: string) => void;
  onToggleInvestor: () => void;
  onToggleMaster: () => void;
  onInvestorChange: (value: string) => void;
  onMasterChange: (value: string) => void;
  onSave: () => void;
}

export const PasswordModal = ({
  account,
  isUpdating,
  showInvestor,
  showMaster,
  newInvestorPassword,
  newMasterPassword,
  onClose,
  onCopy,
  onToggleInvestor,
  onToggleMaster,
  onInvestorChange,
  onMasterChange,
  onSave,
}: PasswordModalProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      data-voice-scope="password modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-strong p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="client-theme-surface-strong glow-form relative w-full max-w-2xl overflow-hidden rounded-3xl px-4 py-6 shadow-2xl sm:px-6 sm:py-8 lg:px-10 lg:py-10"
      >
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-accent/[0.12] blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-surface-strong/[0.08] blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="bg-gradient-to-r from-white via-accent to-slate-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Update Account Passwords
              </h2>
              <p className="mt-2 text-sm text-subtle">
                Account: {account.accountNumber}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              data-voice-target="close password modal"
              className="shrink-0 rounded-full bg-surface-strong/[0.06] p-2 text-subtle transition-all hover:bg-rose-500/[0.12] hover:text-rose-200"
            >
              <XCircle className="w-6 h-6" />
            </motion.button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PasswordField
                label="Current Master Password"
                value={account.masterPassword || ""}
                showPassword={showMaster}
                color="purple"
                onToggleVisibility={onToggleMaster}
                onCopy={onCopy}
              />
              <PasswordField
                label="Current Investor Password"
                value={account.investorPassword || ""}
                showPassword={showInvestor}
                color="blue"
                onToggleVisibility={onToggleInvestor}
                onCopy={onCopy}
              />
            </div>

            <div className="my-6 border-t border-border" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NewPasswordField
                label="New Master Password"
                value={newMasterPassword}
                showPassword={showMaster}
                color="purple"
                placeholder="Enter new master password..."
                onChange={onMasterChange}
                onToggleVisibility={onToggleMaster}
              />
              <NewPasswordField
                label="New Investor Password"
                value={newInvestorPassword}
                showPassword={showInvestor}
                color="pink"
                placeholder="Enter new investor password..."
                onChange={onInvestorChange}
                onToggleVisibility={onToggleInvestor}
              />
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col-reverse justify-end gap-3 pt-8 sm:flex-row sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                data-voice-target="cancel password update"
                className="rounded-xl border border-border bg-surface-strong/[0.06] px-6 py-3 font-semibold text-subtle transition-all shadow-sm hover:bg-surface-strong/[0.1] hover:text-heading sm:px-8"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 40px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                disabled={isUpdating}
                data-voice-target="save password changes"
                className="relative overflow-hidden rounded-xl border border-accent/30 bg-accent/[0.16] px-6 py-3 font-bold text-accent transition-all shadow-lg hover:bg-accent/[0.24] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"
              >
                {isUpdating && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                )}
                <span className="relative z-10">
                  {isUpdating ? "Updating..." : "Save Changes"}
                </span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
