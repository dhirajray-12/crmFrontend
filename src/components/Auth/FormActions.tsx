import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FormActionsProps {
    isLoading: boolean;
    error: string | undefined;
}

export const FormActions: React.FC<FormActionsProps> = ({ isLoading, error }) => {
    return (
        <>
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200 sm:text-sm"
                >
                    {error}
                </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full overflow-hidden rounded-lg border border-accent/30 bg-linear-to-br from-accent to-accent-hover py-3 text-sm font-bold text-accent-foreground shadow-[0_18px_40px_rgba(14,165,233,0.24)] transition-all duration-300 disabled:opacity-70 sm:py-3.5 sm:text-base"
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Creating Account...
                        </>
                    ) : (
                        <>
                            Create Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </span>
                <motion.div
                    className="absolute inset-0 bg-linear-to-br from-accent to-accent-hover"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                />
            </motion.button>

            {/* Divider */}
            <div className="relative my-4 sm:my-5">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="rounded-full border border-border bg-surface-strong px-3 py-1 text-subtle backdrop-blur-sm">
                        Or sign up with
                    </span>
                </div>
            </div>

            {/* Login Link */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-4 sm:mt-6 text-center"
            >
                <p className="text-xs text-subtle sm:text-sm">
                    Already have an account?{' '}
                    <Link
                        to="/login/client"
                        className="inline-flex items-center gap-1 font-semibold text-accent transition-colors hover:text-accent"
                    >
                        Sign In
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </p>
            </motion.div>
        </>
    );
};
