import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

interface NewPasswordFieldProps {
    label: string;
    value: string;
    showPassword: boolean;
    color: "purple" | "pink";
    placeholder: string;
    onChange: (value: string) => void;
    onToggleVisibility: () => void;
}

export const NewPasswordField = ({
    label,
    value,
    showPassword,
    color,
    placeholder,
    onChange,
    onToggleVisibility,
}: NewPasswordFieldProps) => {
    const colors = {
        purple: {
            dot: "bg-purple-500",
            hover: "hover:text-purple-600",
            focus: "focus-within:border-purple-400",
        },
        pink: {
            dot: "bg-pink-500",
            hover: "hover:text-pink-600",
            focus: "focus-within:border-pink-400",
        },
    };

    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-heading">
                <span className={`w-2 h-2 rounded-full ${colors[color].dot}`} />
                {label}
            </label>
            <div
                className={`flex min-w-0 items-center overflow-hidden rounded-xl border border-border bg-surface-strong/[0.05] ${colors[color].focus} transition-colors shadow-sm`}
            >
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-heading outline-none placeholder:text-subtle sm:px-4 sm:text-base"
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
            </div>
        </div>
    );
};
