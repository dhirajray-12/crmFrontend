import type { FilterOption } from "@/types/depositePage.types";
import type { TransferFilterOption } from "@/types/transfer.types";
import type { FilterOptions, WalletOption } from "@/types/WithdrawalPage.types";

export const accountTypeOptions: FilterOption[] = [
  {
    id: "BASIC",
    label: "BASIC",
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-400",
  },
  {
    id: "ALPHA",
    label: "ALPHA",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-400",
  },
  {
    id: "PRIME",
    label: "PRIME",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-400",
  },
  {
    id: "PROEDGE",
    label: "PROEDGE",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-400",
  },
  {
    id: "INFINITY",
    label: "INFINITY",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-400",
  },
];

export const statusOptions: FilterOptions[] = [
  {
    id: "Approved",
    label: "Approved",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-400",
  },
  {
    id: "Pending",
    label: "Pending",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-400",
  },
  {
    id: "Rejected",
    label: "Rejected",
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-red-400",
  },
];

export const withdrawalMethods = ["Bank Transfer", "E-Wallet", "Card (Stripe)"];

export const getWalletOptions = (savedWallets?: any): WalletOption[] => [
  {
    id: "usdt",
    name: "USDT",
    address: savedWallets?.usdt || "",
    description: "Tether USD",
    network: "TRC20 / ERC20",
    fee: "2% + $1",
    processingTime: "1-2 hours",
  },
  {
    id: "tron",
    name: "TRON (TRX)",
    address: savedWallets?.tron || "",
    description: "Tron Network",
    network: "TRC20",
    fee: "1% + $0.50",
    processingTime: "30-60 minutes",
  },
  {
    id: "ethereum",
    name: "Ethereum (ETH)",
    address: savedWallets?.eth || "",
    description: "Ethereum Network",
    network: "ERC20",
    fee: "2% + $3",
    processingTime: "15-30 minutes",
  },
];

export const defaultAccountTypes: TransferFilterOption[] = [
  { value: "BASIC", label: "BASIC", color: "from-blue-400 to-indigo-500" },
  { value: "PRIME", label: "PRIME", color: "from-purple-400 to-pink-500" },
  {
    value: "PROEDGE",
    label: "PROEDGE",
    color: "from-yellow-400 to-orange-500",
  },
  { value: "ALPHA", label: "ALPHA", color: "from-gray-400 to-slate-500" },
  {
    value: "INFINITY",
    label: "INFINITY",
    color: "from-green-400 to-emerald-500",
  },
  { value: "Pro", label: "Pro", color: "from-red-400 to-rose-500" },
];

export const defaultStatusOptions: TransferFilterOption[] = [
  {
    value: "Completed",
    label: "Completed",
    color: "from-green-400 to-emerald-500",
  },
  { value: "Failed", label: "Failed", color: "from-red-400 to-rose-500" },
  { value: "Pending", label: "Pending", color: "from-yellow-400 to-amber-500" },
];

export const API_BASE = import.meta.env.VITE_BACKEND_URL;
