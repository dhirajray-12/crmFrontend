import { create } from "zustand";
import type { SignupFormData } from "@/types/auth.types";

interface SignupState {
  formData: SignupFormData;
  validReferral: { code: string; referrerName: string } | null;
  referralError: string;
  open: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setFormData: (data: Partial<SignupFormData>) => void;
  setValidReferral: (
    referral: { code: string; referrerName: string } | null,
  ) => void;
  setReferralError: (error: string) => void;
  setOpen: (open: boolean) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  resetForm: () => void;
}

const initialFormData: SignupFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  dateofbirth: "",
  countryCode: "+1",
  phone: "",
  zipCode: "",
  state: "",
  country: "",
};

export const useSignupStore = create<SignupState>((set) => ({
  formData: initialFormData,
  validReferral: null,
  referralError: "",
  open: false,
  showPassword: false,
  showConfirmPassword: false,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  setValidReferral: (referral) => set({ validReferral: referral }),

  setReferralError: (error) => set({ referralError: error }),

  setOpen: (open) => set({ open }),

  setShowPassword: (show) => set({ showPassword: show }),

  setShowConfirmPassword: (show) => set({ showConfirmPassword: show }),

  resetForm: () =>
    set({
      formData: initialFormData,
      validReferral: null,
      referralError: "",
      open: false,
      showPassword: false,
      showConfirmPassword: false,
    }),
}));
