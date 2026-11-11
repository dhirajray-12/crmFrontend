// shared/types/account.types.ts - Create this file
// This can be copied to both frontend and backend projects

export interface IAccount {
  _id: string;
  user: string | IUser;
  mt5Account: string;
  investor_pwd: string;
  master_pwd: string;
  name: string;
  leverage: string;
  accountType: string;
  groupName: string;
  platform: string;
  balance: number;  // ✅ Always number
  equity: number;   // ✅ Always number
  status: boolean;
  managerIndex: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'admin' | 'superadmin' | 'agent';
  isEmailVerified: boolean;
  status: 'activated' | 'suspended';
  phone?: string;
  country?: {
    name: string;
    state?: string;
  };
  dateofbirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeposit {
  _id: string;
  user: string | IUser;
  account: string | IAccount;
  amount: number;
  paymentMethod: string;
  paymentType: string;
  proofOfPayment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionId?: string;
  bonus: number;
  remarks?: string;
  requestedDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWithdrawal {
  _id: string;
  user: string | IUser;
  account: string | IAccount;
  accountNumber: string;
  accountType: string;
  amount: number;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
  };
  eWalletDetails?: {
    walletId: string;
    type: string;
  };
  remarks?: string;
  requestedDate: Date;
  approvedDate?: Date;
  rejectedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}