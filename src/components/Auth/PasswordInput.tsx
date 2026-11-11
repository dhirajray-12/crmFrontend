import React from 'react';
import type { InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    showPassword: boolean;
    onTogglePassword: () => void;
    error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    showPassword,
    onTogglePassword,
    error,
    ...props
}) => {
    return (
        <div className="group">
            <label className="mb-1.5 block text-xs font-medium text-subtle">
                {label}
            </label>
            <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-subtle transition-colors group-focus-within:text-accent" />
                <input
                    type={showPassword ? 'text' : 'password'}
                    {...props}
                    className={`client-theme-input w-full rounded-lg border ${
                        error ? 'border-rose-400/60' : 'border-border'
                    } py-2.5 pl-10 pr-10 text-sm text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-sky-400/40`}
                />
                <button
                    type="button"
                    onClick={onTogglePassword}
                    className="absolute right-3 top-2.5 text-subtle transition-colors hover:text-accent"
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{error}</p>}
        </div>
    );
};
