import { Apple, Monitor, Globe, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const PlayStoreIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8">
    <path
      fill="var(--accent-color)"
      d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z"
    />
    <path fill="#F43E37" d="M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12Z" />
    <path
      fill="#4BCE97"
      d="M3.84,2.15C4.05,2.05 4.27,2 4.5,2C4.86,2 5.22,2.13 5.5,2.39L16.81,8.88L14.54,11.15L3.84,2.15Z"
    />
    <path
      fill="#2684FC"
      d="M16.81,8.88L20.25,10.79C21.34,11.42 21.34,13.08 20.25,13.71L16.81,15.12L14.54,12.85L16.81,8.88Z"
    />
  </svg>
);

const AppStoreIcon = () => <Apple className="w-8 h-8 text-heading" />;

export default function TradingPlatform() {
  const platforms = [
    {
      name: "Play Store",
      icon: PlayStoreIcon,
      gradient: "from-gray-800 to-gray-900",
      delay: 0,
    },
    {
      name: "App Store",
      icon: AppStoreIcon,
      gradient: "from-gray-700 to-gray-900",
      delay: 0.1,
    },
    {
      name: "Desktop & Mac",
      icon: Monitor,
      gradient: "from-blue-400 to-blue-600",
      delay: 0.2,
    },
    {
      name: "Web Platform",
      icon: Globe,
      gradient: "from-indigo-400 to-purple-600",
      delay: 0.3,
    },
  ];

  return (
    <div className="client-theme-bg relative min-h-screen overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-12 lg:gap-20 items-center px-8 lg:px-20 py-20">
        {/* Left Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block"
            >
              <span className="px-4 py-2 bg-indigo-400 text-heading font-bold rounded-full text-sm uppercase tracking-wider">
                Multi-Platform Trading
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl lg:text-7xl font-black text-heading leading-tight"
            >
              Trade Smarter on{" "}
              <span className="text-indigo-700 dark:text-indigo-400">Every Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl lg:text-2xl text-heading/90 leading-relaxed"
            >
              Access global markets from your favorite device. Real-time data,
              instant execution, unlimited possibilities.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button className="group px-8 py-4 bg-indigo-400 hover:bg-indigo-500 text-heading font-bold rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-surface-strong/10 hover:bg-surface-strong/20 backdrop-blur-xl border border-border text-heading font-semibold rounded-xl text-lg transition-all duration-300 hover:scale-105">
              View Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex gap-8 pt-4"
          >
            <div>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">2M+</div>
              <div className="text-heading/70 text-sm">Active Traders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">$50B+</div>
              <div className="text-heading/70 text-sm">Daily Volume</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-400">150+</div>
              <div className="text-heading/70 text-sm">Countries</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Platform Cards */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-5"
        >
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.a
                key={platform.name}
                href="#"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + platform.delay, duration: 0.6 }}
                whileHover={{
                  scale: 1.03,
                  x: 10,
                  transition: { duration: 0.2 },
                }}
                className="group relative bg-surface-strong/10 backdrop-blur-xl border border-border rounded-2xl p-6 hover:bg-surface-strong/20 transition-all duration-300 hover:shadow-2xl cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${platform.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 flex-shrink-0`}
                  >
                    <Icon className="w-8 h-8 text-heading" />
                  </div>
                  <div className="flex-1">
                    <p className="text-heading/60 text-sm font-medium mb-1">
                      Download From
                    </p>
                    <p className="text-heading text-lg font-bold">
                      {platform.name}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-heading/50 group-hover:text-heading group-hover:translate-x-2 transition-all duration-300" />
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 border-2 border-indigo-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
}
