export interface Account {
  _id?: string;
  id?: string;
  mt5Account?: string;
  accountNumber?: string;
  balance: number;
  equity?: number;
  leverage?: string;
  accountType?: string;
  groupName?: string;
  platform?: string;
  status?: boolean;
  createdAt?: string;
  email?: string;
}

export interface Metric {
  label: string;
  balance: number;
  percentage: number;
  textColor: string;
  barColor: string;
  bgColor: string;
}

export interface ColorScheme {
  textColor: string;
  barColor: string;
  bgColor: string;
}

export const colorSchemes: ColorScheme[] = [
  {
    textColor: "text-orange-600",
    barColor: "bg-gradient-to-r from-orange-400 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    textColor: "text-violet-600",
    barColor: "bg-gradient-to-r from-violet-400 to-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    textColor: "text-emerald-600",
    barColor: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    textColor: "text-blue-600",
    barColor: "bg-gradient-to-r from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    textColor: "text-rose-600",
    barColor: "bg-gradient-to-r from-rose-400 to-rose-600",
    bgColor: "bg-rose-50",
  },
  {
    textColor: "text-cyan-600",
    barColor: "bg-gradient-to-r from-cyan-400 to-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    textColor: "text-amber-600",
    barColor: "bg-gradient-to-r from-amber-400 to-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    textColor: "text-indigo-600",
    barColor: "bg-gradient-to-r from-indigo-400 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
];
