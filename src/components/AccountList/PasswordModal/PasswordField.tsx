import { Eye, EyeOff, Copy } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordFieldProps {
    label: string;
    value: string;
    showPassword: boolean;
    color: "purple" | "blue";
    onToggleVisibility: () => void;
    onCopy: (text: string) => void;
}

export const PasswordField = ({
    label,
    value,
    showPassword,
    color,
    onToggleVisibility,
    onCopy,
}: PasswordFieldProps) => {
    const colors = {
        purple: {
            dot: "bg-purple-500",
            hover: "hover:text-purple-600",
        },
        blue: {
            dot: "bg-blue-500",
            hover: "hover:text-blue-600",
        },
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-heading">
                <span className={`w-2 h-2 rounded-full ${colors[color].dot}`} />
                {label}
            </label>
            <div className="flex min-w-0 items-center overflow-hidden rounded-xl border border-border bg-surface-strong/[0.05] shadow-sm">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value || "Not set"}
                    readOnly
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-heading outline-none sm:px-4 sm:text-base"
                />
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={onToggleVisibility}
                    className={`shrink-0 p-2.5 text-subtle ${colors[color].hover} transition-colors sm:p-3`}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => onCopy(value)}
                    className={`shrink-0 border-l border-border p-2.5 text-subtle ${colors[color].hover} transition-colors sm:p-3`}
                >
                    <Copy size={18} />
                </motion.button>
            </div>
        </div>
    );
};
