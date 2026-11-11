import {
  TrendingUp,
  Shield,
  Star,
  Zap,
  Crown,
  DollarSign,
  Sparkles,
  Award,
  Target,
} from "lucide-react";
import type { ColorPaletteItem } from "@/types/createAccount.types";

//className="w-5 h-5 sm:w-6 sm:h-6"

export const colorPalette: ColorPaletteItem[] = [
  {
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
    textColor: "text-white",
    bgGradient: "from-blue-100 to-blue-200",
    icon: TrendingUp,
  },
  {
    color: "bg-gradient-to-br from-yellow-400 to-orange-600",
    textColor: "text-white",
    bgGradient: "from-yellow-100 to-orange-200",
    icon: Star,
  },
  {
    color: "bg-gradient-to-br from-purple-500 to-indigo-700",
    textColor: "text-white",
    bgGradient: "from-purple-100 to-indigo-200",
    icon: Crown,
  },
  {
    color: "bg-gradient-to-br from-red-500 to-pink-700",
    textColor: "text-white",
    bgGradient: "from-red-100 to-pink-200",
    icon: Zap,
  },
  {
    color: "bg-gradient-to-br from-gray-600 to-slate-800",
    textColor: "text-white",
    bgGradient: "from-gray-200 to-gray-300",
    icon: Shield,
  },
  {
    color: "bg-gradient-to-br from-emerald-500 to-teal-700",
    textColor: "text-white",
    bgGradient: "from-emerald-100 to-teal-200",
    icon: DollarSign,
  },
  {
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    textColor: "text-white",
    bgGradient: "from-cyan-100 to-blue-200",
    icon: Sparkles,
  },
  {
    color: "bg-gradient-to-br from-amber-500 to-orange-700",
    textColor: "text-white",
    bgGradient: "from-amber-100 to-orange-200",
    icon: Award,
  },
  {
    color: "bg-gradient-to-br from-rose-500 to-red-700",
    textColor: "text-white",
    bgGradient: "from-rose-100 to-red-200",
    icon: Target,
  },
  {
    color: "bg-gradient-to-br from-violet-500 to-purple-700",
    textColor: "text-white",
    bgGradient: "from-violet-100 to-purple-200",
    icon: Sparkles,
  },
];

export const hashStringToIndex = (str: string, arrayLength: number): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % arrayLength;
};

export const getColorScheme = (accountId: string): ColorPaletteItem => {
  const index = hashStringToIndex(accountId, colorPalette.length);
  return colorPalette[index];
};
