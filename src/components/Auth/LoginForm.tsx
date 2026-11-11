import React from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import type { LoginFormData, LoginResponse } from "@/types/auth.types";

interface LoginFormProps {
  formData: LoginFormData;
  showPassword: boolean;
  error: string | null;
  isLoading: boolean;
  role?: string;
  onFieldChange: <K extends keyof LoginFormData>(
    field: K,
    value: LoginFormData[K],
  ) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  loginMutation: UseMutationResult<LoginResponse, Error, any>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  showPassword,
  error,
  isLoading,
  role,
  onFieldChange,
  onTogglePassword,
  onSubmit,
}) => {
  return (
    <div className="auth-appear relative">
      <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-accent/50 via-accent/40 to-slate-200/25 opacity-70 blur sm:rounded-3xl" />

      {/* Form Container */}
      <div className="client-theme-surface-strong auth-panel-accent auth-soft-glow relative rounded-2xl p-6 transition-transform duration-300 sm:rounded-3xl sm:p-8">
        <div className="text-center mb-6 lg:mb-20">
          <div className="inline-block mb-3 sm:mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-r from-accent to-accent-hover shadow-[0_12px_24px_rgba(14,165,233,0.24)] sm:h-16 sm:w-16 sm:rounded-2xl">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-heading" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-heading mb-2">
            Sign In
          </h2>
          <p className="text-subtle text-xs sm:text-sm">
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5 mb-6">
          {/* Email Field */}
          <div className="group">
            <label className="mb-2 block text-xs font-medium text-heading sm:text-sm">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-subtle transition-colors group-focus-within:text-accent sm:left-4 sm:top-3.5 sm:h-5 sm:w-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onFieldChange("email", e.target.value)}
                required
                className="client-theme-input w-full rounded-lg py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none sm:rounded-xl sm:py-3 sm:pl-12 sm:text-base"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label className="mb-2 block text-xs font-medium text-heading sm:text-sm">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-subtle sm:left-4 sm:top-3.5 sm:h-5 sm:w-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => onFieldChange("password", e.target.value)}
                required
                className="client-theme-input w-full rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none sm:rounded-xl sm:py-3 sm:pl-12 sm:text-base"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-3 cursor-pointer text-subtle hover:text-accent sm:right-4 sm:top-3.5"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => onFieldChange("rememberMe", e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border bg-surface-strong/[0.08] text-accent focus:ring-accent focus:ring-offset-app sm:h-4 sm:w-4"
              />
              <span className="cursor-pointer text-subtle transition-colors group-hover:text-heading">
                Remember me
              </span>
            </label>
            <Link
              to="/forgot-password"
              className="text-accent transition-colors hover:text-accent"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-rose-400/35 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-200 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full cursor-pointer overflow-hidden rounded-lg bg-linear-to-r from-accent via-accent to-slate-300 py-3 text-base font-bold text-accent-foreground transition-all duration-300 disabled:opacity-70 sm:rounded-xl sm:py-4 sm:text-lg"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>

        {/* Create Account Link */}
        {role !== "admin" && role !== "superadmin" && role !== "agent" && (
          <div className="mt-5 sm:mt-7 text-center">
            <p className="text-xs text-subtle sm:text-sm">
              Don't have an account?{" "}
              <Link
                to="/create-account"
                className="inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:text-accent"
              >
                Create Account
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
