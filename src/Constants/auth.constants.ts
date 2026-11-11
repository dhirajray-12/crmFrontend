export const FEATURES = [
  { icon: "⚡", text: "Real-time market data" },
  { icon: "📈", text: "Advanced charting tools" },
  { icon: "🔐", text: "Military-grade encryption" },
  { icon: "💎", text: "Premium trading features" },
] as const;

export const STATS = [
  { number: "99.9%", label: "Uptime" },
  { number: "<10ms", label: "Latency" },
  { number: "24/7", label: "Support" },
] as const;

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  CLIENT: "client",
} as const;
