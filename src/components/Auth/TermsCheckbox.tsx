import React from "react";

export const TermsCheckbox: React.FC = () => {
  return (
    <div className="flex items-start gap-2">
      <input
        type="checkbox"
        required
        className="mt-0.5 h-4 w-4 rounded border-border bg-surface-strong text-accent focus:ring-accent focus:ring-offset-app"
      />
      <label className="text-xs text-subtle sm:text-sm">
        I agree to the{" "}
        <a
          href="#"
          className="text-accent transition-colors hover:text-accent"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-accent transition-colors hover:text-accent"
        >
          Privacy Policy
        </a>
      </label>
    </div>
  );
};
