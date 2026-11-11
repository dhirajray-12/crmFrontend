import { Mail, ArrowRight, Shield, CheckCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useForgotPasswordStore } from "@/Store/forgotPasswordStore";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordForm() {
    // Global state from Zustand
    const {
        email,
        error,
        success,
        setEmail,
        setError,
        setSuccess,
    } = useForgotPasswordStore();

    // React Query mutation
    const { mutate: sendResetEmail, isPending: loading } = useForgotPassword();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        sendResetEmail({ email });
    };

    const handleTryAgain = () => {
        setSuccess(false);
        setError("");
    };

    return (
        <>
            {!success ? (
                <>
                    <div className="text-center mb-5 sm:mb-8">
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
                                <Shield className="h-8 w-8 text-heading" />
                            </div>
                        </motion.div>

                        <h2 className="mb-2 bg-gradient-to-r from-white via-accent to-slate-300 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                            Forgot Password?
                        </h2>
                        <p className="text-base text-subtle sm:text-lg">
                            No worries! Enter your email and we'll send you reset
                            instructions
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="group">
                            <label className="mb-2 block text-sm font-medium text-subtle">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-subtle transition-colors group-focus-within:text-accent" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="client-theme-input w-full rounded-xl py-3 pl-12 pr-4 text-heading placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-sky-400/40 sm:py-3.5"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200 sm:py-3.5"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative w-full overflow-hidden rounded-xl border border-accent/30 bg-linear-to-br from-accent to-accent-hover py-4 text-lg font-bold text-accent-foreground shadow-[0_18px_40px_rgba(14,165,233,0.24)] transition-all duration-300 disabled:opacity-70"
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
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Reset Link
                                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
                        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-accent/20 bg-accent/10">
                            <CheckCircle className="h-12 w-12 text-accent" />
                        </div>
                    </motion.div>

                    <h3 className="mb-3 text-2xl font-bold text-heading">
                        Check Your Email
                    </h3>
                    <p className="mb-6 text-subtle">
                        We've sent a password reset link to
                        <br />
                        <span className="font-medium text-accent">
                            {email}
                        </span>
                    </p>

                    <div className="mb-6 rounded-xl border border-border bg-surface-strong/[0.04] p-4">
                        <p className="text-sm text-subtle">
                            <strong className="text-heading">
                                Didn't receive the email?
                            </strong>
                            <br />
                            Check your spam folder or{" "}
                            <button
                                onClick={handleTryAgain}
                                className="font-medium text-accent hover:text-accent"
                            >
                                try again
                            </button>
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-accent transition-colors hover:text-accent"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </motion.div>
            )}
        </>
    );
}
