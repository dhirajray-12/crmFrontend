export interface Leverage {
  _id: string;
  name: string;
  value: string;
}

export interface Group {
  _id: string;
  name: string;
  value: string;
  description: string;
  leverages: Leverage[];
  platforms: string;
}

export interface GroupsAPIResponse {
  success: boolean;
  message: string;
  data: Group[];
}

export interface BackendAccountResponse {
  success: boolean;
  message?: string;
  data: AccountData;
}

export interface AccountType {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  gradient: string;
  accentColor: string;
  server: string;
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AccountFormData {
  leverage: string;
  customMT5Account: string;
  masterPassword: string;
  investorPassword: string;
}

export interface AccountCreationRequest {
  leverage: number;
  accountType: string;
  platform: string;
  customMT5Account: string | null;
  masterPassword: string;
  investorPassword: string;
}

export interface AccountData {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mt5Account: string;
  investor_pwd: string;
  master_pwd: string;
  name: string;
  leverage: string;
  accountType: string;
  groupName: string;
  platform: string;
  balance: number;
  equity: number;
  status: boolean;
  managerIndex: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
