import { Lock, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { useResetPasswordStore } from '@/Store/resetPasswordStore';
import { useResetPassword } from '@/hooks/useResetPassword';
import { getPasswordStrength } from '@/utils/passwordStrength';

export default function ResetPasswordForm() {
    const { token } = useParams();

    // Global state from Zustand
    const {
        password,
        confirmPassword,
        showPassword,
        showConfirmPassword,
        error,
        success,
        setPassword,
        setConfirmPassword,
        setError,
        toggleShowPassword,
        toggleShowConfirmPassword,
    } = useResetPasswordStore();

    // React Query mutation
    const { mutate: resetPassword, isPending: loading } = useResetPassword();

    const validatePassword = (): boolean => {
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePassword() || !token) {
            return;
        }

        resetPassword({ token, password });
    };

    const passwordStrength = getPasswordStrength(password);

    return (
        <>
            {!success ? (
                <>
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 200,
                                delay: 0.2,
                            }}
                            className="inline-block mb-4"
                        >
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-linear-to-br from-accent to-accent-hover shadow-[0_12px_30px_rgba(14,165,233,0.18)] sm:h-16 sm:w-16">
                                <Lock className="w-8 h-8 text-heading" />
                            </div>
                        </motion.div>

                        <h2 className="mb-2 bg-gradient-to-r from-white via-accent to-slate-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                            Reset Password
                        </h2>
                        <p className="text-sm text-subtle">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* New Password */}
                        <div className="group">
                            <label className="mb-2 block text-sm font-medium text-subtle">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-subtle transition-colors group-focus-within:text-accent" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="client-theme-input w-full rounded-xl border border-border py-3 pl-12 pr-12 text-heading placeholder:text-subtle transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40 sm:py-3.5"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowPassword}
                                    className="absolute right-4 top-3.5 text-subtle transition-colors hover:text-accent"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width: `${(passwordStrength.strength / 3) * 100}%`,
                                                }}
                                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                            />
                                        </div>
                                        <span
                                            className={`text-xs font-medium ${passwordStrength.strength === 1
                                                ? "text-red-700 dark:text-red-400"
                                                : passwordStrength.strength === 2
                                                    ? "text-yellow-700 dark:text-yellow-400"
                                                    : "text-accent"
                                                }`}
                                        >
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-subtle sm:text-sm">
                                        Use 8+ characters with a mix of letters, numbers & symbols
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="group">
                            <label className="mb-2 block text-sm font-medium text-subtle">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-subtle transition-colors group-focus-within:text-accent" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="client-theme-input w-full rounded-xl border border-border py-3 pl-12 pr-12 text-heading placeholder:text-subtle transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowConfirmPassword}
                                    className="absolute right-4 top-3.5 text-subtle transition-colors hover:text-accent"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2"
                                >
                                    {password === confirmPassword ? (
                                        <p className="flex items-center gap-1 text-xs text-accent">
                                            <CheckCircle className="w-3 h-3" />
                                            Passwords match
                                        </p>
                                    ) : (
                                        <p className="text-xs text-rose-700 dark:text-rose-300">
                                            Passwords do not match
                                        </p>
                                    )}
                                </motion.div>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative w-full overflow-hidden rounded-xl border border-accent/30 bg-linear-to-br from-accent to-accent-hover py-3.5 text-base font-bold text-accent-foreground shadow-[0_18px_40px_rgba(14,165,233,0.24)] transition-all duration-300 disabled:opacity-70 sm:py-4 sm:text-lg"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                        />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        Reset Password
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            <motion.div
                                className="absolute inset-0 bg-linear-to-br from-accent to-accent-hover"
                                initial={{ x: "-100%" }}
                                whileHover={{ x: "100%" }}
                                transition={{ duration: 0.5 }}
                            />
                        </motion.button>
                    </form>

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-subtle transition-colors hover:text-accent"
                        >
                            Back to Login
                        </Link>
                    </div>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="inline-block mb-6"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/20 bg-accent/10 sm:h-20 sm:w-20">
                            <CheckCircle className="h-12 w-12 text-accent" />
                        </div>
                    </motion.div>

                    <h3 className="text-xl sm:text-2xl font-bold text-heading mb-3">
                        Password Reset Successful!
                    </h3>
                    <p className="mb-6 text-subtle">
                        Your password has been successfully reset.
                        <br />
                        Redirecting to login page...
                    </p>

                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="inline-block h-8 w-8 rounded-full border-2 border-accent border-t-transparent"
                    />
                </motion.div>
            )}
        </>
    );
}
