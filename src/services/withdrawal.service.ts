import axios from "axios";
import type {
  Account,
  Withdrawal,
  SavedPayoutDetails,
  WithdrawalAPIResponse,
} from "@/types/WithdrawalPage.types";
import calculateTimeTaken from "@/utils/timetakenUtil";
import { getConfiguredTimezone } from "@/utils/timezoneStore";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const withdrawalApi = {
  fetchAccounts: async (): Promise<Account[]> => {
    const res = await axios.get<WithdrawalAPIResponse>(
      `${API_BASE_URL}/accounts`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    return res.data.data.map((acc: any) => ({
      _id: acc._id,
      account: acc.mt5Account,
      balance: `$${acc.balance.toFixed(2)}`,
      color: "",
      accountType: acc.accountType,
      accountNumber: acc.mt5Account,
      rawBalance: acc.balance,
    }));
  },

  fetchWithdrawals: async (): Promise<Withdrawal[]> => {
    const res = await axios.get<WithdrawalAPIResponse>(
      `${API_BASE_URL}/withdrawals/user`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    return res.data.data.map((item: any) => {
      const processedAt =
        item.approvedDate ??
        item.approvedAt ??
        item.rejectedDate ??
        item.rejectedAt ??
        item.updatedAt;

      const timeZone = getConfiguredTimezone();

      return {
      id: item._id,
      rawDate: new Date(item.createdAt).toLocaleDateString("en-CA", { timeZone }),
      dateInitiated: new Date(item.createdAt).toLocaleDateString(undefined, { timeZone }),
      initiatedtime: new Date(item.createdAt).toLocaleTimeString(undefined, { timeZone }),
      processedtime: processedAt
        ? new Date(processedAt).toLocaleTimeString(undefined, { timeZone })
        : "",
      processedDate: processedAt
        ? new Date(processedAt).toLocaleDateString(undefined, { timeZone })
        : "",
      method:
        item.paymentMethod === "bank"
          ? "Bank Transfer"
          : `E-Wallet (${item.eWalletDetails?.type || ""})`,
      amount: `$${item.amount}`,
      account: item.accountNumber,
      accounttype: item.accountType,
      status: item.status,
      timetaken: processedAt
        ? calculateTimeTaken(item.createdAt, processedAt)
        : "-",
    };
    });
  },

  fetchProfilePayoutDetails: async (): Promise<SavedPayoutDetails> => {
    const res = await axios.get<WithdrawalAPIResponse>(
      `${API_BASE_URL}/profile`,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );

    const profile = res.data.data;
    const w = profile?.walletDetails;
    const b = profile?.bankDetails;

    return {
      bankDetails:
        b?.bankName || b?.accountHolderName || b?.accountNumber || b?.ifscSwiftCode
          ? {
              bankName: b?.bankName || "",
              accountHolderName: b?.accountHolderName || "",
              accountNumber: b?.accountNumber || "",
              ifscCode: b?.ifscSwiftCode || "",
            }
          : null,
      wallets: {
        usdt: w?.tetherWalletAddress || "",
        eth: w?.ethWalletAddress || "",
        tron: w?.trxWalletAddress || "",
      },
    };
  },

  sendOTP: async (requestBody: any) => {
    const res = await axios.post(
      `${API_BASE_URL}/otp/withdrawal/send`,
      requestBody,
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );
    return res.data;
  },

  verifyOTP: async ( otpKey: string, otp: string) => {
    const res = await axios.post(
      `${API_BASE_URL}/otp/withdrawal/verify`,
      { otpKey, otp },
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );
    return res.data;
  },

  resendOTP: async (otpKey: string) => {
    const res = await axios.post(
      `${API_BASE_URL}/otp/withdrawal/resend`,
      { otpKey },
      {
        headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
        withCredentials: true,
      },
    );
    return res.data;
  },

  submitWithdrawal: async (body: any) => {
    const res = await axios.post(`${API_BASE_URL}/withdrawals`, body, {
      headers:{
          "Content-Type": "application/json",
          "x-active-role": sessionStorage.getItem("active_role") || "",
        },
      withCredentials: true,
    });
    return res.data;
  },
};
