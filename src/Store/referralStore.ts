import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type ReferralStatus = "loading" | "valid" | "invalid";

interface ReferralState {
  // State
  status: ReferralStatus;
  referrerName: string;
  error: string;
  referralCode: string | null;

  // Actions
  setStatus: (status: ReferralStatus) => void;
  setReferrerName: (name: string) => void;
  setError: (error: string) => void;
  setReferralCode: (code: string | null) => void;
  resetReferral: () => void;
}

export const useReferralStore = create<ReferralState>()(
  devtools(
    (set) => ({
      // Initial state
      status: "loading",
      referrerName: "",
      error: "",
      referralCode: null,

      // Actions
      setStatus: (status) => set({ status }),
      setReferrerName: (name) => set({ referrerName: name }),
      setError: (error) => set({ error }),
      setReferralCode: (code) => set({ referralCode: code }),
      resetReferral: () =>
        set({
          status: "loading",
          referrerName: "",
          error: "",
          referralCode: null,
        }),
    }),
    { name: "ReferralStore" },
  ),
);
