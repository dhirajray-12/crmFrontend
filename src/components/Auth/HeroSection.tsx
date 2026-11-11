import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  features: Array<{ icon: any; text: string; color: string }>;
  stats: Array<{ number: string; label: string }>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  features,
  stats,
}) => {
  return (
    <div className="hidden space-y-6 text-heading sm:space-y-8 lg:block">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.12] px-4 py-2 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-accent">
            Join Today
          </span>
        </motion.div>

        <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-white via-accent to-teal-200 bg-clip-text text-transparent">
            {title}
          </span>
          <br />
          <span className="text-heading">{subtitle}</span>
        </h1>

        <p className="text-base leading-relaxed text-subtle xl:text-lg">
          Join thousands of traders worldwide. Get instant access to premium
          features, real-time analytics, and professional trading tools.
        </p>
      </div>

      {/* Feature List */}
      <div className="space-y-4">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
            className="flex items-center gap-3 text-heading"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/[0.10]">
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
            </div>
            <span className="text-sm xl:text-base">{feature.text}</span>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 border-t border-border pt-8 xl:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-accent to-teal-200 bg-clip-text text-xl font-bold text-transparent xl:text-2xl">
              {stat.number}
            </div>
            <div className="text-xs text-subtle xl:text-sm">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
