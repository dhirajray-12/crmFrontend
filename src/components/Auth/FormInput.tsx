import React from 'react';
import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: LucideIcon;
    error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}) => {
    return (
        <div className="group">
            <label className="mb-1.5 block text-xs font-medium text-subtle">
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-2.5 h-4 w-4 text-subtle transition-colors group-focus-within:text-accent" />
                <input
                    {...props}
                    className={`client-theme-input w-full rounded-lg border ${
                        error ? 'border-rose-400/60' : 'border-border'
                    } py-2.5 pl-10 pr-3 text-sm text-heading placeholder:text-subtle transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40 ${className}`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">{error}</p>}
        </div>
    );
};
