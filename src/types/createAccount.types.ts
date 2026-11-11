import type { LucideIcon } from "lucide-react";
export interface Leverage {
  _id: string;
  value: string;
}

export interface AccountType {
  _id: string;
  name: string;
  value: string;
  description: string;
  leverages: Leverage[];
  platforms: string;
  active: boolean;
}

export interface AccountOption {
  color: string;
  textColor: string;
  bgGradient: string;
  icon: LucideIcon;
}

export interface ColorPaletteItem {
  color: string;
  textColor: string;
  bgGradient: string;
  icon: LucideIcon;
}

export interface CreateAccountModalProps {
  open: boolean;
  onClose: () => void;
  onAccountCreated?: () => void;
}

export interface GroupsApiResponse {
  success: boolean;
  count: number;
  data: AccountType[];
}

export interface CreateAccountApiResponse {
  success: boolean;
  data: {
    _id: string;
    user: string;
    mt5Account: string;
    name: string;
    leverage: string;
    accountType: string;
    groupName: string;
    platform: string;
    balance: number;
    equity: number;
    status: boolean;
  };
  message?: string;
}

export interface CreateAccountPayload {
  leverage: string;
  accountType: string;
  platform: string;
}
