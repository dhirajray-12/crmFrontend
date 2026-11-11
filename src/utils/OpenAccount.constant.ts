export const GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-yellow-400 to-yellow-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-red-600",
];

export const ICONS = ["👥", "📈", "✨", "💎", "👑"];

export const ACCENT_COLORS = ["blue", "emerald", "yellow", "purple", "orange"];

export const ANIMATION_DELAYS = {
  CARD: 100,
  SLIDE_DOWN_200: 200,
  SLIDE_DOWN_400: 400,
  SLIDE_UP_500: 500,
} as const;

export const MT5_ACCOUNT_REGEX = /^\d{7,12}$/;

export const ERROR_MESSAGES = {
  NO_TOKEN: "No authentication token found. Please login again.",
  NO_USER: "User information not found. Please login again.",
  NO_ACCOUNT_TYPE: "Please select an account type.",
  NO_LEVERAGE: "Please select a leverage option.",
  INVALID_MT5:
    "❌ MT5 Account Number must be 7 to 12 digits only (no letters or symbols).",
  NETWORK_ERROR: "Network Error: Cannot connect to your backend",
} as const;
