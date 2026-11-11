import { useState } from "react";
import { Copy, Check, Eye, EyeOff } from "lucide-react";

interface CredentialsFieldProps {
    label: string;
    value: string;
    fieldName: string;
    onCopy: (text: string, field: string) => void;
    copiedField: string | null;
}

export const CredentialsField = ({
  label,
  value,
  fieldName,
  onCopy,
  copiedField,
}: CredentialsFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-xs text-subtle sm:text-sm">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <div className="flex-1 break-all rounded-xl border border-border bg-surface-strong px-3 py-2 font-mono text-sm font-semibold text-heading sm:px-4 sm:py-3 sm:text-base">
          {showPassword ? value : "••••••••••"}
        </div>
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="flex-shrink-0 rounded-xl border border-border bg-surface-strong/[0.06] p-2 text-heading transition-all duration-300 hover:bg-surface-strong/[0.1] hover:scale-105 active:scale-95 sm:p-3"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
        <button
          onClick={() => onCopy(value, fieldName)}
          className="flex-shrink-0 rounded-xl border border-accent/20 bg-accent/20 p-2 text-accent transition-all duration-300 hover:bg-accent/30 hover:scale-105 active:scale-95 sm:p-3"
        >
          {copiedField === fieldName ? (
            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>
    </div>
  );
};
