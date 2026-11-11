import type { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    error,
    className = "",
    ...props
}) => {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-heading">
                {label}
            </label>
            <input
                {...props}
                className={`client-theme-input w-full rounded-xl px-4 py-3 text-heading placeholder:text-subtle focus:outline-none ${className}`}
            />
            {error && <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        </div>
    );
};
