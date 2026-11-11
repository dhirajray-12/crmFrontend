// frontend/vite.config.ts - OPTIMIZED FOR PRODUCTION
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwind from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwind()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendors
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'state-vendor': ['zustand', '@tanstack/react-query'],
          
          // Split massive libraries
          'chart-vendor': ['apexcharts', 'react-apexcharts', 'recharts'],
          'date-vendor': ['date-fns', 'react-day-picker'],
          'animation-vendor': ['framer-motion'],
          'form-vendor': ['react-hook-form', 'zod'],

          // UI component libraries
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/css/[name]-[hash].[ext]',
      },
    },
    sourcemap: process.env.NODE_ENV !== 'production',
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
      'axios',
      'date-fns',
    ],
    exclude: ['lucide-react'], // Don't pre-bundle lucide-react to allow tree-shaking
  },
  // Server configuration
  server: {
    port: 5173,
    open: false,
    cors: true,
  },
  // Preview configuration
  preview: {
    port: 4173,
    open: false,
  },
});
