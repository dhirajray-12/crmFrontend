import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { FEATURES, STATS } from '@/Constants/auth.constants';

interface HeroContentProps {
    headerText: string;
    subText: string;
}

export const HeroContent: React.FC<HeroContentProps> = ({ headerText, subText }) => {
    return (
        <div className="hidden lg:block text-heading space-y-8">
            <div className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 backdrop-blur-sm"
                >
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium text-accent">Secure Login</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-accent via-accent to-slate-100 bg-clip-text text-transparent">
                        {headerText}
                    </span>
                    <br />
                    <span className="text-heading">Access Your Dashboard</span>
                </h1>

                <p className="text-lg text-subtle leading-relaxed">
                    {subText}. Your personalized trading experience awaits with real-time market insights and
                    powerful analytics tools.
                </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
                {FEATURES.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3 text-subtle"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-strong/5">
                            <span className="text-lg">{feature.icon}</span>
                        </div>
                        <span>{feature.text}</span>
                    </motion.div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                {STATS.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        className="text-center"
                    >
                        <div className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-2xl font-bold text-transparent">
                            {stat.number}
                        </div>
                        <div className="text-sm text-subtle">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
