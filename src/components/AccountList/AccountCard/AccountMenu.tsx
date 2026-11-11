import { motion } from "framer-motion";
import { MoreHorizontal, Settings } from "lucide-react";
import { memo } from "react";

interface AccountMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export const AccountMenu = memo(
  ({ isOpen, onToggle, onEdit }: AccountMenuProps) => {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0 rounded-lg border border-border bg-surface-strong/[0.05] p-2 transition-all hover:bg-surface-strong/[0.1]"
        >
          <MoreHorizontal className="w-4 h-4 text-subtle" />
        </motion.button>
        {isOpen && (
          <div className="client-theme-surface-strong absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl shadow-2xl">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-heading transition-all hover:bg-surface-strong/[0.06]"
            >
              <Settings className="w-4 h-4" />
              Edit Account
            </button>
          </div>
        )}
      </div>
    );
  },
);
